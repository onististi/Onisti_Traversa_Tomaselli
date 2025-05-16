const express = require('express');
const router = express.Router();
const Chat = require('../models/chats');

router.get('/', async (req, res, next) => {
    try {
        // Recupera tutte le chat distinte per filmId
        const chats = await Chat.aggregate([
            { $group: { _id: "$filmId" } },
            { $project: { filmId: "$_id", _id: 0 } }
        ]);

        // Qui potresti integrare con dati esterni se necessario
        const moviesWithChats = chats.map(chat => ({
            id: chat.filmId,
            title: `Film ${chat.filmId}`, // Sostituisci con il titolo reale se hai i dati
            hasChat: true
        }));

        res.json(moviesWithChats);
    } catch (error) {
        console.error('Errore nel recupero dei film con chat:', error);
        res.status(500).json({ error: 'Errore nel recupero dei film' });
    }
});

// Ottieni dettagli di un film specifico
router.get('/:id', async (req, res, next) => {
    try {
        const movieId = req.params.id;

        // Verifica se esiste almeno una chat per questo film
        const chatExists = await Chat.exists({ filmId: movieId });

        res.json({
            id: movieId,
            title: `Film ${movieId}`, // Sostituisci con il titolo reale
            hasChat: chatExists
        });
    } catch (error) {
        console.error('Errore nel recupero del film:', error);
        res.status(500).json({ error: 'Errore nel recupero del film' });
    }
});

module.exports = router;