const User = require('../models/users');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Configurazione per la notifica via frontend server
const FRONTEND_SERVER_URL = process.env.FRONTEND_SERVER_URL || 'http://localhost:3000';
//handler implementato dalla route
exports.requestJournalist = async (req, res) => {
    try {
        const { motivation } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: 'Utente non trovato' });

        if (user.role !== 'user') {       //se l'utente non esiste o non ha come ruolo quello base quindi gia giornalista o master restituisce errore
            return res.status(400).json({
                success: false,
                message: 'You are already a journalist or master'
            });
        }

        user.requestStatus = 'pending';  //se no salva la request nel document mongo dell user
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
        console.log('getPendingRequests called by user:', req.user?.id);
        console.log('Role of requester:', req.user?.role);

        const masterUser = await User.findById(req.user.id);

        if (!masterUser || masterUser.role !== 'master') { //solo il master può vedere le richieste
            console.warn('Unauthorized attempt to access pending requests by user:', req.user?.id);
            return res.status(403).json({
                success: false,
                message: 'Accesso negato'
            });
        }

        const pendingRequests = await User.find({ requestStatus: 'pending' }) //richieste da accettare
            .select('username email requestStatus created_at motivation _id');

        console.log('Found pending requests:', pendingRequests.length);

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
 //handler per approvare o rifiutare richieste
exports.handleRequest = async (req, res) => {
    console.log('Token ricevuto da Authorization:', req.headers.authorization);

    try {
        const { userId, action, reason } = req.body;
        console.log('Processing request for user:', userId, 'Action:', action);

        // Aggiorna l'utente nel database in base all azione e al suo id estratti dalla request
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
            console.warn('User not found when handling request:', userId);
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        console.log('User updated successfully:', user.username, 'New status:', user.requestStatus);

        // Notifica l'utente del cambiamento di stato
        await notifyUserViaHTTP(userId, user.requestStatus, user.role);

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

const notifyUserViaHTTP = async (userId, requestStatus, role) => {
    try {
        console.log(`Tentativo di notifica HTTP per userId ${userId}, status: ${requestStatus}, role: ${role}`);

        const response = await axios.post(`${FRONTEND_SERVER_URL}/user/api/notify-user`, {
            userId,
            requestStatus,
            role
        });

        console.log('Notifica HTTP inviata con successo:', response.data);
        return response.data.success;
    } catch (error) {
        console.error('Errore nell\'invio della notifica via HTTP:', error.message);
        return false;
    }
};