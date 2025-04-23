const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Rotte GET per login e registrazione
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

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const response = await axios.post(`${process.env.DATA_SERVER_URL}/api/auth/login`, {
            username,
            password
        });

        const { token, id, email, role, requestStatus } = response.data;
        req.session.isLoggedIn = true;
        req.session.user = { id, username, email, role, requestStatus };
        req.session.token = token;

        console.log('Token salvato nella sessione:', req.session.token);

        await new Promise((resolve, reject) => {
            req.session.save(err => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Redirect alla route per sincronizzare la sessione
        res.redirect('/refresh-user-status');
    } catch (error) {
        res.render('login', {
            title: 'Login',
            error: error.response?.data?.message || 'Login fallito',
            username: req.body.username
        });
    }
});



// Registrazione
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

        const response = await axios.post(`${process.env.DATA_SERVER_URL}/api/auth/register`, {
            username,
            email,
            password
        });

        if (response.data.success) {
            // Reindirizza al login con messaggio di successo
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

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect('/auth/login');
    });
});


router.get('/check', async (req, res) => {
    try {
        if (!req.session?.token) {
            console.error('Token mancante nella sessione');
            return res.status(401).json({ authenticated: false, message: 'Token mancante' });
        }

        console.log('Token salvato nella sessione:', req.session.token);

        const response = await axios.get(
            `${process.env.DATA_SERVER_URL}/api/users/${req.session.user.id}`,
            {
                headers: {
                    'Authorization': `Bearer ${req.session.token}`
                }
            }
        );

        console.log('Risposta dal DataServer:', response.data);
        return res.status(200).json({ authenticated: true });
    } catch (error) {
        console.error('Errore durante la verifica dell\'autenticazione:', error.message);
        res.status(401).json({ authenticated: false });
    }
});


module.exports = router;