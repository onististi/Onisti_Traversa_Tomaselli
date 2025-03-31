

//ROUTE DI ESEMPIO per gestione chiamata da api, EXPRESS NON PARLA CON POSTGRE, LUI HA I FILM, CI PARLA JAVASERVER

var express = require('express');
const axios = require('axios');
var router = express.Router();

//import {getMovieById} from '../services(movieServices)';

router.get('/', function(req, res, next) { //router per pagina ricerca film generale
    res.render('movie', {title: "movies"});
});

router.get('/:id', function(req, res, next) { //router per pagina singolo film,
    // volendo si potra cambiare mettendo ? e inglobando tutto in un unico router (quello sopra) dove se id dopo? è definito (alla youtube) fa il render di un altra pagina(movie e non movies)
    const movieId = req.params.id;
    console.log("Richiesta dal Mainserver per informazioni su film");

    //qui ci deve stare la chiamata alla funzione importata dal service per la cosa richiesta (recensione/utente/oscar) ognuno con la sua route
    res.json({id : '888'});
});

module.exports = router;