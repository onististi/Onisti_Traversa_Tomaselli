var express = require('express');
const axios = require('axios');
var router = express.Router();

router.get('/', function(req, res, next) { //router per pagina ricerca film generale
    res.render('movie', {title: "movies"});
});

//route per pagina del singolo film
router.get('/:id', async function(req, res, next) {
    // volendo si potra cambiare mettendo ? e inglobando tutto in un unico router (quello sopra) dove se id dopo? è definito (alla youtube) fa il render di un altra pagina(movie e non movies)
    const movieId = req.params.id;
    let response;
    try {
        console.log(`Main Server: richiesta dati per film ID ${movieId}`);


        //response = await axios.get("http://localhost:3001/api/movies/"+{movieId});  funzionante ma per dataserver (leggi nella route e service in dataserver)
        response = await  axios.get("http://localhost:8080/api/movies/2");

    } catch (error) {res.status(500).json({ message: "Errore nel recupero del film" })}

   res.render('movie', {title: "movie"+movieId+ " "+JSON.stringify(response.data)});
});


/*le richieste per il caricamento del film saranno gestite quelle possibili(credo la maggiorparte) tramite queste routes
che chiederanno al dataserver la richiesta(poi lui la query al db) corretta per la pagina richiesta
il javascript della pagina(quelli presenti in public ) si occuperanno del rendering
tipo dataserver/api/richiesta che tramite le routes redirizera ad un controler (credo per ora)

es routes dataserver:
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

router.get('/trending', reviewController.getTrendingReviews);
router.get('/movie/:movieId', reviewController.getReviewsByMovie);
router.post('/', reviewController.createReview);

al dataserver sono bloccate tutte le richieste tranne quelle che iniziano con /api/ dato che si occupa solo di quello, sara da fare anche per il server java
e bisogna vedere anche controlli per le credenziali dell'utente? per fare tipo il gestore delle chat e delle recensioni??
*/

module.exports = router;
