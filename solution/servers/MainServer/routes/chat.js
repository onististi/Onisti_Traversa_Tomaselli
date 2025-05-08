const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/', async function(req, res, next) {
    try {

        const filmsResponse = await axios.get(`${process.env.DATA_SERVER_URL}/chat/films`);
        const filmList = filmsResponse.data;

        const filmCode = req.query.filmCode;
        let currentFilm = null;
        let messages = [];
        if (filmCode) {
            try {
                const messagesResponse = await axios.get(
                    `${process.env.DATA_SERVER_URL}/chat/messages/:${filmCode}`
                );
                messages = messagesResponse.data.messages;
                currentFilm = filmList.find(film => film.code == filmCode);
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

        res.render('chat', {
            title: 'Cineverse - Chat',
            filmList,
            currentFilm,
            messages,
            filmCode,
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