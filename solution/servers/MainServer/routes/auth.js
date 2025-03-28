const express = require('express');
const router = express.Router();
const axios = require('axios/dist/node/axios.cjs');

// Configurazione endpoint JavaServer
const JAVA_SERVER_URL = 'http://localhost:8080';

// Pagina di registrazione
router.get('/register', (req, res) => {
    res.render('register', {
        title: 'Registrazione',
        // Rimuovi eventuali vecchi messaggi di sessione
        error: null,
        success: null
    });
});

// Gestione registrazione POST
router.post('/register', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    // Validazione lato server
    if (password !== confirmPassword) {
        return res.render('register', {
            title: 'Registrazione',
            error: 'Le password non corrispondono',
            username,
            email
        });
    }

    try {
        // Invia richiesta a JavaServer
        const response = await axios.post(`${JAVA_SERVER_URL}/api/auth/register`, {
            username,
            email,
            password
        });

        // Se la registrazione ha successo
        if (response.data.success) {
            // Passa il messaggio di successo direttamente alla vista login
            return res.render('login', {
                title: 'Login',
                success: 'Registrazione completata! Ora puoi effettuare il login'
            });
        }
    } catch (error) {
        console.error('Registration error:', error.response ? error.response.data : error.message);

        // Gestione errori da JavaServer
        const errorMessage = error.response
            ? error.response.data.message
            : 'Errore durante la registrazione';

        return res.render('register', {
            title: 'Registrazione',
            error: errorMessage,
            username,
            email
        });
    }
});

module.exports = router;