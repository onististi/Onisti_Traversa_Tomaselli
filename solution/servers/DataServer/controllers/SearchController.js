const pg = require('../config/pg');

exports.search = async (req, res) => {
    try {
        const searchTerm = req.query.term;
        if (!searchTerm || searchTerm.trim() === '' || searchTerm.length < 4) {
            return res.status(400).json({ success: false, message: 'Inserisci almeno 4 lettere per cercare' });
        }

        const likePattern = `%${searchTerm}%`;

        const moviesQuery = `
            SELECT m.id, m.name, m.rating, p.link AS poster_link
            FROM movies m
            LEFT JOIN posters p ON m.id = p.id_movie
            WHERE m.name ILIKE $1
            ORDER BY m.rating IS NULL, m.rating DESC
            LIMIT 50
        `;

        const actorsQuery = `
            SELECT DISTINCT ON (name) id, name
            FROM actors
            WHERE name ILIKE $1
            LIMIT 50
        `;

        const [moviesResults, actorsResults] = await Promise.all([
            pg.query(moviesQuery, [likePattern]),
            pg.query(actorsQuery, [likePattern])
        ]);

        const formattedMovies = moviesResults.rows.map(movie => ({
            id: movie.id,
            name: movie.name,
            type: 'movie',
            rating: movie.rating || 'N/A',
            posterLink: movie.poster_link || '/images/default-movie.jpg'
        }));

        const formattedActors = actorsResults.rows.map(actor => ({
            id: actor.id,
            name: actor.name,
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
