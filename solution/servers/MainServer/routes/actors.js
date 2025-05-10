var express = require('express');
const axios = require('axios');
var router = express.Router();

//pagina ricerca attori
router.get('/', async function(req, res, next) {
    try {
        const response = await axios.get("http://localhost:8080/api/actors");
        let actors = response.data;
        res.render('actors', {actors: actors});

    } catch (error) {return res.status(500).json({ message: "Errore nel recupero degli attori" });}
});

//route per pagina del singolo attore
router.get("/:name", async function(req, res, next) {
    const actorName = req.params.name;
    let responseActor, responseMovies;
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 8;

    try {
        const responseMovies = await axios.get(`http://localhost:8080/api/actors/${encodeURIComponent(actorName)}/movies?page=${page}&size=${size}`);

        let highestRated = 0;
        let lowestRated = 0;

        if (responseMovies.data && responseMovies.data.length > 0) {
            responseMovies.data.forEach((movieData) => {
                if (movieData.movie.rating != null && movieData.movie.rating > highestRated)
                    highestRated = movieData.movie.rating;
                if (movieData.movie.rating != null && (lowestRated === 0 || movieData.movie.rating < lowestRated))
                    lowestRated = movieData.movie.rating;
            });
        }

        const hasMoreMovies = responseMovies.data.length === size; // Controlla se ci sono altri film
        let actor = { name: actorName, highestRated, lowestRated };

        res.render('actor', {
            actor,
            movies: responseMovies.data,
            hasMoreMovies
        });
    } catch (error) {
        if (error.response && error.response.status === 404)
            return res.render('NotFound', { title: 'Attore non trovato', message: 'Attore non trovato! Torna alla home page.'});
        res.status(500).json({ message: "Errore nel recupero dell'attore" });
    }
});

module.exports = router;
