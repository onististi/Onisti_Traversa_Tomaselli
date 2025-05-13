const pg = require('../config/pg');
const db = require('../config/db');

exports.search = async (req, res) => {
    try {
        const searchTerm = req.query.term;
        if (!searchTerm || searchTerm.trim() === '') {
            return res.status(400).json({ success: false, message: 'Termine di ricerca mancante' });
        }

        const likePattern = `%${searchTerm}%`;

        const moviesQuery = `
            SELECT id, name, year, tagline, description, minute, rating
            FROM movies
            WHERE name ILIKE $1 OR description ILIKE $2 OR tagline ILIKE $3
            ORDER BY rating IS NULL, rating DESC
            LIMIT 20
        `;

        const actorsQuery = `
            SELECT id, name, role, id_movie
            FROM actors
            WHERE name ILIKE $1 OR role ILIKE $2
            LIMIT 20
        `;

        const [moviesResults, actorsResults] = await Promise.all([
            pg.query(moviesQuery, [likePattern, likePattern, likePattern]),
            pg.query(actorsQuery, [likePattern, likePattern])
        ]);

        const formattedMovies = moviesResults.rows.map(movie => ({
            id: movie.id,
            name: movie.name,
            year: movie.year || 'Anno sconosciuto',
            type: 'movie',
            description: movie.description || 'No description available',
            tagline: movie.tagline || '',
            rating: movie.rating || 'N/A'


        }));

        const formattedActors = actorsResults.rows.map(actor => ({
            id: actor.id,
            name: actor.name,
            role: actor.role || 'Ruolo sconosciuto',
            movieId: actor.id_movie,
            type: 'actor'
        }));

        res.json({
            success: true,
            results: {
                movies: formattedMovies,
                actors: formattedActors
            }
        });
    } catch (error) {
        console.error('Errore nella ricerca:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
