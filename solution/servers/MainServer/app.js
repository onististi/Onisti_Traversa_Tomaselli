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
const searchRouter = require('./routes/search');

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
hbs.registerHelper('times', function(n, block) {
  let accum = '';
  for (let i = 0; i < n; i++) {
    accum += block.fn(i);
  }
  return accum;
});

hbs.registerHelper('subtract', function(a, b) {
  return a - b;
});

// Helper for equality check (for role-based styling)
hbs.registerHelper('eq', function(a, b) {
  return a === b;
});


// Routes definition
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/movies', movieRouter);
app.use('/actors', actorRouter);
app.use('/chat', chatRouter);
app.use('/requests', requestsRouter);
app.use('/admin', adminRouter);
//app.use('/user', userRouter);
app.use('/search', searchRouter);

app.use((req, res, next) => {
  return res.render('NotFound', { title: 'Page not Found', message: 'Return to the homepage.' });
});

// Gestione errori
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(err.status || 500).render('error', {
    message: err.message,
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

module.exports = app;
