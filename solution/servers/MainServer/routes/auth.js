var express = require('express');
var router = express.Router();

//le routes dovranno gestire le richieste da inviare al dataserver che fara la query su mongo per autenticazione
//non caricare altre pagine in quanto il login sara solo una finestrella sopra alla pagina in cui ci si trova

router.get('/signup', function(req, res, next) { //router per pagina ricerca film generale
   // res.render('movie', {title: "movies"});  //qui come opzione alla ricarica della pagina passera che è stato effettuato login per il cambio della navbar
});

router.get('/login', function(req, res, next) {
  //  res.render('movie', {title: "movie"+movieId});
});

module.exports = router;
