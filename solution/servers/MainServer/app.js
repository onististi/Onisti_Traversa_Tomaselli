var createError = require('http-errors');
var express = require('express');
var path = require('path');
const socketIo = require('socket.io'); //non ne sono sicuro (bisogna vedere come fare la chat se nel mainserver o un server apposito)
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth'); //usata per login e signup
const movieRouter = require('./routes/movies'); //usata sia per pagina singola movie che ricerca generale e visione su homepage
const actorRouter = require('./routes/actors'); // //
const chatRouter = require('./routes/chat');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
const hbs = require('hbs');
hbs.registerHelper('json', function(context) {
  return JSON.stringify(context || []);
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/auth',authRouter);
app.use('/movies',movieRouter);
app.use('/actors',actorRouter);
app.use('/chat',chatRouter);

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
