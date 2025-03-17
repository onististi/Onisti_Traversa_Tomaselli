var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) { //router per pagina ricerca film generale
    res.render('movie', {title: "movies"});
});

router.get(':id', function(req, res, next) { //router per pagina singolo film,
    // volendo si potra cambiare mettendo ? e inglobando tutto in un unico router (quello sopra) dove se id dopo? è definito (alla youtube) fa il render di un altra pagina(movie e non movies)
    const movieId = req.params.id;
    res.render('movie', {title: "movie"+movieId});
});


/*le richieste per il caricamento del film saranno gestite quelle possibili(credo la maggiorparte) tramite queste routes che chiederanno al dataserver la richiesta(poi lui la query al db) corretta per la pagina richiesta
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
