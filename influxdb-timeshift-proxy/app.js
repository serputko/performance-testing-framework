const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');

const proxy = require('express-http-proxy');
const URL = require('url');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const influx = require('./handlers');

const e = process.env;

if (!e.INFLUXDB) {
    console.log('Usage: INFLUXDB=127.0.0.1:8086 npm run start');
    process.exit(-1);
}

const influx_url = URL.parse(e.INFLUXDB.match(/^https*:\/\//) ? e.INFLUXDB : `http://${e.INFLUXDB}`);
const influx_path = influx_url.pathname.match(/\/$/) ? influx_url.pathname : `${influx_url.pathname}/`;

const proxy_options = {
    preserveHostHdr: true,
    proxyReqPathResolver: influx.forward.bind(this, influx_path),
    userResDecorator: influx.intercept
};

if (e.INFLUXDB.match(/^https:\/\//)) {
    Object.assign(proxy_options, {https: true});
}

app.use("/", proxy(influx_url.host, proxy_options));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
