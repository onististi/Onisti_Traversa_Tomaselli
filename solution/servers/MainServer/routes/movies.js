const express = require('express');
const axios = require('axios');
const router = express.Router();

// Route pagina film
router.get('/', async function(req, res) {
        try {
            const responseMovie = await axios.get("http://localhost:8080/api/movies");
            res.render('movies', {
                movies: responseMovie.data,
                user: req.session.user
            });
        } catch (error) {
            console.error("Error retrieving movies:", error.message);
            return res.status(500).json({message: "Error retrieving movies"});
        }
});

// Route film singolo
router.get('/:id', async function(req, res) {
    const movieId = req.params.id;
    let responseMovie, responseActors, responseCrew, responseReviews;

    try {
        const [movieRes, actorsRes, crewRes] = await Promise.all([
            axios.get(`http://localhost:8080/api/movies/${encodeURIComponent(movieId.replace(":", ""))}`),
            axios.get(`http://localhost:8080/api/actors/movie/${encodeURIComponent(movieId.replace(":", ""))}`),
            axios.get(`http://localhost:8080/api/crews/${encodeURIComponent(movieId.replace(":", ""))}`)
        ]);

        responseMovie = movieRes;
        responseActors = actorsRes;
        responseCrew = crewRes;

        // Carica le recensioni se il film le possiede
        try {
            responseReviews = await axios.get(`http://localhost:3001/api/reviews/movie/${movieId}`);
            console.log(`Retrieved ${responseReviews.data.length} reviews for movie ${movieId}`);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.warn(`No reviews found for movie ${movieId}.`);
                responseReviews = { data: [] }; // Passa un array vuoto se non ci sono recensioni
            } else {
                console.error("Error retrieving reviews:", error.message);
                responseReviews = { data: [] }; // Restituisce array vuoto per evitare errori
            }
        }

        res.render("movie", {
            title: "Movie: " + responseMovie.data.name,
            movie: responseMovie.data,
            actors: responseActors,
            crew: responseCrew,
            reviews: responseReviews.data,
            user: req.session.user,
            isLoggedIn: !!req.session.user
        });
        console.log("User session:", req.session.user);

    } catch (error) {
        if (error.response && error.response.status === 404)
            return res.render('NotFound', { title: 'Movie not found', message: 'Movie not found! Return to homepage.' });

        console.error("Error retrieving movie:", error.message);
        res.status(500).json({ message: "Error retrieving movie and reviews" });
    }
});

// Endpoint per aggiungere recensioni
router.post('/:id/review', async function(req, res) {
    const movieId = req.params.id;
    const { rating, content } = req.body;

    // Ottiene le informazioni utente dalla sessione
    const user = req.session.user;
    if (!user) {
        console.error("Error: User not authenticated");
        return res.status(401).render('error', {
            message: "You must be logged in to submit a review.",
            error: { status: 401, stack: '' }
        });
    }

    try {
        // Invia recensione al DataServer
        const response = await axios.post(`http://localhost:3001/api/reviews`, {
            movieId,
            author: user.username,
            role: user.role,
            rating: parseInt(rating, 10),
            content,
            date: new Date()
        });

        console.log("DataServer response:", response.data);

        res.redirect(`/movies/${movieId}`);
    } catch (error) {
        console.error("Error submitting review:", error.response?.data || error.message);

        const errorMsg = error.response?.data?.message || "Error submitting your review";
        return res.status(500).render('error', {
            message: errorMsg,
            error: {
                status: 500,
                stack: process.env.NODE_ENV === 'development' ? error.stack : ''
            }
        });
    }
});

// Modifica una recensione
router.put('/reviews/:reviewId', async function(req, res) {
    const { reviewId } = req.params;
    const { rating, content } = req.body;

    console.log(`Request to update review ${reviewId}:`, req.body);

    // Ottieni utente dalla sessione
    const user = req.session.user;
    if (!user) {
        return res.status(401).json({ message: "You must be logged in to edit a review." });
    }

    try {
        //Manda richiesta di aggiornamento recensione con le nuove info al DataServer
        const response = await axios.put(`http://localhost:3001/api/reviews/${reviewId}`, {
            rating: parseInt(rating, 10),
            content,
            user: {
                username: user.username,
                role: user.role
            }
        });

        console.log(`Review ${reviewId} updated successfully.`);
        res.json(response.data);
    } catch (error) {
        console.error("Error updating review:", error.response?.data || error.message);

        if (error.response?.status === 403) {
            return res.status(403).json({ message: "You don't have permission to edit this review" });
        }

        res.status(500).json({ message: "Error updating review", error: error.message });
    }
});

//Elimina una recensione
router.delete('/reviews/:reviewId', async function(req, res) {
    const { reviewId } = req.params;

    console.log(`Request to delete review ${reviewId}`);

    // Ottiene l'utente dalla sessione
    const user = req.session.user;
    if (!user) {
        return res.status(401).json({ message: "You must be logged in to delete a review." });
    }

    try {
        // Invia richiesta di eliminazione recensione al DataServer
        const response = await axios.delete(`http://localhost:3001/api/reviews/${reviewId}`, {
            data: {
                user: {
                    username: user.username,
                    role: user.role
                }
            }
        });

        console.log(`Review ${reviewId} deleted successfully.`);
        res.json({ message: "Review deleted successfully", reviewId });
    } catch (error) {
        console.error("Error deleting review:", error.response?.data || error.message);

        if (error.response?.status === 403) {
            return res.status(403).json({ message: "You don't have permission to delete this review" });
        }

        res.status(500).json({ message: "Error deleting review", error: error.message });
    }
});



module.exports = router;