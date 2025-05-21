require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');


require('dotenv').config();
require('./config/db'); // Importa la connessione al database

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const chatRouter = require('./routes/chat');
const reviewsRouter = require('./routes/reviews');
const requestsRouter = require('./routes/journalistRequests');
const userRoutes = require('./routes/users');

let app = express();
const server = http.createServer(app);

// CORS middleware per permettere connessioni WebSocket dal MainServer
const io = socketIo(server, {
  cors: {
    origin: process.env.MAIN_SERVER_URL || 'http://localhost:3000',
    methods: ["GET", "POST"]
  }
});
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.MAIN_SERVER_URL || 'http://localhost:3000');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-User-Id, X-Admin-Id');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//middleware per bloccare richieste che non sono API
app.use((req, res, next) => {
  if (!req.originalUrl.startsWith('/api'))
    next(createError(403, "Solo API consentite"));
  else
    next();
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500).json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  });
});

module.exports = { app, server };