var express = require('express');
const axios = require('axios');
var router = express.Router();

router.get('/', async function(req, res, next) {
    try {
        const oscarsResponse = await axios.get("http://localhost:8080/api/movies/oscars-winners");

        const latestResponse = await axios.get("http://localhost:8080/api/movies/latest");

        const topRatedResponse = await axios.get("http://localhost:8080/api/movies/top-rated");

        res.render('index', {
            title: 'Movie Hub - Home',
            oscarsWinner: oscarsResponse.data,
            latestMovies: latestResponse.data,
            topRatedMovies: topRatedResponse.data
        });

    } catch (error) {
        console.error('Error fetching home page data:', error);
        res.render('index', {
            title: 'Movie Hub - Home',
            oscarsWinner: [],
            latestMovies: [],
            topRatedMovies: []
        });
    }
});

module.exports = router;
