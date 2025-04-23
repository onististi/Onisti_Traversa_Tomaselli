const express = require('express');
const router = express.Router();
const axios = require('axios');
const { notifyUser } = require('../websocket');
const jwt = require('jsonwebtoken');

const DATA_SERVER_URL = process.env.DATA_SERVER_URL || 'http://localhost:3001';

router.post('/refresh-session', async (req, res) => {
    try {
        const userId = req.body.userId || req.session.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const response = await axios.get(`${DATA_SERVER_URL}/api/users/${userId}?t=${Date.now()}`, {
            headers: {
                'Authorization': `Bearer ${req.session.token}`,
                'X-User-Id': userId,
                'Cache-Control': 'no-store'
            }
        });

        req.session.user = {
            ...req.session.user,
            ...(response.data.user || {}),
            requestStatus: response.data.user?.requestStatus || 'none'
        };
        await req.session.save();


        await req.session.save();

        res.json({
            success: true,
            id: req.session.user.id,
            role: req.session.user.role,
            requestStatus: req.session.user.requestStatus
        });
    } catch (error) {
        console.error('Session refresh error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.post('/api/refresh-token', (req, res) => {
    // Utilizza i dati aggiornati della sessione
    const user = req.session.user;
    if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    // Genera un nuovo token con i dati aggiornati della sessione
    const newToken = jwt.sign(
        {
            id: user.id,
            username: user.username,
            role: user.role
        },
        process.env.JWT_SECRET || 'default-secret-key',
        { expiresIn: '1h' }
    );
    res.json({
        success: true,
        token: newToken
    });
});


router.post('/api/notify-user', (req, res) => {
    const { userId, requestStatus } = req.body;
    const result = notifyUser(userId, requestStatus);
    if(result) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false, message: 'Notifica fallita.' });
    }
});


module.exports = router;
