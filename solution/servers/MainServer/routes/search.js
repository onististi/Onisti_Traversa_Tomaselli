const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async function(req, res) {
    const query = req.query.q || req.query.term || '';
    const type = req.query.type;

    if (!query) {
        return res.render('search', {
            title: "Ricerca",
            searchTerm: '',
            movies: [],
            actors: [],
            searchType: type,
            hasResults: false,
            user: req.session.user
        });
    }

    try {
        let movies = [];
        let actors = [];

        const promises = [];

        if (type === 'movies' ) {
            promises.push(
                axios.get(`http://localhost:8080/api/movies/search?query=${encodeURIComponent(query)}`)
                    .then(response => {
                        movies = response.data || [];
                    })
                    .catch(error => {
                        console.warn("Error searching movies:", error.message);
                        movies = [];
                    })
            );

            await Promise.all(promises);
            res.render('movies', {
                searchTerm: query,
                movies: movies,
                searchType: type,
                user: req.session.user
            });
        }

        if (type === 'actors' ) {
            promises.push(
                axios.get(`http://localhost:8080/api/actors/search?query=${encodeURIComponent(query)}`)
                    .then(response => {
                        actors = response.data || [];
                    })
                    .catch(error => {
                        console.warn("Error searching actors:", error.message);
                        actors = [];
                    })
            );

            await Promise.all(promises);
            res.render('actors', {
                searchTerm: query,
                actors: actors,
                searchType: type,
                user: req.session.user
            });
        }
    } catch (error) {
        console.error("Error performing search:", error.message);
        res.status(500).render('error', {
            message: "Si è verificato un errore durante la ricerca",
            error: { status: 500, stack: process.env.NODE_ENV === 'development' ? error.stack : '' }
        });
    }
});
module.exports = router;