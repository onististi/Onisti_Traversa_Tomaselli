require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const cors = require('cors');  // Importa il pacchetto CORS

require('dotenv').config();
require('./config/db'); // Importa la connessione al database

var indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const chatRouter = require('./routes/chat');
const requestsRouter = require('./routes/journalistRequests');
const userRoutes = require('./routes/user');

var app = express();
const server = http.createServer(app);
const io = socketIo(server);

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

// Rendi disponibile io per i controller
app.set('io', io);

// WebSocket del DataServer
io.on('connection', (socket) => {
  console.log('DataServer: Client connected to WebSocket', socket.id);

  socket.on('join-film-room', (filmId) => {
    socket.join(`film-${filmId}`);
    console.log(`Client ${socket.id} joined room film-${filmId}`);
  });

  socket.on('chat-message', async (messageData) => {
    try {
      const response = await axios.post('http://localhost:' + (process.env.PORT || '3001') + '/api/chat/messages', messageData);
      const savedMessage = response.data;

      io.to(`film-${messageData.filmId}`).emit('new-chat-message', savedMessage);
    } catch (error) {
      console.error('Errore nella gestione del messaggio:', error);
      socket.emit('error', { message: 'Errore nel processare il messaggio' });
    }
  });

  socket.on('disconnect', () => {
    console.log('DataServer: Client disconnected');
  });
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/api/movies', movieRouter);
app.use('/api/auth', authRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/users', userRoutes);

//middleware per bloccare richieste che non sono API
app.use((req, res, next) => {
  if (!req.originalUrl.startsWith('/api'))
    next(createError(403, "Solo API consentite"));
  else
    next();
});

app.use('/api/auth', authRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRouter);

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

  // render the error page
  res.status(err.status || 500);
  res.status(500).json({ error: err.message || 'Errore interno del server' });
});

module.exports = { app, server };