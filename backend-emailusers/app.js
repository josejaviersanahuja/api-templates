var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');

//Securing headers
const helmet = require('helmet')

// against brute force attacks Dependencies
const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");

// against brute force attacks Configuration
const limiter = rateLimit({
  windowMs:  60 * 1000, // in 1 minute
  max: 60 // limit each IP to 60 requests per minute
});
const speedLimiter = slowDown({
  windowMs: 60 * 1000, // in 1 minutes
  delayAfter: 20, // allow 20 requests per minute, then...
  delayMs: 500 // begin adding 500ms of delay per request above 20:
  // request # 21 is delayed by  500ms
  // request # 22 is delayed by 1000ms
  // request # 233 is delayed by 1500ms
  // etc.
});

// router endpoints
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var tokensRouter = require('./routes/tokens');
var validationRouter = require('./routes/validation');

//Initializing APP
var app = express();

//securing headers
app.use(helmet())

//securing against brute force attacks
app.use(speedLimiter);
app.use(limiter);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
//Middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
//ROUTES
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/tokens', tokensRouter);
app.use('/validation', validationRouter);

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
