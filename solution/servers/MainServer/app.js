var createError = require('http-errors');
var express = require('express');
var path = require('path');
const socketIo = require('socket.io');
const session = require('express-session');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const movieRouter = require('./routes/movies');
const actorRouter = require('./routes/actors');
const chatRouter = require('./routes/chat');

const app = express();

// View engine setup
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

// Impost session
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Middleware for `isLoggedIn` variable
app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session && req.session.isLoggedIn;
  res.locals.user = req.session.user;
  next();
});

// Routes definition
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/movies', movieRouter);
app.use('/actors', actorRouter);
app.use('/chat', chatRouter);

// Catch 404 e forward a error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
