const User = require('../models/User');

exports.getUserById = async (req, res) => {
    try {
        const userId = req.params.id;

        // Protezione contro ID indefiniti
        if (!userId || userId === 'undefined') {
            return res.status(400).json({
                success: false,
                message: 'ID utente mancante o non valido'
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utente non trovato'
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                requestStatus: user.requestStatus
            }
        });
    } catch (error) {
        console.error('Errore nel recupero utente:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};