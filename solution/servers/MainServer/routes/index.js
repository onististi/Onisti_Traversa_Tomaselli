var express = require('express');
const axios = require('axios');
var router = express.Router();
const NodeCache = require ('node-cache');
const movieCache = new NodeCache({stdTTL: 86400});
const { syncUserSession } = require('../middleware/auth');
const { ensureAuthenticated } = require('../middleware/auth');

router.get('/', syncUserSession, async function(req, res, next) {
    try {
        //Chiave cache
        const cacheKey = 'homepage_data';

        let homeData = movieCache.get(cacheKey);
        if (!homeData) {
            console.log('Cache miss - fetching fresh data');

            // Esecuzione chiamate API in parallelo se non sono in cache
            const [oscarsResponse, latestResponse, topRatedResponse] = await Promise.all([
                axios.get("http://localhost:8080/api/movies/oscars-winners"),
                axios.get("http://localhost:8080/api/movies/latest"),
                axios.get("http://localhost:8080/api/movies/top-rated")
            ]);

            const oscarWinners = oscarsResponse.data.map(movie => ({
                id: movie.id,
                title: movie.name,
                description: movie.description || "No description available",
                oscarYear: movie.yearCeremony,
                poster: movie.posterLink || "/images/default-poster.jpg"
            }));

            const latestMovies = latestResponse.data.map(movie => {
                let releaseDate = movie.year ? `${movie.year}` : "Data sconosciuta";
                if (movie.releaseInfo) {
                    const releaseMatch = movie.releaseInfo.match(/([0-9]{2}-[0-9]{2}-[0-9]{4})/);
                    if (releaseMatch) {
                        releaseDate = releaseMatch[0];
                    }
                }

                return {
                    id: movie.id,
                    title: movie.name,
                    description: movie.description || "No description available",
                    releaseDate: releaseDate,
                    poster: movie.posterLink || "/images/default-poster.jpg"
                };
            });

            const topRatedMovies = topRatedResponse.data.map(movie => ({
                id: movie.id,
                title: movie.name,
                description: movie.description || "No description available",
                rating: movie.rating ? movie.rating : "N/A",
                poster: movie.posterLink || "/images/default-poster.jpg"
            }));

            // Salvataggio dati elaborati nella cache
            homeData = {
                oscarsWinners: oscarWinners,
                latestMovies: latestMovies,
                topRatedMovies: topRatedMovies
            };

            movieCache.set(cacheKey, homeData);
        } else {
            console.log('Cache hit - serving cached data');
        }

        // Renderizza la pagina con i dati (dalla cache o appena recuperati)
        res.render("index", {
            title: "Cineverse",
            ...homeData  // Espansione dati nella renderizzazione
        });

    } catch (error) {
        console.error("Dettaglio errore:", error);
        res.status(500).json({ message: "Errore nel recupero del film" });
    }
});

// Endpoint per forzare il refresh della cache se necessario
router.get('/refresh-cache', function(req, res) {
    movieCache.del('homepage_data');
    res.redirect('/');
});


router.get('/refresh-user-status', (req, res, next) => {
    // Verifica che l'utente sia autenticato
    if (!req.session.isLoggedIn || !req.session.user) {
        return res.redirect('/auth/login');
    }
    next();
}, syncUserSession, async (req, res) => {
    try {
        // Verifica che DATA_SERVER_URL sia definito
        const DATA_SERVER_URL = process.env.DATA_SERVER_URL || 'http://localhost:3001';

        const response = await axios.get(`${DATA_SERVER_URL}/api/users/${req.session.user.id}?t=${Date.now()}`, {
            headers: {
                'Authorization': `Bearer ${req.session.token}`,
                'X-User-Id': req.session.user.id
            }
        });

        if (response.data && response.data.user) {
            req.session.user = response.data.user;
            // Salva la sessione in modo sincrono prima di reindirizzare
            req.session.save((err) => {
                if (err) console.error('Error saving session:', err);
                res.redirect('/requests/request');
            });
        } else {
            res.redirect('/requests/request');
        }
    } catch (error) {
        console.error('Error refreshing user data:', error);
        res.redirect('/requests/request');
    }
});

module.exports = router;