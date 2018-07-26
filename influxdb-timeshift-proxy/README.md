# Timeshift influxDB proxy with Mathematics across measurements feature

This proxy server will add *timeshift* feature to you *influxDB* server. This feature is extremely helpful to compare periods in *Grafana*.

Proxy can to mathematical operations between queries (i.e. between metrics).

## Installation

**Node.js version 6 or later** is required to run the code.

```
git clone https://github.com/maxsivanov/influxdb-timeshift-proxy.git
cd influxdb-timeshift-proxy
npm i
INFLUXDB=192.168.33.11:8086 npm run start
```
**OR**

```
npm i influxdb-timeshift-proxy -g
INFLUXDB=192.168.33.11:8086 influxdb-timeshift-proxy
```

Proxy will be available on port **8089**.

It is possible to use already proxied InfluxDB.

```
INFLUXDB=http://my.host.lan/api/datasources/proxy/19 npm run start
```

Proxying of Proxied :) feature is not very stable yet. Sometimes proxy will fail with HTTP 500. Waiting for [this bug in express-http-proxy](https://github.com/villadora/express-http-proxy/issues/177) to fix. Anyway direct connection i.e `INFLUXDB=192.168.33.11:8086 npm run start` works fine.
  

## Usage

Proxy will go timeshift on queries with fields listed with alias `AS "shift_1_weeks"`. `1` can be any positive integer number. `weeks` can be any unit described here [https://momentjs.com/docs/#/manipulating/add/](https://momentjs.com/docs/#/manipulating/add/).

You can use `MATH` query to do mathematical operation between previously defined queries.

![Example of MATH query](math_example.png)

* `name` and `expr` attributes are mandatory.
* You can use any mathematical operation in `expr`: `+`, `-`, `*`, `/`, `%`.
* `$0`, `$1` ... etc are indexes of query results to be used in expression.
* `Infinity` and `NaN` results will be converted to `null`, so do not be afraid of division by zero.
* `MATH` will clear returned values from query results used for mathematical operation. Use `keep` attribute to keep source data.
* Use `singlestat` attribute if you want to use `MATH` in Singlestat panels.

![Example of MATH query](math_singlestat.png)

## Example requests

Shift one week back:

```
SELECT non_negative_derivative("value", 1h) AS "shift_1_weeks" FROM "CPU_LOAD" WHERE "tag" = 'all' 
```

Shift two days back:

```
SELECT non_negative_derivative("value", 1h) AS "shift_2_days" FROM "CPU_LOAD" WHERE "tag" = 'all' 
```

Sum two metrics and **clear** source metrics from result 

```
MATH name="ALL" expr="$0 + $1"
```

Sum two metrics and **keep** source metrics in result 

```
MATH name="ALL" expr="$0 + $1" keep="$0,$1"
```

Sum two metrics for **singlestat** panel

```
MATH name="ALL" expr="$0 + $1" singlestat
```

## Debugging

Run proxy with `DEBUG` environment variable set:

* `query` -- display all queries
* `rewrite` -- display all query rewrites
* `math` -- display all MATH calculations are made 


