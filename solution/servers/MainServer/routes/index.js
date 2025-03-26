var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Express',
    categories: [
      {
        title: "Oscar's Winner",
        movies: [
          {
            image: "/images/placeholder-movie.jpeg",
            title: "Film 1",
            description: "Descrizione del film 1",
            extraInfo: "Extra 1"
          },
          {
            image: "/images/placeholder-movie1.jpg",
            title: "Avengers Endgame",
            description:"Basato sul gruppo dei Vendicatori di Marvel Comics, è il 22º film del Marvel Cinematic Universe (MCU) e sequel di Avengers: Infinity War (2018).",
            extraInfo: "Oscar Miglior Film"
          },
          {
            image: "https://via.placeholder.com/100x150.png?text=Film+2",
            title: "Film 2",
            description: "Descrizione del film 2",
            extraInfo: "Extra 2"
          },
          {
            image: "https://via.placeholder.com/100x150.png?text=Film+2",
            title: "Film 2",
            description: "Descrizione del film 2",
            extraInfo: "Extra 2"
          },
          {
            image: "https://via.placeholder.com/100x150.png?text=Film+2",
            title: "Film 2",
            description: "Descrizione del film 2",
            extraInfo: "Extra 2"
          },
          {
            image: "https://via.placeholder.com/100x150.png?text=Film+2",
            title: "Film 2",
            description: "Descrizione del film 2",
            extraInfo: "Extra 2"
          },
          {
            image: "https://via.placeholder.com/100x150.png?text=Film+2",
            title: "Film 2",
            description: "Descrizione del film 2",
            extraInfo: "Extra 2"
          },
          {
            image: "https://via.placeholder.com/100x150.png?text=Film+2",
            title: "Film 2",
            description: "Descrizione del film 2",
            extraInfo: "Extra 2"
          }
        ]
      },
      {
        title: "Latest Movies",
        movies: [
          {
            image: "https://via.placeholder.com/100x150.png?text=Film+3",
            title: "Film 3",
            description: "Descrizione del film 3",
            extraInfo: "Extra 3"
          }
        ]
      },
      {
        title: "Top Rated Movies",
        movies: [
          {
            image: "https://via.placeholder.com/100x150.png?text=Film+3",
            title: "Film 3",
            description: "Descrizione del film 3",
            extraInfo: "Extra 3"
          }
        ]
      }
    ]
  });
});

module.exports = router;
