var express = require('express');
var router = express.Router();
const axios = require('axios');

const DATA_SERVER_URL = process.env.DATA_SERVER_URL || 'http://localhost:8080/api';
const DATA_SERVER_WS_URL = process.env.DATA_SERVER_WS_URL || 'http://localhost:8080';

router.get('/', async function(req, res, next) {
    try {

        const moviesResponse = await axios.get(`${DATA_SERVER_URL}/movies`);
        const filmList = moviesResponse.data.map(movie => ({
            id: movie.id || movie._id,
            title: movie.name || movie.title
        }));


        const filmId = req.query.filmId || (filmList.length > 0 ? filmList[0].id : null);
        const currentFilm = filmList.find(film => film.id === filmId) ||
            { id: 0, title: 'Nessun film disponibile' };


        let messages = [];
        if (filmId) {
            try {
                const messagesResponse = await axios.get(`${DATA_SERVER_URL}/chat/messages/${filmId}`);
                messages = messagesResponse.data.map(msg => ({
                    username: msg.username,
                    text: msg.text,
                    time: new Date(msg.timestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
                    userId: msg.userId
                }));
            } catch (chatErr) {
                console.error('Errore nel recupero dei messaggi:', chatErr);

            }
        }

        let userId = null;
        let username = null;

        if (req.cookies && req.cookies.userId) {
            userId = req.cookies.userId;
            try {
                const userResponse = await axios.get(`${DATA_SERVER_URL}/users/${userId}`);
                username = userResponse.data.username;
            } catch (userErr) {
                console.error('Errore nel recupero delle informazioni utente:', userErr);
            }
        }

        res.render('chat', {
            title: 'Cineverse - Chat',
            filmList,
            currentFilm,
            messages,
            filmId,
            userId,
            username,
            dataServerUrl: DATA_SERVER_WS_URL // URL del server WebSocket
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