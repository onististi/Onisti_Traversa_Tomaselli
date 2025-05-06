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
        maxAge: 24 * 60 * 60 * 1000 // 1 day
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
   // console.log('Token PRIMA di syncUserSession:', req.session.token);

    try {
        const response = await axios.get(
            `http://localhost:3001/api/users/${req.session.user.id}`,
            {
                headers: { 'Authorization': `Bearer ${req.session.token}` }
            }
        );

        req.session.user = response.data.user;
        await req.session.save();
       // console.log('Token DOPO syncUserSession:', req.session.token);
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