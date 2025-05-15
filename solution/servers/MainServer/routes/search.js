const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async function(req, res) {
    const query = req.query.q || req.query.term || '';
    const type = req.query.type || 'all';

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

        if (type === 'movies' || type === 'all') {
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
        }

        if (type === 'actors' || type === 'all') {
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
        }

        await Promise.all(promises);

        const hasResults = movies.length > 0 || actors.length > 0;

        res.render('search', {
            title: `Risultati per "${query}"`,
            searchTerm: query,
            movies: movies,
            actors: actors,
            searchType: type,
            hasResults: hasResults,
            user: req.session.user
        });
    } catch (error) {
        console.error("Error performing search:", error.message);
        res.status(500).render('error', {
            message: "Si è verificato un errore durante la ricerca",
            error: { status: 500, stack: process.env.NODE_ENV === 'development' ? error.stack : '' }
        });
    }
});

router.get('/api/search', async function(req, res) {
    const query = req.query.term || req.query.q || '';
    const type = req.query.type || 'all';

    try {
        let movies = [];
        let actors = [];

        if (type === 'movies' || type === 'all') {
            const moviesResponse = await axios.get(`http://localhost:8080/api/movies/search?query=${encodeURIComponent(query)}`)
                .catch(error => {
                    console.warn("Error searching movies:", error.message);
                    return { data: [] };
                });
            movies = moviesResponse.data || [];
        }

        if (type === 'actors' || type === 'all') {
            const actorsResponse = await axios.get(`http://localhost:8080/api/actors/search?query=${encodeURIComponent(query)}`)
                .catch(error => {
                    console.warn("Error searching actors:", error.message);
                    return { data: [] };
                });
            actors = actorsResponse.data || [];
        }

        res.json({
            movies: movies,
            actors: actors
        });
    } catch (error) {
        console.error("Error in API search:", error.message);
        res.status(500).json({
            message: "Errore durante la ricerca",
            error: { status: 500 }
        });
    }
});

module.exports = router;