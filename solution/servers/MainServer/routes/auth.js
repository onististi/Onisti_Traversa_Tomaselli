const express = require('express');
const router = express.Router();
const axios = require('axios');

// Configurazione endpoint DataServer
const DATA_SERVER_URL = 'http://localhost:3001';

// Pagina di login
router.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

// Gestione login POST
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Invia richiesta a DataServer
        const response = await axios.post(`${DATA_SERVER_URL}/api/auth/login`, {
            username,
            password
        });

        // Se l'autenticazione ha successo
        if (response.data.success) {
            // Salva l'utente in sessione
            req.session.user = response.data.user;
            req.session.isLoggedIn = true;

            // Reindirizza alla dashboard o homepage
            return res.redirect('/');
        }
    } catch (error) {
        console.error('Login error:', error.response ? error.response.data : error.message);
        // Torna alla pagina di login con errore
        return res.render('login', {
            title: 'Login',
            error: 'Username o password non validi',
            username: req.body.username
        });
    }
});

// Pagina di registrazione
router.get('/register', (req, res) => {
    res.render('register', { title: 'Registrazione' });
});

// Gestione registrazione POST
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        // Validazione lato client
        if (password !== confirmPassword) {
            return res.render('register', {
                title: 'Registrazione',
                error: 'Le password non corrispondono',
                username,
                email
            });
        }

        // Invia richiesta a DataServer
        const response = await axios.post(`${DATA_SERVER_URL}/api/auth/register`, {
            username,
            email,
            password
        });

        // Se la registrazione ha successo
        if (response.data.success) {
            // Reindirizza alla pagina di login con messaggio di successo
            return res.render('login', {
                title: 'Login',
                success: 'Registrazione completata! Ora puoi effettuare il login',
                username
            });
        }
    } catch (error) {
        console.error('Registration error:', error.response ? error.response.data : error.message);
        // Torna alla pagina di registrazione con errore
        return res.render('register', {
            title: 'Registrazione',
            error: error.response ? error.response.data.message : 'Errore durante la registrazione',
            username: req.body.username,
            email: req.body.email
        });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;