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
    const page = req.query.page || 0;
    const size = req.query.size || 8;

    try {
        responseActor = await axios.get("http://localhost:8080/api/actors/"+actorName);
        responseMovies = await axios.get("http://localhost:8080/api/actors/"+encodeURIComponent(actorName)+"/movies");

        let highestRated = 0;
        let lowestRated = 0;

        //assegnazione highet e lowestrated dell'attore
        if (responseMovies.data && responseMovies.data.length > 0) {
            responseMovies.data.forEach((movieData)=>{
                if(movieData.movie.rating != null && movieData.movie.rating > highestRated)
                    highestRated = movieData.movie.rating;
                else if(movieData.movie.rating!= null && lowestRated == 0)
                    lowestRated = movieData.movie.rating;
                else if(movieData.movie.rating != null && movieData.movie.rating <lowestRated)
                    lowestRated = movieData.movie.rating;
            })
        }

        //verifica se ci sono più film da caricare da pulsante
        const hasMoreMovies = responseMovies.data.length > 8;
        const initialMovies = responseMovies.data.slice(0, 8);

        let actor = {
            name : actorName,
            id : responseActor.data.id,
            highestRated : highestRated,
            lowestRated : lowestRated,
            movies_count : responseActor.data.movies_count
        }

        res.render('actor', {
            actor : actor,
            movies: initialMovies,
            hasMoreMovies: hasMoreMovies,
        });
    } catch (error) {
        if (error.response && error.response.status === 404)
            return res.render('NotFound', { title: 'Actor not found', message: 'Actor not found! Return to home page.'});
        res.status(500).json({ message: "Errore nel recupero dell'attore" })
    }
});

module.exports = router;
