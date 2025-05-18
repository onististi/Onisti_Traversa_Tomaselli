const axios = require('axios');
const jwt = require('jsonwebtoken');
const session = require('express-session');


const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 1 giorno
    }
});


const ensureAuthenticated = async (req, res, next) => {
    try {
        if (req.session.isLoggedIn && req.session.user?.id && req.session.token) {
            const decoded = jwt.verify(req.session.token, process.env.JWT_SECRET);
            if (Date.now() >= decoded.exp * 1000) {
                throw new Error('Token expired');
            }
            return next();
        }
        throw new Error('User not logged in or token missing');
    } catch (err) {
        console.error('Auth error:', err.message);
        if (req.session) await new Promise(resolve => req.session.destroy(resolve));
        res.clearCookie('connect.sid');
        return res.redirect('/auth/login?error=Session_expired');
    }
};


const syncUserSession = async (req, res, next) => {
    console.log('Token PRIMA di syncUserSession:', req.session.token);

    if (!req.session || !req.session.user || !req.session.user.id) {
        console.warn('Sessione o utente non definiti. Salto syncUserSession.');
        return next();
    }

    try {
        const baseUrl = process.env.DATA_SERVER_URL || 'http://localhost:3001';
        const apiPath = baseUrl.endsWith('/api') ? '' : '/api';

        const response = await axios.get(
            `${baseUrl}${apiPath}/users/${req.session.user.id}?t=${Date.now()}`,
            {
                headers: {
                    'Authorization': `Bearer ${req.session.token}`,
                    'Cache-Control': 'no-store'
                }
            }
        );

        const userFromDataServer = response.data.user;

        if (JSON.stringify(userFromDataServer) !== JSON.stringify(req.session.user)) {
            console.log(`Aggiornamento dati sessione`);
            req.session.user = userFromDataServer;

            req.session.token = jwt.sign(
                {
                    id: req.session.user.id,
                    username: req.session.user.username,
                    role: req.session.user.role
                },
                process.env.JWT_SECRET || 'default-secret-key',
                { expiresIn: '1h' }
            );

            // Invia notifica WebSocket
            if (req.app.get('io') && userFromDataServer.requestStatus) {
                req.app.get('io').to(userFromDataServer.id.toString()).emit('status-update', {
                    userId: userFromDataServer.id,
                    requestStatus: userFromDataServer.requestStatus,
                    role: userFromDataServer.role,
                    timestamp: Date.now()
                });
            }

            await req.session.save();
        }

        next();
    } catch (error) {
        console.error('Errore syncUserSession:', error.message);
        next();
    }
};


const injectAuthVariables = (req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.isLoggedIn = !!req.session.isLoggedIn;
    res.locals.sessionExpired = req.query.error === 'Session_expired';
    next();
};


const ensureMaster = (req, res, next) => {
    console.log(`DEBUG: User ID: ${req.session.user?.id}, Role: ${req.session.user?.role}`);
    if (req.session.user?.role === 'master') {
        console.log('Access granted to Master.');
        return next();
    }
    console.warn('Access denied. Role:', req.session.user?.role);
    res.status(403).render('error', {
        message: 'Accesso negato',
        error: { status: 403 }
    });
};


module.exports = {
    sessionMiddleware,
    ensureAuthenticated,
    ensureMaster,
    injectAuthVariables,
    syncUserSession
};