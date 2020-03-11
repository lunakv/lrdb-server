var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var mysql = require('mysql');
var helmet = require('helmet');
var redis = require('redis');
var redisStore = require('connect-redis')(session);
var indexRouter = require('./routes/index');
var fmfRouter = require('./routes/fmf');
var config = require('./config.js');

var app = express();
var client = redis.createClient({
    host: config.redisHost,
    port: config.redisPort
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(helmet({
    hsts: false         // hsts is set by proxy
}));
app.use(logger('common'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/stylesheets', express.static(path.join(__dirname, 'public/stylesheets')));
app.use('/scripts', express.static(path.join(__dirname, 'public/scripts')));
app.use('/icons', express.static(path.join(__dirname, 'public', 'icons')));

app.use(session({
	secret: config.sessionSecret,
	store: new redisStore({ client: client, ttl: 86400}),
	resave: false,
	saveUninitialized: false
}));

app.use('/fmf', fmfRouter); // old route in use for backwards compatibility
app.use('/radio', fmfRouter);
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
