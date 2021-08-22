var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
const helmet = require('helmet')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var tokensRouter = require('./routes/tokens');
var validationRouter = require('./routes/validation');

var app = express();
app.use(helmet())
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
