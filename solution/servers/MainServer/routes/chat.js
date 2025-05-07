const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/', async function(req, res, next) {
    try {

        const filmsResponse = await axios.get(`${process.env.DATA_SERVER_URL}/chat/films`);
        const filmList = filmsResponse.data;

        const filmId = req.query.filmId;
        let currentFilm = null;
        let messages = [];
        if (filmId) {
            try {
                const messagesResponse = await axios.get(
                    `${process.env.DATA_SERVER_URL}/chat/messages/:${filmId}`
                );
                messages = messagesResponse.data.messages;
                currentFilm = filmList.find(film => film._id === filmId);
            } catch (err) {
                console.error("Errore nel recupero dei messaggi:", err);
                messages = [];
            }
        }

        let userId = null;
        let username = null;

        if (req.session && req.session.user) {
            userId = req.session.user.id;
            username = req.session.user.username;
        }
        console.log(messages)
        res.render('chat', {
            title: 'Cineverse - Chat',
            filmList,
            currentFilm,
            messages,
            filmId,
            userId,
            username,
            dataServerUrl: process.env.DATA_SERVER_WS_URL
        });
    } catch (error) {
        console.error("Errore nel caricamento della chat:", error);
        res.status(500).render('error', {
            message: "Errore nel caricamento della chat",
            error: req.app.get('env') === 'development' ? error : {}
        });
    }
});

module.exports = router;