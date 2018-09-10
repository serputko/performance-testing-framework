/*
	Copyright © 2017-2018 Anton Serputko. Contacts: serputko.a@gmail.com
	  
	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/

/*
 * Scripted dashboard for test results comparison
 * Use with grafana version 5.1.5
 */

'use strict';

// accessible variables in this scope
var window, document, ARGS, $, jQuery, moment, kbn;


return function(callback) {

    // Setup some variables
    var dashboard;

    if (!_.isUndefined(ARGS.from)) {
        ARGS.from = null;
    }

    if (!_.isUndefined(ARGS.to)) {
        ARGS.to = null;
    }
    // Initialize a skeleton with nothing but a rows array and service object
    dashboard = {
        panels: [],
        rows: [],
        services: {}
    };

    // Set a title
    dashboard.title = 'Scripted dash';

    var rows = 1;
    var seriesName = 'argName';

    dashboard.templating = {
        list: [{
                "allFormat": "glob",
                "allValue": null,
                "current": {
                    "selected": true,
                    "text": "jmeter",
                    "value": "jmeter"
                },
                "datasource": "influxdb_timeshift_proxy",
                "hide": 0,
                "includeAll": false,
                "label": null,
                "multi": false,
                "name": "measurement",
                "options": [],
                "query": "SHOW MEASUREMENTS",
                "refresh": 1,
                "regex": "",
                "sort": 2,
                "tagValuesQuery": "",
                "tags": [],
                "tagsQuery": "",
                "type": "query",
                "useTags": false
            },
            {
                "allFormat": "glob",
                "allValue": null,
                "current": {
                    "selected": true,
                    "text": "avg",
                    "value": "avg"
                },
                "datasource": null,
                "hide": 0,
                "includeAll": false,
                "label": null,
                "multi": false,
                "name": "metric",
                "options": [{
                        "selected": true,
                        "text": "avg",
                        "value": "avg"
                    },
                    {
                        "selected": false,
                        "text": "min",
                        "value": "min"
                    },
                    {
                        "selected": false,
                        "text": "max",
                        "value": "max"
                    },
                    {
                        "selected": false,
                        "text": "pct90.0",
                        "value": "pct90.0"
                    },
                    {
                        "selected": false,
                        "text": "pct95.0",
                        "value": "pct95.0"
                    },
                    {
                        "selected": false,
                        "text": "pct99.0",
                        "value": "pct99.0"
                    }
                ],
                "query": "avg,min,max,pct90.0,pct95.0,pct99.0",
                "refresh": 0,
                "type": "custom"
            },
            {
                "allFormat": "glob",
                "allValue": null,
                "current": {
                    "text": "All",
                    "value": "$__all"
                },
                "datasource": "influxdb_timeshift_proxy",
                "hide": 0,
                "includeAll": true,
                "label": null,
                "multi": true,
                "name": "transactions",
                "options": [],
                "query": "SHOW TAG VALUES WITH KEY = \"transaction\" where transaction !~ /(internal|all|\\/)/ and application =~ /$tag_left|$tag_right/",
                "refresh": 1,
                "regex": "",
                "sort": 0,
                "tagValuesQuery": "SHOW TAG VALUES WITH KEY = \"transaction\" where transaction !~ /(internal|all|\\/)/ and application=~ /$tag/",
                "tags": [],
                "tagsQuery": "SHOW TAG VALUES WITH key = \"application\"",
                "type": "query",
                "useTags": false
            },
            {
                "allFormat": "glob",
                "allValue": null,
                "current": {
                    "selected": true,
                    "text": "All",
                    "value": "$__all"
                },
                "datasource": "influxdb_timeshift_proxy",
                "hide": 0,
                "includeAll": true,
                "label": null,
                "multi": true,
                "name": "host",
                "options": [],
                "query": "show tag values with key=host",
                "refresh": 1,
                "regex": "",
                "sort": 0,
                "tagValuesQuery": "",
                "tags": [],
                "tagsQuery": "",
                "type": "query",
                "useTags": false
            },
            {
                "allFormat": "glob",
                "auto": true,
                "auto_count": 30,
                "auto_min": "1s",
                "current": {
                    "text": "5s",
                    "value": "5s"
                },
                "datasource": null,
                "hide": 0,
                "label": null,
                "name": "group_time",
                "options": [{
                        "selected": false,
                        "text": "auto",
                        "value": "$__auto_interval_group_time"
                    },
                    {
                        "selected": true,
                        "text": "5s",
                        "value": "5s"
                    },
                    {
                        "selected": false,
                        "text": "10s",
                        "value": "10s"
                    },
                    {
                        "selected": false,
                        "text": "30s",
                        "value": "30s"
                    },
                    {
                        "selected": false,
                        "text": "1m",
                        "value": "1m"
                    },
                    {
                        "selected": false,
                        "text": "5m",
                        "value": "5m"
                    },
                    {
                        "selected": false,
                        "text": "15m",
                        "value": "15m"
                    }
                ],
                "query": "5s,10s,30s,1m,5m,15m",
                "refresh": 2,
                "type": "interval"
            },
            {
                "allFormat": "glob",
                "allValue": null,
                "current": {
                    "tags": [],
                    "text": "compare_results.jmx",
                    "value": "compare_results.jmx"
                },
                "datasource": "influxdb_timeshift_proxy",
                "hide": 0,
                "includeAll": true,
                "label": "scenario",
                "multi": false,
                "name": "scenario",
                "options": [],
                "query": "SHOW TAG VALUES FROM jmeter WITH key = \"application\"",
                "refresh": 1,
                "regex": "/(.*?) @/",
                "sort": 3,
                "tagValuesQuery": "",
                "tags": [],
                "tagsQuery": "",
                "type": "query",
                "useTags": false
            },
            {
                "allFormat": "glob",
                "allValue": null,
                "current": {
                    "text": "",
                    "value": ""
                },
                "datasource": "influxdb_timeshift_proxy",
                "hide": 0,
                "includeAll": false,
                "label": "Left run",
                "multi": false,
                "name": "tag_left",
                "options": [],
                "query": "SHOW TAG VALUES FROM jmeter WITH key = \"application\" WHERE application =~ /^$scenario @/",
                "refresh": 1,
                "regex": "",
                "sort": 3,
                "tagValuesQuery": "",
                "tags": [],
                "tagsQuery": "",
                "type": "query",
                "useTags": false
            },
            {
                "allFormat": "glob",
                "allValue": null,
                "current": {
                    "text": "1529069879714",
                    "value": "1529069879714"
                },
                "datasource": "influxdb_timeshift_proxy",
                "hide": 2,
                "includeAll": false,
                "label": null,
                "multi": false,
                "name": "start_time_left",
                "options": [],
                "query": "SELECT * FROM jmeter WHERE application =~ /$tag_left/ ORDER BY time asc LIMIT 1",
                "refresh": 1,
                "regex": "",
                "sort": 0,
                "tagValuesQuery": "",
                "tags": [],
                "tagsQuery": "",
                "type": "query",
                "useTags": false
            },
            {
                "allFormat": "glob",
                "allValue": null,
                "current": {
                    "text": "1529069897365",
                    "value": "1529069897365"
                },
                "datasource": "influxdb_timeshift_proxy",
                "hide": 2,
                "includeAll": false,
                "label": null,
                "multi": false,
                "name": "end_time_left",
                "options": [],
                "query": "SELECT * FROM jmeter WHERE application =~ /$tag_left/ ORDER BY time desc LIMIT 1",
                "refresh": 1,
                "regex": "",
                "sort": 0,
                "tagValuesQuery": "",
                "tags": [],
                "tagsQuery": "",
                "type": "query",
                "useTags": false
            },
            {
                "allFormat": "glob",
                "allValue": null,
                "current": {
                    "text": "",
                    "value": ""
                },
                "datasource": "influxdb_timeshift_proxy",
                "hide": 0,
                "includeAll": false,
                "label": "Right run",
                "multi": false,
                "name": "tag_right",
                "options": [],
                "query": "SHOW TAG VALUES FROM jmeter WITH key = \"application\" WHERE application =~ /^$scenario @/",
                "refresh": 1,
                "regex": "",
                "sort": 3,
                "tagValuesQuery": "",
                "tags": [],
                "tagsQuery": "",
                "type": "query",
                "useTags": false
            },
            {
                "allFormat": "glob",
                "allValue": null,
                "current": {
                    "text": "1529069879714",
                    "value": "1529069879714"
                },
                "datasource": "influxdb_timeshift_proxy",
                "hide": 2,
                "includeAll": false,
                "label": null,
                "multi": false,
                "name": "start_time_right",
                "options": [],
                "query": "SELECT * FROM jmeter WHERE application =~ /$tag_right/ ORDER BY time asc LIMIT 1",
                "refresh": 1,
                "regex": "",
                "sort": 0,
                "tagValuesQuery": "",
                "tags": [],
                "tagsQuery": "",
                "type": "query",
                "useTags": false
            },
            {
                "allFormat": "glob",
                "allValue": null,
                "current": {
                    "text": "1529069897365",
                    "value": "1529069897365"
                },
                "datasource": "influxdb_timeshift_proxy",
                "hide": 2,
                "includeAll": false,
                "label": null,
                "multi": false,
                "name": "end_time_right",
                "options": [],
                "query": "SELECT * FROM jmeter WHERE application =~ /$tag_right/ ORDER BY time desc LIMIT 1",
                "refresh": 1,
                "regex": "",
                "sort": 0,
                "tagValuesQuery": "",
                "tags": [],
                "tagsQuery": "",
                "type": "query",
                "useTags": false
            }
        ]
    };

    var start_time_left, start_time_right, end_time_left, end_time_right, tag_left, tag_right;


    /* 
       Set default time
       time can be overridden in the url using from/to parameters, but this is
       handled automatically in grafana core during dashboard initialization
    */
    if (!_.isUndefined(ARGS["var-tag_left"])) {
        start_time_left = parseInt(ARGS["var-start_time_left"]);
        end_time_left = parseInt(ARGS["var-end_time_left"]);
        start_time_right = parseInt(ARGS["var-start_time_right"]);
        end_time_right = parseInt(ARGS["var-end_time_right"]);
        tag_left = ARGS["var-tag_left"];
        tag_right = ARGS["var-tag_right"];
        dashboard.time = {
            from: new Date(start_time_right),
            to: new Date(end_time_right)
        };


        if (!_.isUndefined(ARGS.name)) {
            seriesName = ARGS.name;
        }


        $.ajax({
                method: 'GET',
                url: '/'
            })
            .done(function(result) {

                var shift = function() { return start_time_right - start_time_left }

                // Text panel for Reset changes
                dashboard.panels.push({
                    "type": "text",
                    "title": "",
                    "gridPos": {
                        "x": 0,
                        "y": 0,
                        "w": 24,
                        "h": 2
                    },
                    "id": 32,
                    "mode": "html",
                    "content": "<h3><a href=" + location.protocol + '//' + location.host + location.pathname + " onclick=\"location.reload()\">Reset</a> selected test runs or <button onclick=\"window.location.reload()\" type=\"button\" style=\"border: solid; display:inline; background-color: inherit;padding: 0px 20px;font-size: 16px;cursor: pointer;display: inline-block;color: green;\">apply new selected run</button></h3>"
                });

                /* 
                    Summary diff row 
                    Includes:
                        - Transactions count diff
                        - Active threads over time
                        - Number of users
                        - Errors count diff
                        - Average throughput diff
                        - Error count trend diff

                */
                dashboard.panels.push({
                    "collapsed": true,
                    "gridPos": {
                        "h": 1,
                        "w": 24,
                        "x": 400,
                        "y": 200
                    },
                    "id": 1,
                    "panels": [
                        // Transactions count diff
                        {
                            "cacheTimeout": null,
                            "colorBackground": false,
                            "colorValue": true,
                            "colors": [
                                "rgba(245, 54, 54, 0.9)",
                                "rgb(255, 222, 0)",
                                "rgba(50, 172, 45, 0.97)"
                            ],
                            "datasource": "influxdb_timeshift_proxy",
                            "format": "none",
                            "gauge": {
                                "maxValue": 100,
                                "minValue": 0,
                                "show": false,
                                "thresholdLabels": false,
                                "thresholdMarkers": true
                            },
                            "id": 768,
                            "interval": null,
                            "links": [],
                            "mappingType": 1,
                            "mappingTypes": [{
                                    "name": "value to text",
                                    "value": 1
                                },
                                {
                                    "name": "range to text",
                                    "value": 2
                                }
                            ],
                            "maxDataPoints": 100,
                            "nullPointMode": "connected",
                            "nullText": null,
                            "postfix": "",
                            "postfixFontSize": "70%",
                            "prefix": "",
                            "prefixFontSize": "50%",
                            "rangeMaps": [{
                                "from": "null",
                                "text": "N/A",
                                "to": "null"
                            }],
                            "sparkline": {
                                "fillColor": "rgba(94, 31, 189, 0.18)",
                                "full": false,
                                "lineColor": "rgb(196, 255, 0)",
                                "show": true
                            },
                            "tableColumn": "",
                            "targets": [{
                                    "dsType": "influxdb",
                                    "groupBy": [{
                                            "params": [
                                                "$__interval"
                                            ],
                                            "type": "time"
                                        },
                                        {
                                            "params": [
                                                "null"
                                            ],
                                            "type": "fill"
                                        }
                                    ],
                                    "orderByTime": "ASC",
                                    "policy": "default",
                                    "query": "SELECT sum(\"count\") FROM \"$measurement\" WHERE \"transaction\"='all' AND time >= [[start_time_right]]000000 and time <= [[end_time_right]]000000 AND \"application\" =~ /$tag_right/",
                                    "rawQuery": true,
                                    "refId": "A",
                                    "resultFormat": "time_series",
                                    "select": [
                                        [{
                                                "params": [
                                                    "value"
                                                ],
                                                "type": "field"
                                            },
                                            {
                                                "params": [],
                                                "type": "mean"
                                            }
                                        ]
                                    ],
                                    "tags": [],
                                    "hide": false
                                },
                                {
                                    "dsType": "influxdb",
                                    "groupBy": [{
                                            "params": [
                                                "$__interval"
                                            ],
                                            "type": "time"
                                        },
                                        {
                                            "params": [
                                                "null"
                                            ],
                                            "type": "fill"
                                        }
                                    ],
                                    "orderByTime": "ASC",
                                    "policy": "default",
                                    "query": "SELECT sum(\"count\") AS \"shift_" + shift() + "_ms\" FROM \"$measurement\" WHERE \"transaction\"='all' AND time >= [[start_time_left]]000000 and time <= [[end_time_left]]000000 AND \"application\" =~ /$tag_left/",
                                    "rawQuery": true,
                                    "refId": "B",
                                    "resultFormat": "time_series",
                                    "select": [
                                        [{
                                                "params": [
                                                    "value"
                                                ],
                                                "type": "field"
                                            },
                                            {
                                                "params": [],
                                                "type": "mean"
                                            }
                                        ]
                                    ],
                                    "tags": [],
                                    "hide": false
                                },
                                {
                                    "dsType": "influxdb",
                                    "groupBy": [{
                                            "params": [
                                                "$__interval"
                                            ],
                                            "type": "time"
                                        },
                                        {
                                            "params": [
                                                "null"
                                            ],
                                            "type": "fill"
                                        }
                                    ],
                                    "orderByTime": "ASC",
                                    "policy": "default",
                                    "query": "MATH name=\"ALL\" expr=\"$0 - $1\" singlestat",
                                    "rawQuery": true,
                                    "refId": "C",
                                    "resultFormat": "time_series",
                                    "select": [
                                        [{
                                                "params": [
                                                    "value"
                                                ],
                                                "type": "field"
                                            },
                                            {
                                                "params": [],
                                                "type": "mean"
                                            }
                                        ]
                                    ],
                                    "tags": [],
                                    "hide": false
                                }
                            ],
                            "thresholds": "-10,10",
                            "title": "Transactions count diff",
                            "transparent": false,
                            "type": "singlestat",
                            "valueFontSize": "80%",
                            "valueMaps": [{
                                "op": "=",
                                "text": "N/A",
                                "value": "null"
                            }],
                            "valueName": "total",
                            "gridPos": {
                                "x": 0,
                                "y": 0,
                                "w": 6,
                                "h": 6
                            }
                        },
                        // Number of users
                        {
                            "cacheTimeout": null,
                            "colorBackground": false,
                            "colorValue": true,
                            "colors": [
                                "rgba(245, 54, 54, 0.9)",
                                "rgb(255, 222, 0)",
                                "rgba(50, 172, 45, 0.97)"
                            ],
                            "datasource": "influxdb_timeshift_proxy",
                            "format": "short",
                            "gauge": {
                                "maxValue": 100,
                                "minValue": 0,
                                "show": false,
                                "thresholdLabels": false,
                                "thresholdMarkers": true
                            },
                            "gridPos": {
                                "x": 6,
                                "y": 0,
                                "w": 6,
                                "h": 6
                            },
                            "height": "250",
                            "id": 45,
                            "interval": null,
                            "links": [],
                            "mappingType": 1,
                            "mappingTypes": [{
                                    "name": "value to text",
                                    "value": 1
                                },
                                {
                                    "name": "range to text",
                                    "value": 2
                                }
                            ],
                            "maxDataPoints": 100,
                            "nullPointMode": "connected",
                            "nullText": null,
                            "postfix": "",
                            "postfixFontSize": "50%",
                            "prefix": "",
                            "prefixFontSize": "50%",
                            "rangeMaps": [],
                            "sparkline": {
                                "fillColor": "rgba(73, 173, 255, 0.18)",
                                "full": false,
                                "lineColor": "rgb(255, 250, 0)",
                                "show": true
                            },
                            "tableColumn": "",
                            "targets": [{
                                "dsType": "influxdb",
                                "groupBy": [{
                                        "params": [
                                            "$__interval"
                                        ],
                                        "type": "time"
                                    },
                                    {
                                        "params": [
                                            "null"
                                        ],
                                        "type": "fill"
                                    }
                                ],
                                "orderByTime": "ASC",
                                "policy": "default",
                                "query": "select difference(*) from(SELECT last(\"startedT\") FROM \"jmeter\" WHERE \"transaction\"='internal' AND \"application\" =~ /($tag_left|$tag_right)/ GROUP BY application)",
                                "rawQuery": true,
                                "refId": "A",
                                "resultFormat": "time_series",
                                "select": [
                                    [{
                                            "params": [
                                                "value"
                                            ],
                                            "type": "field"
                                        },
                                        {
                                            "params": [],
                                            "type": "mean"
                                        }
                                    ]
                                ],
                                "tags": []
                            }],
                            "thresholds": "-10,10",
                            "title": "Number of users",
                            "transparent": false,
                            "type": "singlestat",
                            "valueFontSize": "80%",
                            "valueMaps": [{
                                "op": "=",
                                "text": "N/A",
                                "value": "null"
                            }],
                            "valueName": "current"
                        },
                        // Errors count diff
                        {
                            "cacheTimeout": null,
                            "colorBackground": false,
                            "colorValue": true,
                            "colors": [
                                "rgba(96, 245, 54, 0.9)",
                                "#cca300",
                                "#890f02"
                            ],
                            "datasource": "influxdb_timeshift_proxy",
                            "format": "none",
                            "gauge": {
                                "maxValue": 100,
                                "minValue": 0,
                                "show": false,
                                "thresholdLabels": false,
                                "thresholdMarkers": true
                            },
                            "id": 87,
                            "interval": null,
                            "links": [],
                            "mappingType": 1,
                            "mappingTypes": [{
                                    "name": "value to text",
                                    "value": 1
                                },
                                {
                                    "name": "range to text",
                                    "value": 2
                                }
                            ],
                            "maxDataPoints": 100,
                            "nullPointMode": "connected",
                            "nullText": null,
                            "postfix": "",
                            "postfixFontSize": "70%",
                            "prefix": "",
                            "prefixFontSize": "50%",
                            "rangeMaps": [{
                                "from": "null",
                                "text": "N/A",
                                "to": "null"
                            }],
                            "sparkline": {
                                "fillColor": "rgba(94, 31, 189, 0.18)",
                                "full": false,
                                "lineColor": "rgb(196, 255, 0)",
                                "show": true
                            },
                            "tableColumn": "",
                            "targets": [{
                                    "dsType": "influxdb",
                                    "groupBy": [{
                                            "params": [
                                                "$__interval"
                                            ],
                                            "type": "time"
                                        },
                                        {
                                            "params": [
                                                "null"
                                            ],
                                            "type": "fill"
                                        }
                                    ],
                                    "orderByTime": "ASC",
                                    "policy": "default",
                                    "query": "SELECT sum(\"countError\") FROM \"$measurement\" WHERE \"transaction\"='all' AND time >= [[start_time_right]]000000 and time <= [[end_time_right]]000000 AND \"application\" =~ /$tag_right/",
                                    "rawQuery": true,
                                    "refId": "A",
                                    "resultFormat": "time_series",
                                    "select": [
                                        [{
                                                "params": [
                                                    "value"
                                                ],
                                                "type": "field"
                                            },
                                            {
                                                "params": [],
                                                "type": "mean"
                                            }
                                        ]
                                    ],
                                    "tags": [],
                                    "hide": false
                                },
                                {
                                    "dsType": "influxdb",
                                    "groupBy": [{
                                            "params": [
                                                "$__interval"
                                            ],
                                            "type": "time"
                                        },
                                        {
                                            "params": [
                                                "null"
                                            ],
                                            "type": "fill"
                                        }
                                    ],
                                    "orderByTime": "ASC",
                                    "policy": "default",
                                    "query": "SELECT sum(\"countError\") AS \"shift_" + shift() + "_ms\" FROM \"$measurement\" WHERE \"transaction\"='all' AND time >= [[start_time_left]]000000 and time <= [[end_time_left]]000000 AND \"application\" =~ /$tag_left/",
                                    "rawQuery": true,
                                    "refId": "B",
                                    "resultFormat": "time_series",
                                    "select": [
                                        [{
                                                "params": [
                                                    "value"
                                                ],
                                                "type": "field"
                                            },
                                            {
                                                "params": [],
                                                "type": "mean"
                                            }
                                        ]
                                    ],
                                    "tags": [],
                                    "hide": false
                                },
                                {
                                    "dsType": "influxdb",
                                    "groupBy": [{
                                            "params": [
                                                "$__interval"
                                            ],
                                            "type": "time"
                                        },
                                        {
                                            "params": [
                                                "null"
                                            ],
                                            "type": "fill"
                                        }
                                    ],
                                    "orderByTime": "ASC",
                                    "policy": "default",
                                    "query": "MATH name=\"ALL\" expr=\"$0 - $1\" singlestat",
                                    "rawQuery": true,
                                    "refId": "C",
                                    "resultFormat": "time_series",
                                    "select": [
                                        [{
                                                "params": [
                                                    "value"
                                                ],
                                                "type": "field"
                                            },
                                            {
                                                "params": [],
                                                "type": "mean"
                                            }
                                        ]
                                    ],
                                    "tags": [],
                                    "hide": false
                                }
                            ],
                            "thresholds": "-10,10",
                            "title": "Errors count diff",
                            "transparent": false,
                            "type": "singlestat",
                            "valueFontSize": "80%",
                            "valueMaps": [{
                                "op": "=",
                                "text": "N/A",
                                "value": "null"
                            }],
                            "valueName": "total",
                            "gridPos": {
                                "x": 12,
                                "y": 0,
                                "w": 6,
                                "h": 6
                            }
                        },
                        // Average throughput diff
                        {
                            "cacheTimeout": null,
                            "colorBackground": false,
                            "colorValue": true,
                            "colors": [
                                "rgba(245, 54, 54, 0.9)",
                                "rgb(255, 222, 0)",
                                "rgba(50, 172, 45, 0.97)"
                            ],
                            "datasource": "influxdb_timeshift_proxy",
                            "format": "short",
                            "gauge": {
                                "maxValue": 100,
                                "minValue": 0,
                                "show": false,
                                "thresholdLabels": false,
                                "thresholdMarkers": true
                            },
                            "gridPos": {
                                "x": 18,
                                "y": 0,
                                "w": 6,
                                "h": 6
                            },
                            "height": "250",
                            "id": 733,
                            "interval": null,
                            "links": [],
                            "mappingType": 1,
                            "mappingTypes": [{
                                    "name": "value to text",
                                    "value": 1
                                },
                                {
                                    "name": "range to text",
                                    "value": 2
                                }
                            ],
                            "maxDataPoints": 100,
                            "nullPointMode": "connected",
                            "nullText": null,
                            "postfix": "",
                            "postfixFontSize": "50%",
                            "prefix": "",
                            "prefixFontSize": "50%",
                            "rangeMaps": [],
                            "sparkline": {
                                "fillColor": "rgba(73, 173, 255, 0.18)",
                                "full": false,
                                "lineColor": "rgb(255, 250, 0)",
                                "show": false
                            },
                            "tableColumn": "",
                            "targets": [{
                                    "dsType": "influxdb",
                                    "groupBy": [{
                                            "params": [
                                                "$__interval"
                                            ],
                                            "type": "time"
                                        },
                                        {
                                            "params": [
                                                "null"
                                            ],
                                            "type": "fill"
                                        }
                                    ],
                                    "orderByTime": "ASC",
                                    "policy": "default",
                                    "query": "SELECT mean(last) FROM (SELECT  last(\"count\")/5 FROM \"jmeter\" WHERE \"transaction\" = 'all' AND time >= [[start_time_right]]000000 and time <= [[end_time_right]]000000 AND \"application\" =~ /$tag_right/ GROUP BY time(5s), application fill(null)) GROUP BY application",
                                    "rawQuery": true,
                                    "refId": "A",
                                    "resultFormat": "time_series",
                                    "select": [
                                        [{
                                                "params": [
                                                    "value"
                                                ],
                                                "type": "field"
                                            },
                                            {
                                                "params": [],
                                                "type": "mean"
                                            }
                                        ]
                                    ],
                                    "tags": []
                                },
                                {
                                    "dsType": "influxdb",
                                    "groupBy": [{
                                            "params": [
                                                "$__interval"
                                            ],
                                            "type": "time"
                                        },
                                        {
                                            "params": [
                                                "null"
                                            ],
                                            "type": "fill"
                                        }
                                    ],
                                    "orderByTime": "ASC",
                                    "policy": "default",
                                    "query": "SELECT mean(last) FROM (SELECT  last(\"count\")/5 FROM \"jmeter\" WHERE \"transaction\" = 'all' AND time >= [[start_time_left]]000000 and time <= [[end_time_left]]000000 AND \"application\" =~ /$tag_left/ GROUP BY time(5s), application fill(null)) GROUP BY application",
                                    "rawQuery": true,
                                    "refId": "B",
                                    "resultFormat": "time_series",
                                    "select": [
                                        [{
                                                "params": [
                                                    "value"
                                                ],
                                                "type": "field"
                                            },
                                            {
                                                "params": [],
                                                "type": "mean"
                                            }
                                        ]
                                    ],
                                    "tags": []
                                },
                                {
                                    "dsType": "influxdb",
                                    "groupBy": [{
                                            "params": [
                                                "$__interval"
                                            ],
                                            "type": "time"
                                        },
                                        {
                                            "params": [
                                                "null"
                                            ],
                                            "type": "fill"
                                        }
                                    ],
                                    "orderByTime": "ASC",
                                    "policy": "default",
                                    "query": "MATH name=\"ALL\" expr=\"$0 - $1\" singlestat",
                                    "rawQuery": true,
                                    "refId": "C",
                                    "resultFormat": "time_series",
                                    "select": [
                                        [{
                                                "params": [
                                                    "value"
                                                ],
                                                "type": "field"
                                            },
                                            {
                                                "params": [],
                                                "type": "mean"
                                            }
                                        ]
                                    ],
                                    "tags": []
                                }
                            ],
                            "thresholds": "-10,10",
                            "title": "Avg throughput diff(rps)",
                            "transparent": false,
                            "type": "singlestat",
                            "valueFontSize": "80%",
                            "valueMaps": [{
                                "op": "=",
                                "text": "N/A",
                                "value": "null"
                            }],
                            "valueName": "avg"
                        },
                        // Active threads over time
                        {
                            "aliasColors": {
                                "jmeter.activeThreads": "#e5ac0e",
                                "jmeter.countError": "#BF1B00",
                                "jmeter.minAT": "#EAB839"
                            },
                            "bars": false,
                            "dashLength": 10,
                            "dashes": false,
                            "datasource": "influxdb_timeshift_proxy",
                            "fill": 1,
                            "gridPos": {
                                "x": 0,
                                "y": 1,
                                "w": 12,
                                "h": 8
                            },
                            "id": 94,
                            "legend": {
                                "avg": false,
                                "current": false,
                                "max": true,
                                "min": false,
                                "show": true,
                                "total": false,
                                "values": true
                            },
                            "lines": true,
                            "linewidth": 3,
                            "links": [],
                            "nullPointMode": "null",
                            "percentage": false,
                            "pointradius": 5,
                            "points": false,
                            "renderer": "flot",
                            "seriesOverrides": [{
                                    "alias": "$tag_right Active threads in " + tag_right,
                                    "color": "rgb(205, 255, 0)",
                                    "dashes": true,
                                    "fill": 3
                                },
                                {
                                    "alias": "$tag_left Active threads in " + tag_left,
                                    "fill": 3,
                                    "dashes": true,
                                    "color": "#6ed0e0"
                                }
                            ],
                            "spaceLength": 10,
                            "stack": false,
                            "steppedLine": false,
                            "targets": [{
                                    "$$hashKey": "object:322",
                                    "alias": "$tag_right Active threads in " + tag_right,
                                    "dsType": "influxdb",
                                    "groupBy": [{
                                            "params": [
                                                "$__interval"   
                                            ],
                                            "type": "time"
                                        },
                                        {
                                            "params": [
                                                "null"
                                            ],
                                            "type": "fill"
                                        }
                                    ],
                                    "orderByTime": "ASC",
                                    "policy": "default",
                                    "query": "SELECT last(\"startedT\")-last(\"endedT\") as \"Active threads\" FROM \"$measurement\" WHERE \"transaction\"='internal' AND time >= [[start_time_right]]000000 and time <= [[end_time_right]]000000 AND \"application\" =~ /$tag_right/ group by time($group_time) ",
                                    "rawQuery": true,
                                    "refId": "A",
                                    "resultFormat": "time_series",
                                    "select": [
                                        [{
                                                "params": [
                                                    "value"
                                                ],
                                                "type": "field"
                                            },
                                            {
                                                "params": [],
                                                "type": "mean"
                                            }
                                        ]
                                    ],
                                    "tags": []
                                },
                                {
                                    "$$hashKey": "object:333",
                                    "alias": "$tag_left Active threads in " + tag_left,
                                    "dsType": "influxdb",
                                    "groupBy": [{
                                            "params": [
                                                "$__interval"
                                            ],
                                            "type": "time"
                                        },
                                        {
                                            "params": [
                                                "null"
                                            ],
                                            "type": "fill"
                                        }
                                    ],
                                    "orderByTime": "ASC",
                                    "policy": "default",
                                    "query": "SELECT last(\"startedT\")-last(\"endedT\") AS \"shift_" + shift() + "_ms\" FROM \"$measurement\" WHERE \"transaction\"='internal' AND time >= [[start_time_left]]000000 and time <= [[end_time_left]]000000 AND \"application\" =~ /$tag_left/ group by time($group_time) ",
                                    "rawQuery": true,
                                    "refId": "B",
                                    "resultFormat": "time_series",
                                    "select": [
                                        [{
                                                "params": [
                                                    "value"
                                                ],
                                                "type": "field"
                                            },
                                            {
                                                "params": [],
                                                "type": "mean"
                                            }
                                        ]
                                    ],
                                    "tags": []
                                }
                            ],
                            "thresholds": [],
                            "timeFrom": null,
                            "timeShift": null,
                            "title": "Active threads over time",
                            "tooltip": {
                                "shared": true,
                                "sort": 0,
                                "value_type": "individual"
                            },
                            "transparent": false,
                            "type": "graph",
                            "xaxis": {
                                "buckets": null,
                                "mode": "time",
                                "name": null,
                                "show": true,
                                "values": []
                            },
                            "yaxes": [{
                                    "format": "short",
                                    "label": "Number of users",
                                    "logBase": 1,
                                    "max": null,
                                    "min": "0",
                                    "show": true
                                },
                                {
                                    "format": "short",
                                    "label": null,
                                    "logBase": 1,
                                    "max": null,
                                    "min": null,
                                    "show": false
                                }
                            ],
                            "yaxis": {
                                "align": false,
                                "alignLevel": null
                            }
                        },
                        // Error count trend diff
                        {
                            "aliasColors": {},
                            "bars": false,
                            "dashLength": 10,
                            "dashes": false,
                            "datasource": "influxdb_timeshift_proxy",
                            "fill": 1,
                            "height": "350",
                            "id": 769,
                            "interval": "",
                            "legend": {
                                "alignAsTable": true,
                                "avg": false,
                                "current": true,
                                "hideEmpty": false,
                                "hideZero": false,
                                "max": true,
                                "min": true,
                                "rightSide": false,
                                "show": true,
                                "total": false,
                                "values": true
                            },
                            "lines": true,
                            "linewidth": 2,
                            "links": [],
                            "minSpan": 12,
                            "nullPointMode": "null",
                            "percentage": false,
                            "pointradius": 5,
                            "points": false,
                            "renderer": "flot",
                            "repeat": null,
                            "seriesOverrides": [{
                                    "alias": "$tag_right Error count trend " + tag_right,
                                    "fill": 3,
                                    "color": "#890f02"
                                },
                                {
                                    "alias": "$tag_left Error count trend " + tag_left,
                                    "color": "#cca300",
                                    "fill": 3
                                }
                            ],
                            "spaceLength": 10,
                            "stack": false,
                            "steppedLine": false,
                            "targets": [{
                                    "alias": "$tag_right Error count trend " + tag_right,
                                    "dsType": "influxdb",
                                    "groupBy": [{
                                            "params": [
                                                "$__interval"
                                            ],
                                            "type": "time"
                                        },
                                        {
                                            "params": [
                                                "null"
                                            ],
                                            "type": "fill"
                                        }
                                    ],
                                    "hide": false,
                                    "orderByTime": "ASC",
                                    "policy": "default",
                                    "query": "SELECT sum(\"countError\")  FROM \"$measurement\" WHERE \"transaction\"='all' AND \"statut\"='all' AND time >= [[start_time_right]]000000 and time <= [[end_time_right]]000000 AND \"application\" =~ /$tag_right/ group by time($group_time)",
                                    "rawQuery": true,
                                    "refId": "A",
                                    "resultFormat": "time_series",
                                    "select": [
                                        [{
                                                "params": [
                                                    "value"
                                                ],
                                                "type": "field"
                                            },
                                            {
                                                "params": [],
                                                "type": "mean"
                                            }
                                        ]
                                    ],
                                    "tags": []
                                },
                                {
                                    "alias": "$tag_left Error count trend " + tag_left,
                                    "dsType": "influxdb",
                                    "groupBy": [{
                                            "params": [
                                                "$__interval"
                                            ],
                                            "type": "time"
                                        },
                                        {
                                            "params": [
                                                "null"
                                            ],
                                            "type": "fill"
                                        }
                                    ],
                                    "hide": false,
                                    "orderByTime": "ASC",
                                    "policy": "default",
                                    "query": "SELECT sum(\"countError\") AS \"shift_" + shift() + "_ms\"  FROM \"$measurement\" WHERE \"transaction\"='all' AND \"statut\"='all' AND time >= [[start_time_left]]000000 and time <= [[end_time_left]]000000 AND \"application\" =~ /$tag_left/ group by time($group_time)",
                                    "rawQuery": true,
                                    "refId": "B",
                                    "resultFormat": "time_series",
                                    "select": [
                                        [{
                                                "params": [
                                                    "value"
                                                ],
                                                "type": "field"
                                            },
                                            {
                                                "params": [],
                                                "type": "mean"
                                            }
                                        ]
                                    ],
                                    "tags": []
                                }
                            ],
                            "thresholds": [],
                            "timeFrom": null,
                            "timeShift": null,
                            "title": "Error trend diff",
                            "tooltip": {
                                "shared": true,
                                "sort": 0,
                                "value_type": "individual"
                            },
                            "transparent": false,
                            "type": "graph",
                            "xaxis": {
                                "buckets": null,
                                "mode": "time",
                                "name": null,
                                "show": true,
                                "values": []
                            },
                            "yaxes": [{
                                    "format": "none",
                                    "label": "Number of errors",
                                    "logBase": 1,
                                    "max": null,
                                    "min": "0",
                                    "show": true
                                },
                                {
                                    "format": "short",
                                    "label": "",
                                    "logBase": 1,
                                    "max": null,
                                    "min": null,
                                    "show": false
                                }
                            ],
                            "gridPos": {
                                "x": 12,
                                "y": 1,
                                "w": 12,
                                "h": 8
                            },
                            "yaxis": {
                                "align": false,
                                "alignLevel": null
                            }
                        }
                    ],
                    "title": "Summary diff",
                    "type": "row"
                });

                /* 
                    Response time per transaction diff 
                */
                dashboard.panels.push({
                    "collapsed": true,
                    "gridPos": {
                        "h": 1,
                        "w": 24,
                        "x": 400,
                        "y": 200
                    },
                    "id": 4,
                    "panels": [{
                        "aliasColors": {},
                        "bars": false,
                        "dashLength": 10,
                        "dashes": false,
                        "datasource": "influxdb_timeshift_proxy",
                        "fill": 1,
                        "height": "350",
                        "id": 20,
                        "interval": "",
                        "legend": {
                            "alignAsTable": true,
                            "avg": false,
                            "current": true,
                            "hideEmpty": false,
                            "hideZero": false,
                            "max": true,
                            "min": true,
                            "rightSide": false,
                            "show": true,
                            "total": false,
                            "values": true
                        },
                        "lines": true,
                        "linewidth": 2,
                        "links": [],
                        "minSpan": 12,
                        "nullPointMode": "null",
                        "percentage": false,
                        "pointradius": 5,
                        "points": false,
                        "renderer": "flot",
                        "repeat": "transactions",
                        "seriesOverrides": [{
                                "alias": "/$tag_right/",
                                "fill": 0,
                                "points": true
                            },
                            {
                                "alias": "/$tag_left/",
                                "fill": 0,
                                "points": true
                            }
                        ],
                        "spaceLength": 10,
                        "stack": false,
                        "steppedLine": false,
                        "targets": [{
                                "alias": "$tag_right $transactions $metric",
                                "dsType": "influxdb",
                                "groupBy": [{
                                        "params": [
                                            "$__interval"
                                        ],
                                        "type": "time"
                                    },
                                    {
                                        "params": [
                                            "null"
                                        ],
                                        "type": "fill"
                                    }
                                ],
                                "hide": false,
                                "orderByTime": "ASC",
                                "policy": "default",
                                "query": "SELECT max(/$metric$/)  FROM \"$measurement\" WHERE \"transaction\"='$transactions' AND \"statut\"='all' AND time >= [[start_time_right]]000000 and time <= [[end_time_right]]000000 AND \"application\" =~ /$tag_right/ group by time($group_time)",
                                "rawQuery": true,
                                "refId": "A",
                                "resultFormat": "time_series",
                                "select": [
                                    [{
                                            "params": [
                                                "value"
                                            ],
                                            "type": "field"
                                        },
                                        {
                                            "params": [],
                                            "type": "mean"
                                        }
                                    ]
                                ],
                                "tags": []
                            },
                            {
                                "alias": "$tag_left $transactions $metric",
                                "dsType": "influxdb",
                                "groupBy": [{
                                        "params": [
                                            "$__interval"
                                        ],
                                        "type": "time"
                                    },
                                    {
                                        "params": [
                                            "null"
                                        ],
                                        "type": "fill"
                                    }
                                ],
                                "hide": false,
                                "orderByTime": "ASC",
                                "policy": "default",
                                "query": "SELECT max(/$metric$/) AS \"shift_" + shift() + "_ms\"  FROM \"$measurement\" WHERE \"transaction\"='$transactions' AND \"statut\"='all' AND time >= [[start_time_left]]000000 and time <= [[end_time_left]]000000 AND \"application\" =~ /$tag_left/ group by time($group_time)",
                                "rawQuery": true,
                                "refId": "B",
                                "resultFormat": "time_series",
                                "select": [
                                    [{
                                            "params": [
                                                "value"
                                            ],
                                            "type": "field"
                                        },
                                        {
                                            "params": [],
                                            "type": "mean"
                                        }
                                    ]
                                ],
                                "tags": []
                            }
                        ],
                        "thresholds": [],
                        "timeFrom": null,
                        "timeShift": null,
                        "title": "$transactions",
                        "tooltip": {
                            "shared": true,
                            "sort": 0,
                            "value_type": "individual"
                        },
                        "transparent": false,
                        "type": "graph",
                        "xaxis": {
                            "buckets": null,
                            "mode": "time",
                            "name": null,
                            "show": true,
                            "values": []
                        },
                        "yaxes": [{
                                "format": "ms",
                                "label": "Response time",
                                "logBase": 1,
                                "max": null,
                                "min": "0",
                                "show": true
                            },
                            {
                                "format": "short",
                                "label": "",
                                "logBase": 1,
                                "max": null,
                                "min": null,
                                "show": false
                            }
                        ],
                        "gridPos": {
                            "x": 0,
                            "y": 10,
                            "w": 24,
                            "h": 8
                        },
                        "yaxis": {
                            "align": false,
                            "alignLevel": null
                        }
                    }],
                    "title": "Response time diff per transaction",
                    "type": "row"
                });


                /* 
                    Aggregate report diff
                    Includes:
                        - Count
                        - Avg response time
                        - 90
                        - 95
                        - 99
                        - Min
                        - Max
                        - Errors
                */
                dashboard.panels.push({
                    "collapsed": true,
                    "gridPos": {
                        "h": 4,
                        "w": 24,
                        "x": 400,
                        "y": 200
                    },
                    "id": 79,
                    "panels": [],
                    "title": "Aggregate report diff",
                    "type": "row"
                });

                var mertic_types = new Map();
                /* 
                    $1 - key
                    $2 - [
                          title, 
                          is aggregate_function used in influxdb query,
                          is bigger value better?(parameter to set color of result)
                         ]
                */
                mertic_types.set('sum(\"count\")', ['NumberOfSamples', 1, 1]);
                mertic_types.set('mean(avg)', ['Average Response time', 1, 0]);
                mertic_types.set('percentile(\"pct90.0\", 90)', ['pct90 Response time', 0, 0]);
                mertic_types.set('percentile(\"pct95.0\", 95)', ['pct95 Response time', 0, 0]);
                mertic_types.set('percentile(\"pct99.0\", 99)', ['pct99 Response time', 0, 0]);
                mertic_types.set('min(min)', ['Min Response time', 0, 0]);
                mertic_types.set('max(max)', ['Max Response time', 0, 0]);
                mertic_types.set('sum(countError)', ['Error count', 1, 0]);

                var id = 7000;
                var y = 0;
                for (var [key, value] of mertic_types) {
                    y++;
                    id = id + 100;
                    // comparison charts
                    if (value[2] == 0) {
                        var colors = [
                            "rgba(96, 245, 54, 0.9)",
                            "#cca300",
                            "#890f02"
                        ]
                    } else {
                        var colors = [
                            "#890f02",
                            "#cca300",
                            "rgba(96, 245, 54, 0.9)"
                        ]
                    }
                    var template_right = {
                        "cacheTimeout": null,
                        "colorBackground": false,
                        "colorValue": false,
                        "colors": [
                            "rgba(50, 172, 45, 0.97)",
                            "rgba(40, 237, 46, 0.89)",
                            "rgba(96, 245, 54, 0.9)"
                        ],
                        "datasource": "influxdb_timeshift_proxy",
                        "format": "none",
                        "gauge": {
                            "maxValue": 100,
                            "minValue": 0,
                            "show": false,
                            "thresholdLabels": false,
                            "thresholdMarkers": true
                        },
                        "id": id + 1,
                        "interval": null,
                        "links": [],
                        "mappingType": 1,
                        "mappingTypes": [{
                                "name": "value to text",
                                "value": 1
                            },
                            {
                                "name": "range to text",
                                "value": 2
                            }
                        ],
                        "maxDataPoints": 100,
                        "nullPointMode": "connected",
                        "nullText": null,
                        "postfix": "",
                        "postfixFontSize": "70%",
                        "prefix": "",
                        "prefixFontSize": "50%",
                        "rangeMaps": [{
                            "from": "null",
                            "text": "N/A",
                            "to": "null"
                        }],
                        "sparkline": {
                            "fillColor": "rgba(94, 31, 189, 0.18)",
                            "full": false,
                            "lineColor": "rgb(196, 255, 0)",
                            "show": true
                        },
                        "tableColumn": "",
                        "targets": [{
                            "dsType": "influxdb",
                            "groupBy": [{
                                    "params": [
                                        "$__interval"
                                    ],
                                    "type": "time"
                                },
                                {
                                    "params": [
                                        "null"
                                    ],
                                    "type": "fill"
                                }
                            ],
                            "orderByTime": "ASC",
                            "policy": "default",
                            "query": "SELECT\n" + key + "\nFROM \"jmeter\"\nWHERE \"statut\"='all' \nAND time >= [[start_time_right]]000000 AND time <= [[end_time_right]]000000\nAND transaction = 'all'\nAND \"application\" =~ /$tag_right/",
                            "rawQuery": true,
                            "refId": "A",
                            "resultFormat": "time_series",
                            "select": [
                                [{
                                        "params": [
                                            "value"
                                        ],
                                        "type": "field"
                                    },
                                    {
                                        "params": [],
                                        "type": "mean"
                                    }
                                ]
                            ],
                            "tags": [],
                            "hide": false
                        }],
                        "thresholds": "",
                        "title": value[0] + " right",
                        "transparent": false,
                        "type": "singlestat",
                        "valueFontSize": "80%",
                        "valueMaps": [{
                            "op": "=",
                            "text": "N/A",
                            "value": "null"
                        }],
                        "valueName": "total",
                        "gridPos": {
                            "x": 8,
                            "y": y,
                            "w": 8,
                            "h": 5
                        }
                    }
                    var template_left = {
                        "cacheTimeout": null,
                        "colorBackground": false,
                        "colorValue": false,
                        "colors": [
                            "rgba(50, 172, 45, 0.97)",
                            "rgba(40, 237, 46, 0.89)",
                            "rgba(96, 245, 54, 0.9)"
                        ],
                        "datasource": "influxdb_timeshift_proxy",
                        "format": "none",
                        "gauge": {
                            "maxValue": 100,
                            "minValue": 0,
                            "show": false,
                            "thresholdLabels": false,
                            "thresholdMarkers": true
                        },
                        "id": id + 2,
                        "interval": null,
                        "links": [],
                        "mappingType": 1,
                        "mappingTypes": [{
                                "name": "value to text",
                                "value": 1
                            },
                            {
                                "name": "range to text",
                                "value": 2
                            }
                        ],
                        "maxDataPoints": 100,
                        "nullPointMode": "connected",
                        "nullText": null,
                        "postfix": "",
                        "postfixFontSize": "70%",
                        "prefix": "",
                        "prefixFontSize": "50%",
                        "rangeMaps": [{
                            "from": "null",
                            "text": "N/A",
                            "to": "null"
                        }],
                        "sparkline": {
                            "fillColor": "rgba(94, 31, 189, 0.18)",
                            "full": false,
                            "lineColor": "rgb(196, 255, 0)",
                            "show": true
                        },
                        "tableColumn": "",
                        "targets": [{
                            "dsType": "influxdb",
                            "groupBy": [{
                                    "params": [
                                        "$__interval"
                                    ],
                                    "type": "time"
                                },
                                {
                                    "params": [
                                        "null"
                                    ],
                                    "type": "fill"
                                }
                            ],
                            "orderByTime": "ASC",
                            "policy": "default",
                            "query": "SELECT\n" + key + " AS \"shift_" + shift() + "_ms\" \nFROM \"jmeter\"\nWHERE \"statut\"='all' \nAND time >= [[start_time_left]]000000 AND time <= [[end_time_left]]000000\nAND transaction = 'all'\nAND \"application\" =~ /$tag_left/",
                            "rawQuery": true,
                            "refId": "A",
                            "resultFormat": "time_series",
                            "select": [
                                [{
                                        "params": [
                                            "value"
                                        ],
                                        "type": "field"
                                    },
                                    {
                                        "params": [],
                                        "type": "mean"
                                    }
                                ]
                            ],
                            "tags": [],
                            "hide": false
                        }],
                        "thresholds": "",
                        "title": value[0] + " left",
                        "transparent": false,
                        "type": "singlestat",
                        "valueFontSize": "80%",
                        "valueMaps": [{
                            "op": "=",
                            "text": "N/A",
                            "value": "null"
                        }],
                        "valueName": "total",
                        "gridPos": {
                            "x": 0,
                            "y": y,
                            "w": 8,
                            "h": 5
                        }
                    }
                    var template_diff_aggregate_function = {
                        "cacheTimeout": null,
                        "colorBackground": false,
                        "colorValue": true,
                        "colors": colors,
                        "datasource": "influxdb_timeshift_proxy",
                        "format": "none",
                        "gauge": {
                            "maxValue": 100,
                            "minValue": 0,
                            "show": false,
                            "thresholdLabels": false,
                            "thresholdMarkers": true
                        },
                        "id": id + 3,
                        "interval": null,
                        "links": [],
                        "mappingType": 1,
                        "mappingTypes": [{
                                "name": "value to text",
                                "value": 1
                            },
                            {
                                "name": "range to text",
                                "value": 2
                            }
                        ],
                        "maxDataPoints": 100,
                        "nullPointMode": "connected",
                        "nullText": null,
                        "postfix": "",
                        "postfixFontSize": "70%",
                        "prefix": "",
                        "prefixFontSize": "50%",
                        "rangeMaps": [{
                            "from": "null",
                            "text": "N/A",
                            "to": "null"
                        }],
                        "sparkline": {
                            "fillColor": "rgba(94, 31, 189, 0.18)",
                            "full": false,
                            "lineColor": "rgb(196, 255, 0)",
                            "show": true
                        },
                        "tableColumn": "",
                        "targets": [{
                                "dsType": "influxdb",
                                "groupBy": [{
                                        "params": [
                                            "$__interval"
                                        ],
                                        "type": "time"
                                    },
                                    {
                                        "params": [
                                            "null"
                                        ],
                                        "type": "fill"
                                    }
                                ],
                                "orderByTime": "ASC",
                                "policy": "default",
                                "query": "SELECT " + key + " FROM \"$measurement\" WHERE \"transaction\"='all' AND time >= [[start_time_right]]000000 and time <= [[end_time_right]]000000 AND \"application\" =~ /$tag_right/",
                                "rawQuery": true,
                                "refId": "A",
                                "resultFormat": "time_series",
                                "select": [
                                    [{
                                            "params": [
                                                "value"
                                            ],
                                            "type": "field"
                                        },
                                        {
                                            "params": [],
                                            "type": "mean"
                                        }
                                    ]
                                ],
                                "tags": [],
                                "hide": false
                            },
                            {
                                "dsType": "influxdb",
                                "groupBy": [{
                                        "params": [
                                            "$__interval"
                                        ],
                                        "type": "time"
                                    },
                                    {
                                        "params": [
                                            "null"
                                        ],
                                        "type": "fill"
                                    }
                                ],
                                "orderByTime": "ASC",
                                "policy": "default",
                                "query": "SELECT " + key + " AS \"shift_" + shift() + "_ms\" FROM \"$measurement\" WHERE \"transaction\"='all' AND time >= [[start_time_left]]000000 and time <= [[end_time_left]]000000 AND \"application\" =~ /$tag_left/",
                                "rawQuery": true,
                                "refId": "B",
                                "resultFormat": "time_series",
                                "select": [
                                    [{
                                            "params": [
                                                "value"
                                            ],
                                            "type": "field"
                                        },
                                        {
                                            "params": [],
                                            "type": "mean"
                                        }
                                    ]
                                ],
                                "tags": [],
                                "hide": false
                            },
                            {
                                "dsType": "influxdb",
                                "groupBy": [{
                                        "params": [
                                            "$__interval"
                                        ],
                                        "type": "time"
                                    },
                                    {
                                        "params": [
                                            "null"
                                        ],
                                        "type": "fill"
                                    }
                                ],
                                "orderByTime": "ASC",
                                "policy": "default",
                                "query": "MATH name=\"ALL\" expr=\"$0 - $1\" singlestat",
                                "rawQuery": true,
                                "refId": "C",
                                "resultFormat": "time_series",
                                "select": [
                                    [{
                                            "params": [
                                                "value"
                                            ],
                                            "type": "field"
                                        },
                                        {
                                            "params": [],
                                            "type": "mean"
                                        }
                                    ]
                                ],
                                "tags": [],
                                "hide": false
                            }
                        ],
                        "thresholds": "-10,10",
                        "title": value[0] + " diff",
                        "transparent": false,
                        "type": "singlestat",
                        "valueFontSize": "80%",
                        "valueMaps": [{
                            "op": "=",
                            "text": "N/A",
                            "value": "null"
                        }],
                        "valueName": "total",
                        "gridPos": {
                            "x": 16,
                            "y": y,
                            "w": 8,
                            "h": 5
                        }
                    }
                    var template_diff_non_aggregate_function = {
                        "cacheTimeout": null,
                        "colorBackground": false,
                        "colorValue": true,
                        "colors": colors,
                        "datasource": "influxdb_timeshift_proxy",
                        "format": "none",
                        "gauge": {
                            "maxValue": 100,
                            "minValue": 0,
                            "show": false,
                            "thresholdLabels": false,
                            "thresholdMarkers": true
                        },
                        "id": id + 3,
                        "interval": null,
                        "links": [],
                        "mappingType": 1,
                        "mappingTypes": [{
                                "name": "value to text",
                                "value": 1
                            },
                            {
                                "name": "range to text",
                                "value": 2
                            }
                        ],
                        "maxDataPoints": 100,
                        "nullPointMode": "connected",
                        "nullText": null,
                        "postfix": "",
                        "postfixFontSize": "70%",
                        "prefix": "",
                        "prefixFontSize": "50%",
                        "rangeMaps": [{
                            "from": "null",
                            "text": "N/A",
                            "to": "null"
                        }],
                        "sparkline": {
                            "fillColor": "rgba(94, 31, 189, 0.18)",
                            "full": false,
                            "lineColor": "rgb(196, 255, 0)",
                            "show": true
                        },
                        "tableColumn": "",
                        "targets": [{
                            "dsType": "influxdb",
                            "groupBy": [{
                                    "params": [
                                        "$__interval"
                                    ],
                                    "type": "time"
                                },
                                {
                                    "params": [
                                        "null"
                                    ],
                                    "type": "fill"
                                }
                            ],
                            "orderByTime": "ASC",
                            "policy": "default",
                            "query": "select difference(*) from(SELECT " + key + " FROM \"jmeter\" WHERE \"transaction\"='all' AND \"statut\"='all' AND \"application\" =~ /($tag_left|$tag_right)/ GROUP BY application)",
                            "rawQuery": true,
                            "refId": "A",
                            "resultFormat": "time_series",
                            "select": [
                                [{
                                        "params": [
                                            "value"
                                        ],
                                        "type": "field"
                                    },
                                    {
                                        "params": [],
                                        "type": "mean"
                                    }
                                ]
                            ],
                            "tags": [],
                            "hide": false
                        }],
                        "thresholds": "-10,10",
                        "title": value[0] + " diff",
                        "transparent": false,
                        "type": "singlestat",
                        "valueFontSize": "80%",
                        "valueMaps": [{
                            "op": "=",
                            "text": "N/A",
                            "value": "null"
                        }],
                        "valueName": "total",
                        "gridPos": {
                            "x": 16,
                            "y": y,
                            "w": 8,
                            "h": 5
                        }
                    }


                    var aggregate_report_row = dashboard.panels.find(x => x.title === 'Aggregate report diff');
                    aggregate_report_row.panels.push(template_left);
                    aggregate_report_row.panels.push(template_right);
                    if (value[1] == 0) {
                        aggregate_report_row.panels.push(template_diff_non_aggregate_function);
                    } else {
                        aggregate_report_row.panels.push(template_diff_aggregate_function);
                    }

                }

                //row with throughput
                dashboard.panels.push({
                    "collapsed": true,
                    "gridPos": {
                        "h": 1,
                        "w": 24,
                        "x": 400,
                        "y": 200
                    },
                    "id": 8,
                    "panels": [
                        // Average throughput diff
                        {
                            "cacheTimeout": null,
                            "colorBackground": false,
                            "colorValue": true,
                            "colors": [
                                "rgba(245, 54, 54, 0.9)",
                                "rgb(255, 222, 0)",
                                "rgba(50, 172, 45, 0.97)"
                            ],
                            "datasource": "influxdb_timeshift_proxy",
                            "format": "short",
                            "gauge": {
                                "maxValue": 100,
                                "minValue": 0,
                                "show": false,
                                "thresholdLabels": false,
                                "thresholdMarkers": true
                            },
                            "gridPos": {
                                "x": 0,
                                "y": 0,
                                "w": 12,
                                "h": 6
                            },
                            "height": "250",
                            "id": 734,
                            "interval": null,
                            "links": [],
                            "mappingType": 1,
                            "mappingTypes": [{
                                    "name": "value to text",
                                    "value": 1
                                },
                                {
                                    "name": "range to text",
                                    "value": 2
                                }
                            ],
                            "maxDataPoints": 100,
                            "nullPointMode": "connected",
                            "nullText": null,
                            "postfix": "",
                            "postfixFontSize": "50%",
                            "prefix": "",
                            "prefixFontSize": "50%",
                            "rangeMaps": [],
                            "sparkline": {
                                "fillColor": "rgba(73, 173, 255, 0.18)",
                                "full": false,
                                "lineColor": "rgb(255, 250, 0)",
                                "show": false
                            },
                            "tableColumn": "",
                            "targets": [{
                                    "dsType": "influxdb",
                                    "groupBy": [{
                                            "params": [
                                                "$__interval"
                                            ],
                                            "type": "time"
                                        },
                                        {
                                            "params": [
                                                "null"
                                            ],
                                            "type": "fill"
                                        }
                                    ],
                                    "orderByTime": "ASC",
                                    "policy": "default",
                                    "query": "SELECT mean(last) FROM (SELECT  last(\"count\")/5 FROM \"jmeter\" WHERE \"transaction\" = 'all' AND time >= [[start_time_right]]000000 and time <= [[end_time_right]]000000 AND \"application\" =~ /$tag_right/ GROUP BY time(5s), application fill(null)) GROUP BY application",
                                    "rawQuery": true,
                                    "refId": "A",
                                    "resultFormat": "time_series",
                                    "select": [
                                        [{
                                                "params": [
                                                    "value"
                                                ],
                                                "type": "field"
                                            },
                                            {
                                                "params": [],
                                                "type": "mean"
                                            }
                                        ]
                                    ],
                                    "tags": []
                                },
                                {
                                    "dsType": "influxdb",
                                    "groupBy": [{
                                            "params": [
                                                "$__interval"
                                            ],
                                            "type": "time"
                                        },
                                        {
                                            "params": [
                                                "null"
                                            ],
                                            "type": "fill"
                                        }
                                    ],
                                    "orderByTime": "ASC",
                                    "policy": "default",
                                    "query": "SELECT mean(last) FROM (SELECT  last(\"count\")/5 FROM \"jmeter\" WHERE \"transaction\" = 'all' AND time >= [[start_time_left]]000000 and time <= [[end_time_left]]000000 AND \"application\" =~ /$tag_left/ GROUP BY time(5s), application fill(null)) GROUP BY application",
                                    "rawQuery": true,
                                    "refId": "B",
                                    "resultFormat": "time_series",
                                    "select": [
                                        [{
                                                "params": [
                                                    "value"
                                                ],
                                                "type": "field"
                                            },
                                            {
                                                "params": [],
                                                "type": "mean"
                                            }
                                        ]
                                    ],
                                    "tags": []
                                },
                                {
                                    "dsType": "influxdb",
                                    "groupBy": [{
                                            "params": [
                                                "$__interval"
                                            ],
                                            "type": "time"
                                        },
                                        {
                                            "params": [
                                                "null"
                                            ],
                                            "type": "fill"
                                        }
                                    ],
                                    "orderByTime": "ASC",
                                    "policy": "default",
                                    "query": "MATH name=\"ALL\" expr=\"$0 - $1\" singlestat",
                                    "rawQuery": true,
                                    "refId": "C",
                                    "resultFormat": "time_series",
                                    "select": [
                                        [{
                                                "params": [
                                                    "value"
                                                ],
                                                "type": "field"
                                            },
                                            {
                                                "params": [],
                                                "type": "mean"
                                            }
                                        ]
                                    ],
                                    "tags": []
                                }
                            ],
                            "thresholds": "-10,10",
                            "title": "Avg throughput diff(rps)",
                            "transparent": false,
                            "type": "singlestat",
                            "valueFontSize": "80%",
                            "valueMaps": [{
                                "op": "=",
                                "text": "N/A",
                                "value": "null"
                            }],
                            "valueName": "avg"
                        },
                        // Max throughput diff
                        {
                            "cacheTimeout": null,
                            "colorBackground": false,
                            "colorValue": true,
                            "colors": [
                                "rgba(245, 54, 54, 0.9)",
                                "rgb(255, 222, 0)",
                                "rgba(50, 172, 45, 0.97)"
                            ],
                            "datasource": "influxdb_timeshift_proxy",
                            "format": "short",
                            "gauge": {
                                "maxValue": 100,
                                "minValue": 0,
                                "show": false,
                                "thresholdLabels": false,
                                "thresholdMarkers": true
                            },
                            "gridPos": {
                                "x": 12,
                                "y": 6,
                                "w": 12,
                                "h": 6
                            },
                            "height": "250",
                            "id": 457,
                            "interval": null,
                            "links": [],
                            "mappingType": 1,
                            "mappingTypes": [{
                                    "name": "value to text",
                                    "value": 1
                                },
                                {
                                    "name": "range to text",
                                    "value": 2
                                }
                            ],
                            "maxDataPoints": 100,
                            "nullPointMode": "connected",
                            "nullText": null,
                            "postfix": "",
                            "postfixFontSize": "50%",
                            "prefix": "",
                            "prefixFontSize": "50%",
                            "rangeMaps": [],
                            "sparkline": {
                                "fillColor": "rgba(73, 173, 255, 0.18)",
                                "full": false,
                                "lineColor": "rgb(255, 250, 0)",
                                "show": false
                            },
                            "tableColumn": "",
                            "targets": [{
                                "dsType": "influxdb",
                                "groupBy": [{
                                        "params": [
                                            "$__interval"
                                        ],
                                        "type": "time"
                                    },
                                    {
                                        "params": [
                                            "null"
                                        ],
                                        "type": "fill"
                                    }
                                ],
                                "orderByTime": "ASC",
                                "policy": "default",
                                "query": "select difference(*) from(SELECT max(last) FROM (SELECT  last(\"count\")/5 FROM \"jmeter\" WHERE \"transaction\" = 'all' AND \"application\" =~ /$tag_left|$tag_right/ GROUP BY time(5s), application fill(null)) GROUP BY application)",
                                "rawQuery": true,
                                "refId": "A",
                                "resultFormat": "time_series",
                                "select": [
                                    [{
                                            "params": [
                                                "value"
                                            ],
                                            "type": "field"
                                        },
                                        {
                                            "params": [],
                                            "type": "mean"
                                        }
                                    ]
                                ],
                                "tags": []
                            }],
                            "thresholds": "-10,10",
                            "title": "Max throughput diff(rps)",
                            "transparent": false,
                            "type": "singlestat",
                            "valueFontSize": "80%",
                            "valueMaps": [{
                                "op": "=",
                                "text": "N/A",
                                "value": "null"
                            }],
                            "valueName": "max"
                        },
                        // Throughput trend diff
                        {
                            "aliasColors": {
                                "jmeter.activeThreads": "#e5ac0e",
                                "jmeter.countError": "#BF1B00",
                                "jmeter.minAT": "#EAB839"
                            },
                            "bars": false,
                            "dashLength": 10,
                            "dashes": false,
                            "datasource": "influxdb_timeshift_proxy",
                            "fill": 1,
                            "gridPos": {
                                "x": 0,
                                "y": 9,
                                "w": 24,
                                "h": 8
                            },
                            "id": 932,
                            "legend": {
                                "avg": false,
                                "current": false,
                                "max": true,
                                "min": false,
                                "show": true,
                                "total": false,
                                "values": true
                            },
                            "lines": true,
                            "linewidth": 3,
                            "links": [],
                            "nullPointMode": "null",
                            "percentage": false,
                            "pointradius": 5,
                            "points": false,
                            "renderer": "flot",
                            "seriesOverrides": [{
                                    "alias": "$tag_right Throughput in " + tag_right,
                                    "color": "rgb(205, 255, 0)",
                                    "dashes": true,
                                    "fill": 0
                                },
                                {
                                    "alias": "$tag_left Throughput in" + tag_left,
                                    "fill": 0,
                                    "dashes": true,
                                    "color": "#6ed0e0"
                                }
                            ],
                            "spaceLength": 10,
                            "stack": false,
                            "steppedLine": false,
                            "targets": [{
                                    "alias": "$tag_right Throughput in " + tag_right,
                                    "dsType": "influxdb",
                                    "groupBy": [{
                                            "params": [
                                                "$__interval"
                                            ],
                                            "type": "time"
                                        },
                                        {
                                            "params": [
                                                "null"
                                            ],
                                            "type": "fill"
                                        }
                                    ],
                                    "orderByTime": "ASC",
                                    "policy": "default",
                                    "query": "SELECT last(\"count\")/5 as \"Throughput\" FROM \"$measurement\" WHERE \"transaction\" = 'all' AND time >= [[start_time_right]]000000 and time <= [[end_time_right]]000000 AND \"application\" =~ /$tag_right/ GROUP BY time(5s) fill(null)",
                                    "rawQuery": true,
                                    "refId": "A",
                                    "resultFormat": "time_series",
                                    "select": [
                                        [{
                                                "params": [
                                                    "value"
                                                ],
                                                "type": "field"
                                            },
                                            {
                                                "params": [],
                                                "type": "mean"
                                            }
                                        ]
                                    ],
                                    "tags": []
                                },
                                {
                                    "alias": "$tag_left Throughput in" + tag_left,
                                    "dsType": "influxdb",
                                    "groupBy": [{
                                            "params": [
                                                "$__interval"
                                            ],
                                            "type": "time"
                                        },
                                        {
                                            "params": [
                                                "null"
                                            ],
                                            "type": "fill"
                                        }
                                    ],
                                    "orderByTime": "ASC",
                                    "policy": "default",
                                    "query": "SELECT last(\"count\")/5 AS \"shift_" + shift() + "_ms\" FROM \"$measurement\" WHERE \"transaction\" = 'all' AND time >= [[start_time_left]]000000 and time <= [[end_time_left]]000000 AND \"application\" =~ /$tag_left/ GROUP BY time(5s) fill(null)",
                                    "rawQuery": true,
                                    "refId": "B",
                                    "resultFormat": "time_series",
                                    "select": [
                                        [{
                                                "params": [
                                                    "value"
                                                ],
                                                "type": "field"
                                            },
                                            {
                                                "params": [],
                                                "type": "mean"
                                            }
                                        ]
                                    ],
                                    "tags": []
                                }
                            ],
                            "thresholds": [],
                            "timeFrom": null,
                            "timeShift": null,
                            "title": "Total throughput diff",
                            "tooltip": {
                                "shared": true,
                                "sort": 0,
                                "value_type": "individual"
                            },
                            "transparent": false,
                            "type": "graph",
                            "xaxis": {
                                "buckets": null,
                                "mode": "time",
                                "name": null,
                                "show": true,
                                "values": []
                            },
                            "yaxes": [{
                                    "format": "short",
                                    "label": "Throughput",
                                    "logBase": 1,
                                    "max": null,
                                    "min": "0",
                                    "show": true
                                },
                                {
                                    "format": "short",
                                    "label": null,
                                    "logBase": 1,
                                    "max": null,
                                    "min": null,
                                    "show": false
                                }
                            ],
                            "yaxis": {
                                "align": false,
                                "alignLevel": null
                            }
                        }
                    ],
                    "title": "Throughput diff",
                    "type": "row"
                });

                //Errors comparison
                dashboard.panels.push({
                    "collapsed": true,
                    "gridPos": {
                        "h": 1,
                        "w": 24,
                        "x": 400,
                        "y": 200
                    },
                    "id": 9,
                    "panels": [
                        //left
                        {
                            "columns": [],
                            "datasource": "influxdb_timeshift_proxy",
                            "fontSize": "100%",
                            "id": 156,
                            "links": [],
                            "pageSize": 50,
                            "scroll": true,
                            "showHeader": true,
                            "sort": {
                                "col": 1,
                                "desc": false
                            },
                            "styles": [{
                                    "alias": "Time",
                                    "dateFormat": "YYYY-MM-DD HH:mm:ss",
                                    "pattern": "Time",
                                    "preserveFormat": false,
                                    "sanitize": false,
                                    "type": "date"
                                },
                                {
                                    "alias": "Response code",
                                    "colorMode": "cell",
                                    "colors": [
                                        "rgba(245, 54, 54, 0.9)",
                                        "rgba(237, 129, 40, 0.89)",
                                        "rgba(50, 172, 45, 0.97)"
                                    ],
                                    "dateFormat": "YYYY-MM-DD HH:mm:ss",
                                    "decimals": 2,
                                    "pattern": "responseCode",
                                    "thresholds": [],
                                    "type": "number",
                                    "unit": "short"
                                },
                                {
                                    "alias": "Failed requests details",
                                    "colorMode": null,
                                    "colors": [
                                        "rgba(245, 54, 54, 0.9)",
                                        "rgba(237, 129, 40, 0.89)",
                                        "rgba(50, 172, 45, 0.97)"
                                    ],
                                    "dateFormat": "YYYY-MM-DD HH:mm:ss",
                                    "decimals": 2,
                                    "pattern": "responseMessage",
                                    "preserveFormat": true,
                                    "sanitize": true,
                                    "thresholds": [],
                                    "type": "string",
                                    "unit": "short"
                                },
                                {
                                    "alias": "Transaction name",
                                    "colorMode": null,
                                    "colors": [
                                        "rgba(245, 54, 54, 0.9)",
                                        "rgba(237, 129, 40, 0.89)",
                                        "rgba(50, 172, 45, 0.97)"
                                    ],
                                    "dateFormat": "YYYY-MM-DD HH:mm:ss",
                                    "decimals": 2,
                                    "pattern": "transaction",
                                    "thresholds": [],
                                    "type": "string",
                                    "unit": "short"
                                },
                                {
                                    "alias": "",
                                    "colorMode": null,
                                    "colors": [
                                        "rgba(245, 54, 54, 0.9)",
                                        "rgba(237, 129, 40, 0.89)",
                                        "rgba(50, 172, 45, 0.97)"
                                    ],
                                    "dateFormat": "YYYY-MM-DD HH:mm:ss",
                                    "decimals": 2,
                                    "pattern": "errorCount",
                                    "thresholds": [],
                                    "type": "hidden",
                                    "unit": "short"
                                }
                            ],
                            "targets": [{
                                "dsType": "influxdb",
                                "groupBy": [{
                                        "params": [
                                            "$__interval"
                                        ],
                                        "type": "time"
                                    },
                                    {
                                        "params": [
                                            "null"
                                        ],
                                        "type": "fill"
                                    }
                                ],
                                "orderByTime": "ASC",
                                "policy": "default",
                                "query": "SELECT sum(count) AS errorCount FROM \"$measurement\" WHERE (\"responseMessage\" <> '' OR  \"responseCode\" =~ /(4|5)\\\\d{2}/) AND time >= [[start_time_left]]000000 and time <= [[end_time_left]]000000 AND \"application\" =~ /$tag_left/  GROUP BY transaction, responseCode, responseMessage",
                                "rawQuery": true,
                                "refId": "A",
                                "resultFormat": "table",
                                "select": [
                                    [{
                                            "params": [
                                                "value"
                                            ],
                                            "type": "field"
                                        },
                                        {
                                            "params": [],
                                            "type": "mean"
                                        }
                                    ]
                                ],
                                "tags": []
                            }],
                            "title": "Errors details",
                            "transform": "table",
                            "transparent": false,
                            "type": "table",
                            "gridPos": {
                                "x": 0,
                                "y": 34,
                                "w": 12,
                                "h": 12
                            }
                        },
                        //right
                        {
                            "columns": [],
                            "datasource": "influxdb_timeshift_proxy",
                            "fontSize": "100%",
                            "id": 767,
                            "links": [],
                            "pageSize": 50,
                            "scroll": true,
                            "showHeader": true,
                            "sort": {
                                "col": 1,
                                "desc": false
                            },
                            "styles": [{
                                    "alias": "Time",
                                    "dateFormat": "YYYY-MM-DD HH:mm:ss",
                                    "pattern": "Time",
                                    "preserveFormat": false,
                                    "sanitize": false,
                                    "type": "date"
                                },
                                {
                                    "alias": "Response code",
                                    "colorMode": "cell",
                                    "colors": [
                                        "rgba(245, 54, 54, 0.9)",
                                        "rgba(237, 129, 40, 0.89)",
                                        "rgba(50, 172, 45, 0.97)"
                                    ],
                                    "dateFormat": "YYYY-MM-DD HH:mm:ss",
                                    "decimals": 2,
                                    "pattern": "responseCode",
                                    "thresholds": [],
                                    "type": "number",
                                    "unit": "short"
                                },
                                {
                                    "alias": "Failed requests details",
                                    "colorMode": null,
                                    "colors": [
                                        "rgba(245, 54, 54, 0.9)",
                                        "rgba(237, 129, 40, 0.89)",
                                        "rgba(50, 172, 45, 0.97)"
                                    ],
                                    "dateFormat": "YYYY-MM-DD HH:mm:ss",
                                    "decimals": 2,
                                    "pattern": "responseMessage",
                                    "preserveFormat": true,
                                    "sanitize": true,
                                    "thresholds": [],
                                    "type": "string",
                                    "unit": "short"
                                },
                                {
                                    "alias": "Transaction name",
                                    "colorMode": null,
                                    "colors": [
                                        "rgba(245, 54, 54, 0.9)",
                                        "rgba(237, 129, 40, 0.89)",
                                        "rgba(50, 172, 45, 0.97)"
                                    ],
                                    "dateFormat": "YYYY-MM-DD HH:mm:ss",
                                    "decimals": 2,
                                    "pattern": "transaction",
                                    "thresholds": [],
                                    "type": "string",
                                    "unit": "short"
                                },
                                {
                                    "alias": "",
                                    "colorMode": null,
                                    "colors": [
                                        "rgba(245, 54, 54, 0.9)",
                                        "rgba(237, 129, 40, 0.89)",
                                        "rgba(50, 172, 45, 0.97)"
                                    ],
                                    "dateFormat": "YYYY-MM-DD HH:mm:ss",
                                    "decimals": 2,
                                    "pattern": "errorCount",
                                    "thresholds": [],
                                    "type": "hidden",
                                    "unit": "short"
                                }
                            ],
                            "targets": [{
                                "dsType": "influxdb",
                                "groupBy": [{
                                        "params": [
                                            "$__interval"
                                        ],
                                        "type": "time"
                                    },
                                    {
                                        "params": [
                                            "null"
                                        ],
                                        "type": "fill"
                                    }
                                ],
                                "orderByTime": "ASC",
                                "policy": "default",
                                "query": "SELECT sum(count) AS errorCount FROM \"$measurement\" WHERE (\"responseMessage\" <> '' OR  \"responseCode\" =~ /(4|5)\\\\d{2}/) AND time >= [[start_time_right]]000000 and time <= [[end_time_right]]000000 AND \"application\" =~ /$tag_right/  GROUP BY transaction, responseCode, responseMessage",
                                "rawQuery": true,
                                "refId": "A",
                                "resultFormat": "table",
                                "select": [
                                    [{
                                            "params": [
                                                "value"
                                            ],
                                            "type": "field"
                                        },
                                        {
                                            "params": [],
                                            "type": "mean"
                                        }
                                    ]
                                ],
                                "tags": []
                            }],
                            "title": "Errors details",
                            "transform": "table",
                            "transparent": false,
                            "type": "table",
                            "gridPos": {
                                "x": 12,
                                "y": 34,
                                "w": 12,
                                "h": 12
                            }
                        }
                    ],
                    "title": "Error details",
                    "type": "row"
                });

                // when dashboard is composed call the callback
                // function and pass the dashboard
                callback(dashboard);

            });

    } else {
        var message = "<h3>Select test runs to influxdb_timeshift_proxy </h3> <button onclick=\"window.location.reload()\" type=\"button\" style=\"border: solid; display:inline; background-color: inherit;padding: 0px 20px;font-size: 16px;cursor: pointer;display: inline-block;color: green;\">Apply changes</button></h4>";
        $.ajax({
                method: 'GET',
                url: '/'
            })
            .done(function(result) {
                dashboard.panels.push({
                    "type": "text",
                    "title": "",
                    "gridPos": {
                        "x": 0,
                        "y": 0,
                        "w": 24,
                        "h": 5
                    },
                    "id": 85,
                    "mode": "html",
                    "content": message,
                    "links": []
                });

                // when dashboard is composed call the callback
                // function and pass the dashboard
                callback(dashboard);

            });
    }
}