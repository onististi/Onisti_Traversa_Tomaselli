var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) { //router per pagina ricerca film generale
    res.render('actors', {title: "movies"});
});

router.get(':id', function(req, res, next) { //router per pagina singolo film,
    //stessa cosa detta in movies
    const actorId = req.params.id;
    res.render('actor', {title: "actor"+actorId});
});

module.exports = router;
