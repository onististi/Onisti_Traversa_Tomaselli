var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('./config/db'); // Importa la connessione al database

var usersRouter = require('./routes/users');
var movieRouter = require('./routes/movies');
var authRouter = require('./routes/auth'); // Import delle route di autenticazione

var app = express();

// Configurazione middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/movies', movieRouter);
app.use('/api/auth', authRouter);

// Middleware per bloccare richieste che non sono API
app.use((req, res, next) => {
  if (!req.originalUrl.startsWith('/api'))
    next(createError(403, "Solo API consentite"));
  else
    next();
});

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.json({ success: false, message: err.message });
});

module.exports = app;