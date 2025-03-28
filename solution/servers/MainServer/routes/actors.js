var express = require('express');
const axios = require('axios');
var router = express.Router();

//pagina ricerca attori
router.get('/', function(req, res, next) { //router per pagina ricerca film generale
    res.render('actors', {title: "Actors"});
});


//route per pagina del singolo attore
router.get("/:name", async function(req, res, next) {
    const actorName = req.params.name;
    let responseActor, responseMovies;

    try {
        responseActor = await axios.get("http://localhost:8080/api/actors/"+actorName);// se non lo trova catch 404

        responseMovies = await axios.get("http://localhost:8080/api/actors/"+actorName+"/movies");

        let highestRated = 0;
        let lowestRated = 0;

        if (responseMovies.data && responseMovies.data.length > 0) {
           responseMovies.data.forEach((movieData)=>{
               if(movieData.movie.rating != null && movieData.movie.rating > highestRated)
                   highestRated = movieData.movie.rating;

               else if(movieData.movie.rating!= null && lowestRated == 0) // per assegnare il primo valore non null al lowest per non fare paragone con 0 che sarebbe sempre il minore
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
            highestRated : highestRated,
            lowestRated : lowestRated
        }

        res.render('actor', {
            title: "Actor: "+actorName,
            actor : actor,
            movies: initialMovies,
            hasMoreMovies: hasMoreMovies
        });
    } catch (error) {
        if (error.response && error.response.status === 404)
            return res.render('NotFound', { title: 'Attore non trovato', message: 'Attore non trovato! Torna alla home page.'});
        res.status(500).json({ message: "Errore nel recupero dell'attore" })
    }
});

module.exports = router;
