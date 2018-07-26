const deb_rewrite = require('debug')('rewrite');
const deb_query = require('debug')('query');
const deb_math = require('debug')('math');

const moment = require('moment');
const { resolve } = require('url');

const units = [
    'years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds', 'milliseconds', 'quarters',
    'year', 'month', 'week', 'day', 'hour', 'minute', 'second', 'millisecond', 'quarter',
    'y', 'M', 'w', 'd', 'h', 'm', 's', 'ms', 'Q',
];
const shift_re = new RegExp(`[Aa][Ss]\\s+"shift_([0-9]+)_(${units.join('|')})"`);
const from = /(time\s*>=?\s*)([0-9]+)(ms)/;
const to = /(time\s*<=?\s*)([0-9]+)(ms)/;
const from_rel = /(time\s*>=?\s*)(now\(\)\s*-\s*)([0-9]+)([usmhdw])/;
const to_rel = /(time\s*<=?\s*)(now\(\)\s*-\s*)([0-9]+)([usmhdw])/;
const singlestat = /singlestat/;

const math_re = /^MATH /;
const math_name = /name="([0-9a-zA-Z]+)"/;
const math_expr = /expr="([+*/%$0-9. -]+)"/;
const math_keep = /keep="([$0-9, ]+)"/;

function fix_query_time(q, reg, count, unit) {
    const match = q.match(reg);
    if (match) {
        const time = moment(parseInt(match[2], 10));
        time.subtract(count, unit);
        return q.replace(reg, match[1] + time.valueOf() + match[3]);
    }
    return q;
}

function fix_query_time_relative(q, reg, count, unit) {
    const match = q.match(reg);
    if (match) {
        return q.replace(match[0], match[0] + " - " + moment.duration(count, unit).valueOf() + "ms");
    }
    return q;
}

function get_result(results, statement, time) {
    try {
        const found = results[statement].series[0].values.find(function (item) {
            return item[0] === time;
        });
        if (found) {
            return found[1];
        }
    } catch (err) { }
    return null;
}

function calculate_values(results, math) {
    if (math.vars && math.vars.length) {
        const indexes = math.vars.map(function (item) {
            return parseInt(item.substr(1), 10);
        });
        const func = new Function(...math.vars, "return " + math.expr);
        const ret = [];
        try {
            const base = results[indexes[0]].series[0].values;
            base.forEach(function (rec) {
                const digits = [];
                indexes.forEach(function (idx) {
                    digits.push(get_result(results, idx, rec[0]));
                });
                let result = func.apply(this, digits);
                deb_math(rec[0], digits, result);
                if (result === Infinity) {
                    result = null;
                }
                if (isNaN(result)) {
                    result = null;
                }
                ret.push([rec[0], result]);
            });
        } catch (err) {}
        return ret;
    }
    deb_math("No vars found:", math.expr);
    return [];
}

const reLeadingSlash = /^\//;
const reLeadingSemicolon = /^;+/;
const reEveryVar = /\$[0-9]+/g;
const reTwoSemicolon = /;;/;

function forward(path, req, res) {
    if ((req.url.indexOf("/query") === 0) && (req.query.q)) {
        const query = req.query.q.replace(reLeadingSemicolon, '').replace(reTwoSemicolon, '');
        const parts = query.split(';').map((q, idx) => {
            let match;
            deb_query(idx, q);
            match = q.match(math_re);
            if (match) {
                const name_parts = math_name.exec(q);
                const expr_parts = math_expr.exec(q);
                const keep_parts = math_keep.exec(q);
                if (name_parts && expr_parts) {
                    if (!req.proxyMath) {
                        req.proxyMath = {};
                    }
                    req.proxyMath[idx] = {
                        name: name_parts[1],
                        expr: expr_parts[1],
                        vars: expr_parts[1].match(reEveryVar),
                        singlestat: q.match(singlestat),
                        keep: keep_parts ? keep_parts[1].split(',').map(idx => {
                            return parseInt(idx.trim().substring(1), 10);
                        }) : []
                    };
                    return '';
                }
            }
            match = q.match(shift_re);
            if (match) {
                if (!req.proxyShift) {
                    req.proxyShift = {};
                }
                req.proxyShift[idx] = {
                    count: parseInt(match[1], 10),
                    unit: match[2]
                };
                deb_rewrite("<-- " + q);
                let select = fix_query_time(q, from, parseInt(match[1], 10), match[2]);
                select = fix_query_time(select, to, parseInt(match[1], 10), match[2]);
                select = fix_query_time_relative(select, from_rel, parseInt(match[1], 10), match[2]);
                select = fix_query_time_relative(select, to_rel, parseInt(match[1], 10), match[2]);
                deb_rewrite("--> " + select);
                return select;
            } else {
                return q;
            }
        });
        const ret = Object.assign({}, req.query, {
            q: parts.join(';')
        });
        const queries = [];
        for (let key in ret) {
            if (ret.hasOwnProperty(key)) {
                queries.push(key + "=" + encodeURIComponent(ret[key]));
            }
        }
        return resolve(path, "query") + "?" + queries.join("&");
    } else {
        return resolve(path, req.url.replace(reLeadingSlash, ''));
    }
}

function intercept(rsp, data, req, res) {
    if (req.proxyShift || req.proxyMath) {
        const json = JSON.parse(data.toString());
        if (req.proxyMath && json.results) {
            Object.keys(req.proxyMath).forEach(key => {
                json.results.splice(parseInt(key, 10), 0, {
                    statement_id: null,
                    series: []
                });
            });
        }
        if (req.proxyShift && Object.keys(req.proxyShift).length && json.results) {
            const results = json.results.map((result, idx) => {
                if (req.proxyShift[idx] && result.series) {
                    return Object.assign({}, result, {
                        series: result.series.map(serie => {
                            return Object.assign({}, serie, { values: serie.values.map(item => {
                                const time = moment(item[0]);
                                time.add(req.proxyShift[idx].count, req.proxyShift[idx].unit);
                                return [ time.valueOf(), item[1]];
                            })});
                        })
                    });
                }
                return result;
            });
            json.results = results;
        }
        if (req.proxyMath && json.results) {
            Object.keys(req.proxyMath).forEach(key => {
                const math = req.proxyMath[key];
                if (json.results[key]) {
                    deb_math("Do math:", math.expr, "for statement:", key);
                    json.results[key] = {
                        statement_id: null,
                        series: [{
                            name: math.name,
                            columns: ["time", "value"],
                            values: calculate_values(json.results, math)
                        }]
                    };
                    if (math.vars) {
                        math.vars.forEach(item => {
                            const idx = parseInt(item.substr(1), 10);
                            if (math.keep.indexOf(idx) === -1) {
                                if (math.singlestat) {
                                    json.results[idx] = {};
                                } else {
                                    json.results[idx].series[0].values = [];
                                }
                                deb_math("Clear values for statement:", idx);
                            }
                        });
                    }
                }
            });
            json.results.forEach((result, idx) => {
                result.statement_id = idx;
            });
        }
        return JSON.stringify(json);
    }
    return data;
}

module.exports = {
    forward,
    intercept
};
