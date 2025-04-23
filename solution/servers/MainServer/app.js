require('dotenv').config();
const express = require('express');
const path = require('path');
const hbs = require('hbs');
const { sessionMiddleware, ensureAuthenticated, injectAuthVariables, syncUserSession } = require('./middleware/auth');
const { setupWebSockets } = require('./websocket');

const app = express();
const server = require('http').createServer(app);


// Importazione delle route
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const movieRouter = require('./routes/movies');
const actorRouter = require('./routes/actors');
const chatRouter = require('./routes/chat');
const adminRouter = require('./routes/admin');
const requestsRouter = require('./routes/requests');
const userRouter = require('./routes/user')

// Configurazione view engine
hbs.registerPartials(path.join(__dirname, 'views/partials'));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);
app.use(injectAuthVariables);
app.use(syncUserSession);

// Setup WebSocket
setupWebSockets(server);

// Register HBS helpers
hbs.registerHelper('json', context => JSON.stringify(context || []));
hbs.registerHelper('eq', (a, b) => a === b);
hbs.registerHelper('formatDate', date => new Date(date).toLocaleDateString('it-IT'));
hbs.registerHelper('capitalize', str => typeof str === 'string' ? str.charAt(0).toUpperCase() + str.slice(1) : '');

// Routes definition
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/movies', movieRouter);
app.use('/actors', actorRouter);
app.use('/chat', chatRouter);
app.use('/requests', requestsRouter);
app.use('/admin', adminRouter);
app.use('/user', userRouter);

// Gestione errori
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(err.status || 500).render('error', {
    message: err.message,
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

module.exports = app;
