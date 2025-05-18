const express = require('express');
const router = express.Router();
const axios = require('axios');
const { getIO, notifyUser } = require('../websocket');
const { ensureAuthenticated, ensureMaster } = require('../middleware/auth');

const DATA_SERVER_URL = process.env.DATA_SERVER_URL || 'http://localhost:3001';

// Pagina richiesta giornalista
router.get('/request', ensureAuthenticated, (req, res) => {
    res.render('requestJournalist', {
        userStatus: req.session.user.requestStatus,
        userId: req.session.user.id
    });
});

// Invia richiesta
router.post('/request', ensureAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user?.id;

        if (!userId) {
            throw new Error('User ID non presente nella sessione');
        }

        const { motivation } = req.body;

        await axios.post(
            `${DATA_SERVER_URL}/requests/request`,
            { motivation },
            {
                headers: {
                    'Authorization': `Bearer ${req.session.token}`,
                    'X-User-Id': userId
                }
            }
        );

        // Aggiorna i dati utente
        const response = await axios.get(
            `${DATA_SERVER_URL}/users/${userId}`,
            {
                headers: {
                    'Authorization': `Bearer ${req.session.token}`,
                    'X-User-Id': userId
                }
            }
        );

        // Aggiorna la sessione
        req.session.user = response.data.user;
        await req.session.save();

        res.redirect('/?success=Richiesta inviata con successo');
    } catch (error) {
        console.error('Errore richiesta journalist:', error);
        res.render('requestJournalist', {
            error: error.response?.data?.message || 'Errore durante l\'invio della richiesta'
        });
    }
});


// Endpoint per verificare lo stato corrente
router.get('/status', ensureAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Utente non autenticato' });
        }

        const response = await axios.get(
            `${DATA_SERVER_URL}/users/${userId}`,
            {
                headers: {
                    'Authorization': `Bearer ${req.session.token}`,
                    'X-User-Id': userId
                }
            }
        );

        if (!response.data?.user) {
            return res.status(500).json({ error: 'Risposta API invalida' });
        }

        // Aggiorna la sessione
        req.session.user = {
            ...req.session.user,
            ...response.data.user,
            requestStatus: response.data.user.requestStatus || 'none'
        };

        await req.session.save();

        res.json({
            userId: userId,
            requestStatus: response.data.user.requestStatus || 'none',
            role: response.data.user.role || 'user'
        });
    } catch (error) {
        console.error('Error fetching status:', error);
        res.status(500).json({ error: 'Errore nel recupero dello stato' });
    }
});

module.exports = router;