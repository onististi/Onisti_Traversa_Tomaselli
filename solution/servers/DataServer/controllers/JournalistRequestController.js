const User = require('../models/User');
const jwt = require('jsonwebtoken');
const axios = require('axios');

exports.requestJournalist = async (req, res) => {
    try {
        const { motivation } = req.body
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: 'Utente non trovato' });

        if (user.role !== 'user') {
            return res.status(400).json({
                success: false,
                message: 'You are already a journalist or master'
            });
        }

        user.requestStatus = 'pending';
        user.motivation = motivation;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Request submitted successfully'
        });
    } catch (error) {
        console.error('Error in requestJournalist:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

exports.getPendingRequests = async (req, res) => {
    try {
        const masterUser = await User.findById(req.user.id);

        if (!masterUser || masterUser.role !== 'master') {
            return res.status(403).json({
                success: false,
                message: 'Accesso negato'
            });
        }

        const pendingRequests = await User.find({ requestStatus: 'pending' })
            .select('username email requestStatus created_at motivation');

        res.status(200).json({
            success: true,
            requests: pendingRequests
        });
    } catch (error) {
        console.error('Error in getPendingRequests:', error);
        res.status(500).json({
            success: false,
            message: 'Errore nel recupero delle richieste pendenti',
            error: error.message
        });
    }
};


exports.handleRequest = async (req, res) => {
    console.log('Token ricevuto da Authorization:', req.headers.authorization);

    try {
        const { userId, action, reason } = req.body;

        // Aggiorna l'utente nel database
        const user = await User.findByIdAndUpdate(
            userId,
            {
                requestStatus: action === 'approve' ? 'approved' : 'rejected',
                ...(action === 'approve' && { role: 'journalist' }),
                ...(action === 'reject' && { rejectionReason: reason || 'No reason provided' })
            },
            { new: true } // Restituisci l'utente aggiornato
        );

        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        console.log('Prima della chiamata a notifyUserViaHTTP');
        await notifyUserViaHTTP(userId, user.requestStatus);
        console.log('Dopo la chiamata a notifyUserViaHTTP');

        // Genera un nuovo token JWT solo se l'azione è "approve"
        let newToken = null;
        if (action === 'approve') {
            newToken = jwt.sign(
                {
                    id: user.id,
                    username: user.username,
                    role: user.role
                },
                process.env.JWT_SECRET || 'default-secret-key',
                { expiresIn: '1h' }
            );
        }
        console.log('User restituito dal DataServer:', user);
        res.json({
            success: true,
            user,
            ...(newToken && { token: newToken }) // Restituisci il nuovo token se generato
        });
    } catch (error) {
        console.error('Errore gestione richiesta:', error.message);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};


const notifyUserViaHTTP = async (userId, requestStatus) => {
    try {
        const response = await axios.post('http://localhost:3000/user/api/notify-user', {
            userId,
            requestStatus
        });
        console.log('Notifica HTTP inviata con successo:', response.data);
        return response.data.success;
    } catch (error) {
        console.error('Errore nell\'invio della notifica via HTTP:', error.message);
        return false;
    }
};