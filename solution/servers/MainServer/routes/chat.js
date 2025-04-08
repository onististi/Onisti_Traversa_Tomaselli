var express = require('express');
var router = express.Router();
const axios = require('axios');

// Route principale per la chat
router.get('/', async function(req, res, next) {
    try {
        const moviesResponse = await axios.get("http://localhost:8080/api/movies");
        const filmList = moviesResponse.data.map(movie => ({
            id: movie.id,
            title: movie.name
        }));

        const currentFilm = filmList.length > 0 ? filmList[0] : { id: 0, title: 'Nessun film disponibile' };

        // Messaggi di esempio (qui potresti fare una chiamata API per messaggi reali)
        const messages = [
            {
                username: 'MovieFan01',
                text: 'Qualcuno ha visto questo film?',
                time: '14:30'
            },
            {
                username: 'CinemaLover',
                text: 'Sì, è fantastico! La regia è eccellente.',
                time: '14:35'
            },
            {
                username: 'FilmCritic',
                text: 'La colonna sonora mi ha colpito particolarmente.',
                time: '14:42'
            }
        ];

        res.render('chat', {
            title: 'Cineverse - Chat',
            filmList,
            currentFilm,
            messages
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
