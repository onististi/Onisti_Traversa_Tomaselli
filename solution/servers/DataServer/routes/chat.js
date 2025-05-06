const express = require('express');
const router = express.Router();
const Message = require('../models/message');
const mongoose = require('mongoose');

router.get('/messages/:filmId', async (req, res) => {
    try {
        const filmId = req.params.filmId;

        if (!filmId) {
            return res.status(400).json({ error: 'ID film mancante' });
        }

        if (!mongoose.Types.ObjectId.isValid(filmId)) {
            return res.status(400).json({ error: 'ID film non valido' });
        }

        const messages = await Message.find({ filmId })
            .sort({ timestamp: 1 })
            .limit(100)
            .lean();

        // Formatta i timestamp
        const formattedMessages = messages.map(msg => ({
            ...msg,
            time: new Date(msg.timestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
        }));

        res.json(formattedMessages);
    } catch (error) {
        console.error('Errore nel recupero dei messaggi:', error);
        res.status(500).json({ error: 'Errore nel recupero dei messaggi' });
    }
});

router.post('/messages', async (req, res) => {
    try {
        const { filmId, username, text, userId } = req.body;

        if (!filmId || !username || !text) {
            return res.status(400).json({ error: 'filmId, username e text sono obbligatori' });
        }

        if (!mongoose.Types.ObjectId.isValid(filmId)) {
            return res.status(400).json({ error: 'ID film non valido' });
        }

        const newMessage = new Message({
            filmId,
            username,
            text,
            userId: userId || null,
            timestamp: new Date()
        });

        const savedMessage = await newMessage.save();
        const formattedMessage = {
            ...savedMessage.toObject(),
            time: new Date(savedMessage.timestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
        };

        const io = req.app.get('io');
        if (io) {
            io.to(`film-${filmId}`).emit('new-chat-message', formattedMessage);
        }

        res.status(201).json(formattedMessage);
    } catch (error) {
        console.error('Errore nel salvataggio del messaggio:', error);
        res.status(500).json({ error: 'Errore nel salvataggio del messaggio' });
    }
});

router.delete('/messages/:messageId', async (req, res) => {
    try {
        const messageId = req.params.messageId;

        if (!mongoose.Types.ObjectId.isValid(messageId)) {
            return res.status(400).json({ error: 'ID messaggio non valido' });
        }

        const deletedMessage = await Message.findByIdAndDelete(messageId);

        if (!deletedMessage) {
            return res.status(404).json({ error: 'Messaggio non trovato' });
        }

        const io = req.app.get('io');
        if (io) {
            io.to(`film-${deletedMessage.filmId}`).emit('message-deleted', { messageId });
        }

        res.status(200).json({ message: 'Messaggio eliminato con successo' });
    } catch (error) {
        console.error('Errore nell\'eliminazione del messaggio:', error);
        res.status(500).json({ error: 'Errore nell\'eliminazione del messaggio' });
    }
});

module.exports = router;