const express = require('express');
const router = express.Router();
const axios = require('axios');
const { ensureAuthenticated } = require('../middleware/auth');

// Fix the DATA_SERVER_URL handling
const baseUrl = process.env.DATA_SERVER_URL || 'http://localhost:3001';
// Check if DATA_SERVER_URL already contains /api
const apiPath = baseUrl.endsWith('/api') ? '' : '/api';

// Ottieni i dati di un utente
router.get('/:id', ensureAuthenticated, async (req, res) => {
    try {
        const response = await axios.get(
            `${baseUrl}${apiPath}/users/${req.params.id}`,
            {
                headers: {
                    'Authorization': `Bearer ${req.session.token}`,
                    'X-User-Id': req.params.id
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        res.status(500).json({
            error: error.response?.data?.message || 'Error fetching user data'
        });
    }
});

// Endpoint per aggiornare la sessione dell'utente
router.post('/refresh-session', ensureAuthenticated, async (req, res) => {
    try {
        const response = await axios.get(
            `${baseUrl}${apiPath}/users/${req.session.user.id}`,
            {
                headers: {
                    'Authorization': `Bearer ${req.session.token}`,
                    'X-User-Id': req.session.user.id
                }
            }
        );

        req.session.user = { ...req.session.user, ...response.data.user };

        req.session.save((err) => {
            if (err) {
                console.error('Error saving session:', err);
                return res.status(500).json({ success: false, message: 'Error saving session' });
            }
            res.json({ success: true, user: req.session.user });
        });
    } catch (error) {
        console.error('Error refreshing session:', error.message || error);
        res.status(500).json({ success: false, message: 'Error refreshing user data' });
    }
});

module.exports = router;