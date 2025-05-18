const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { notifyUser } = require('../websocket');

router.get('/login', (req, res) => {
    res.render('login', {
        title: 'Login',
        error: req.query.error,
        success: req.query.success
    });
});

router.get('/register', (req, res) => {
    res.render('register', {
        title: 'Registrazione',
        error: req.query.error,
        username: req.query.username,
        email: req.query.email
    });
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Effettua la richiesta di login
        const response = await axios.post(`${process.env.DATA_SERVER_URL}/auth/login`, {
            username,
            password
        });

        const { token, id, email, role, requestStatus } = response.data;
        console.log('Token ricevuto dal DataServer:', token);

        // Verifica il token
        try {
            jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key');
        } catch (error) {
            console.error('Errore nella verifica del token:', error.message);
            return res.render('login', {
                title: 'Login',
                error: 'Token non valido. Contatta il supporto.'
            });
        }

        // Aggiorna la sessione
        req.session.isLoggedIn = true;
        req.session.user = { id, username, email, role, requestStatus };
        req.session.token = token;

        // Salva la sessione
        await new Promise((resolve, reject) => {
            req.session.save(err => err ? reject(err) : resolve());
        });

        // Richiedi dati freschi dall'API
        const userResponse = await axios.get(
            `${process.env.DATA_SERVER_URL}/users/${id}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        // Aggiorna la sessione con i dati più recenti
        req.session.user = userResponse.data.user;
        await req.session.save();

        // Notifica via WebSocket
        notifyUser(id, userResponse.data.user.requestStatus, userResponse.data.user.role);

        res.redirect('/');
    } catch (error) {
        res.render('login', {
            title: 'Login',
            error: error.response?.data?.message || 'Login fallito',
            username: req.body.username
        });
    }
});

router.post('/register', async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.render('register', {
                title: 'Registrazione',
                error: 'Le password non coincidono',
                username,
                email
            });
        }

        const response = await axios.post(`${process.env.DATA_SERVER_URL}/auth/register`, {
            username,
            email,
            password
        });

        if (response.data.success) {
            return res.redirect('/auth/login?success=Registrazione completata! Ora puoi fare il login');
        }

    } catch (error) {
        res.render('register', {
            title: 'Registrazione',
            error: error.response?.data?.message || 'Errore durante la registrazione',
            username: req.body.username,
            email: req.body.email
        });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect('/auth/login');
    });
});

router.get('/check', async (req, res) => {
    try {
        if (!req.session?.token) {
            return res.status(401).json({ authenticated: false, message: 'Token mancante' });
        }

        const response = await axios.get(
            `${process.env.DATA_SERVER_URL}/users/${req.session.user.id}`,
            {
                headers: {
                    'Authorization': `Bearer ${req.session.token}`
                }
            }
        );

        return res.status(200).json({ authenticated: true });
    } catch (error) {
        res.status(401).json({ authenticated: false });
    }
});

module.exports = router;