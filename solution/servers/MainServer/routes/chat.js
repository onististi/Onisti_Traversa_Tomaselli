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
                    `${process.env.DATA_SERVER_URL}/chat/messages/${filmCode}`
                );
                messages = messagesResponse.data.messages;
                currentFilm = filmList.find(film => film.code == filmCode);
            } catch (err) {
                console.error("Errore nel recupero dei messaggi:", err);
                messages = [];
            }
        }

        let userData = {
            userId: null,
            username: null,
            role: 'guest',
            requestStatus: 'none'
        };

        if (req.session && req.session.user) {
            userData = {
                userId: req.session.user.id,
                username: req.session.user.username,
                role: req.session.user.role || 'user',
                requestStatus: req.session.user.requestStatus || 'none'
            };
        }

        res.render('chat', {
            title: 'Cineverse - Chat',
            filmList,
            currentFilm,
            messages,
            filmCode,
            userId: userData.userId,
            username: userData.username,
            role: userData.role,
            requestStatus: userData.requestStatus,
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

router.post('/message', async function(req, res) {
    try {
        // Verifica autenticazione
        if (!req.session || !req.session.user) {
            return res.status(401).json({ error: 'Non autorizzato' });
        }

        const { filmId, content } = req.body;

        if (!filmId || !content) {
            return res.status(400).json({ error: 'Dati mancanti' });
        }


        const messageData = {
            filmId,
            userId: req.session.user.id,
            username: req.session.user.username,
            content,
            timestamp: new Date()
        };


        const response = await axios.post(
            `${process.env.DATA_SERVER_URL}/chat/messages`,
            messageData,
            {
                headers: {
                    'Authorization': `Bearer ${req.session.token}`
                }
            }
        );


        res.status(201).json(response.data);
    } catch (error) {
        console.error("Errore nel salvataggio del messaggio:", error);
        res.status(500).json({ error: 'Errore nel salvataggio del messaggio' });
    }
});

module.exports = router;