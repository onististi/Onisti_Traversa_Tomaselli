var express = require('express');
const axios = require('axios');
var router = express.Router();

router.get('/', async function(req, res, next) {
    try {
        const oscarsResponse = await axios.get("http://localhost:8080/api/movies/oscars-winners");
        const latestResponse = await axios.get("http://localhost:8080/api/movies/latest");
        const topRatedResponse = await axios.get("http://localhost:8080/api/movies/top-rated");

        const oscarWinners = oscarsResponse.data.map(movie => ({
            id: movie.id,
            title: movie.name,
            description: movie.description || "No description available",
            oscarYear: movie.yearCeremony, //  yearCeremony
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


        res.render("index", {
            title: "Cineverse",
            oscarsWinners: oscarWinners,
            latestMovies: latestMovies,
            topRatedMovies: topRatedMovies,
            //topChats : topChats
        });

    } catch (error) {
        console.error("Dettaglio errore:", error);
        res.status(500).json({ message: "Errore nel recupero del film" })}
});
module.exports = router;
