var express = require('express');
const axios = require('axios');
var router = express.Router();

router.get('/', function(req, res, next) { //router per pagina ricerca film generale
    res.render('movie', {title: "movies"});
});

//route per pagina del singolo film
router.get('/:id', async function(req, res, next) {
    const movieId = req.params.id;
    let responseMovie, responseActors, responseCrew;

    try {
        responseMovie = await  axios.get("http://localhost:8080/api/movies/"+encodeURIComponent(movieId.replace(":",""))); // se non lo trova catch per errore 404

        responseActors = await  axios.get("http://localhost:8080/api/actors/movie/"+encodeURIComponent(movieId.replace(":","")));
        responseCrew =  await  axios.get("http://localhost:8080/api/crews/"+encodeURIComponent(movieId.replace(":","")));

        res.render("movie", {
            title: "Movie: "+responseMovie.data.name,
            movie: responseMovie.data ,//passa oggetti alla view, actors e crew non .data perche possono essere null e quinid mostrare messaggio unknown
            actors: responseActors,
            crew: responseCrew
        });

        } catch (error) {
        if (error.response && error.response.status === 404)
            return res.render('NotFound', { title: 'Attore non trovato', message: 'Attore non trovato! Torna alla home page.' });
        res.status(500).json({ message: "Errore nel recupero del film" })
        }
});
module.exports = router;