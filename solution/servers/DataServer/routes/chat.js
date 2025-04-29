const express = require('express');
const router = express.Router();
const Message = require('../models/message');
const mongoose = require('mongoose');

router.get('/messages/:filmId', async (req, res) => {
    try {
        const filmId = req.params.filmId;

        if (!mongoose.Types.ObjectId.isValid(filmId)) {
            return res.status(400).json({ error: 'ID film non valido' });
        }

        const messages = await Message.find({ filmId })
            .sort({ timestamp: 1 })
            .limit(100); // Limita il numero di messaggi restituiti per prestazioni

        res.json(messages);
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
            userId: userId || null
        });

        const savedMessage = await newMessage.save();

        const io = req.app.get('io');
        if (io) {
            io.emit('new-chat-message', savedMessage);
        }

        res.status(201).json(savedMessage);
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

        await Message.findByIdAndDelete(messageId);
        res.status(200).json({ message: 'Messaggio eliminato con successo' });
    } catch (error) {
        console.error('Errore nell\'eliminazione del messaggio:', error);
        res.status(500).json({ error: 'Errore nell\'eliminazione del messaggio' });
    }
});

module.exports = router;