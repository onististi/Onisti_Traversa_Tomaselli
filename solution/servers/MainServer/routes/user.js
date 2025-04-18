const express = require('express');
const router = express.Router();
const axios = require('axios');

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

router.post('/update-notification', async (req, res) => {
    try {
        const { userId, status, role } = req.body;

        if (!userId || !status || !role) {
            return res.status(400).json({ success: false, message: 'Dati mancanti' });
        }

        const io = req.app.get('io');
        io.to(`user_${userId}`).emit('status-update', {
            userId,
            status: status || 'unknown',
            role: role || 'user',
            timestamp: Date.now()
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Errore durante l\'invio della notifica:', error.message);
        res.status(500).json({ success: false, message: 'Errore interno' });
    }
});


module.exports = router;
