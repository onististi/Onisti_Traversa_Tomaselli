var express = require('express');
const axios = require('axios/dist/node/axios.cjs');
var router = express.Router();

router.get('/', function(req, res, next) { //router per pagina ricerca film generale
    res.render('movie', {title: "movies"});
});

//route per pagina del singolo film
router.get('/:id', async function(req, res, next) {
    const movieId = req.params.id;
    let responseMovie, responseActors, responseCrew;

    try {
        //console.log(`Main Server: richiesta dati per film ID ${movieId}`);
        responseMovie = await  axios.get("http://localhost:8080/api/movies/1000022");

        if (!responseMovie.data || !responseMovie.data.name)
            return res.render('movieNotFound', {title: 'Film non trovato', message: 'Film non trovato! Torna alla home page.',});

        responseActors = await  axios.get("http://localhost:8080/api/actors/movie/1000022");
        responseCrew = null;

        res.render('movie', {
            title: `Movie: ${responseMovie.data.name}`,
            movie: responseMovie.data ,//passa oggetti alla view, actors e crew non .data perche possono essere null e quinid mostrare messaggio unknown
            actors: responseActors,
            crew: responseCrew
        });

    } catch (error) {res.status(500).json({ message: "Errore nel recupero del film" })}
        //console.log(response.data);
});

module.exports = router;
