const express = require('express');
const router = express.Router();
const Message = require('../models/message');
const Movie = require('../models/movies');
const User = require('../models/users');
const mongoose = require('mongoose');

//popola sidebar coi film
router.get('/films', async (req, res) => {
    try {
        const filmsWithMessages = await Movie.find({ last_message_id: { $exists: true, $ne: null } })
            .populate({
                path: 'last_message_id',
                model: 'Message',
                populate: {
                    path: 'sender_id',
                    select: 'username'
                }
            })
            .sort({ updated_at: -1 });
        res.json(filmsWithMessages);
    } catch (error) {
        console.error("Errore nel recupero dei film con chat:", error);
        res.status(500).json({ error: 'Errore nel recupero dei film con chat' });
    }
});

router.get('/messages/:filmId', async (req, res) => {
    try {
        const filmId = req.params.filmId.replace(":", "");

        const { page = 1, limit = 50 } = req.query;

        if (!mongoose.Types.ObjectId.isValid(filmId)) {
            return res.status(400).json({ error: 'ID film non valido' });
        }

        // Cerca i messaggi per film_id
        const messages = await Message.find({ film_id: filmId })
            .sort({ created_at: -1 })
            .limit(parseInt(limit))
            .populate('sender_id', 'username')  //"join" per aggiugere nome utente

        const totalMessages = await Message.countDocuments({ film_id: filmId });

        res.json({
            messages: messages.map(msg => ({ //necessario per semplificare i dati
                _id: msg._id,
                sender: {
                    id: msg.sender_id._id,
                    username: msg.sender_id.username
                },
                film: {
                    id: msg.film_id._id,
                    title: msg.film_id.title
                },
                content: msg.content,
                time: msg.created_at.toLocaleTimeString('it-IT'),
                date: msg.created_at.toLocaleDateString('it-IT')
            })),
            total: totalMessages,
            page: parseInt(page),
            pages: Math.ceil(totalMessages / limit)
        });
    } catch (error) {
        console.error("Errore nel recupero dei messaggi:", error);
        res.status(500).json({ error: 'Errore nel recupero dei messaggi' });
    }
});

// Invia un nuovo messaggio
router.post('/messages', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { filmId, userId, username, content } = req.body;

        if (!mongoose.Types.ObjectId.isValid(filmId)) {
            return res.status(400).json({ error: 'ID film non valido' });
        }

        const newMessage = new Message({
            filmId,
            userId: userId || null,
            username,
            content
        });

        await newMessage.save({ session });

        // Aggiorna l'ultimo messaggio nel film
        await Movie.findByIdAndUpdate(
            filmId,
            { last_message_id: newMessage._id, updated_at: Date.now() },
            { session }
        );

        await session.commitTransaction();

        // Popola i dati per il socket
        const populatedMsg = await Message.findById(newMessage._id)
            .populate('filmId', 'title')
            .populate('userId', 'username');

        const io = req.app.get('io');
        if (io) {
            io.to(`film-${filmId}`).emit('new-chat-message', {
                _id: populatedMsg._id,
                filmId: populatedMsg.filmId,
                userId: populatedMsg.userId,
                username: populatedMsg.username,
                content: populatedMsg.content,
                time: populatedMsg.created_at.toLocaleTimeString('it-IT')
            });
        }

        res.status(201).json({
            _id: populatedMsg._id,
            filmId: populatedMsg.filmId,
            userId: populatedMsg.userId,
            username: populatedMsg.username,
            content: populatedMsg.content,
            time: populatedMsg.created_at.toLocaleTimeString('it-IT')
        });
    } catch (error) {
        await session.abortTransaction();
        console.error("Errore nel salvataggio del messaggio:", error);
        res.status(500).json({ error: 'Errore nel salvataggio del messaggio' });
    } finally {
        session.endSession();
    }
});

module.exports = router;