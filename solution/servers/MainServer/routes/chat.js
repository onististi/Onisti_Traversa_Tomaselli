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
