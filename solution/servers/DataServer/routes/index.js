var express = require('express');
var router = express.Router();

// Servizio per ottenere dati generali del sito
const siteService = {
    getDashboardStats: () => {
        // Restituisce statistiche generali del sito
        return {
            totalMovies: 5000,  // Numero totale di film nel database
            totalActors: 10000, // Numero totale di attori
            moviesThisYear: 250, // Film aggiunti quest'anno
            mostPopularGenre: 'Action' // Genere più popolare
        };
    },

    getQuickSearchSuggestions: () => {
        // Restituisce suggerimenti rapidi per la ricerca
        return [
            { id: '1', name: 'Top Gun: Maverick', type: 'movie' },
            { id: '2', name: 'Tom Cruise', type: 'actor' },
            { id: '3', name: 'Christopher Nolan', type: 'director' }
        ];
    }
};

// Route per ottenere statistiche generali del sito
router.get('/dashboard-stats', function(req, res) {
    try {
        const stats = siteService.getDashboardStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: "Errore nel recupero delle statistiche" });
    }
});

// Route per suggerimenti di ricerca rapida
router.get('/quick-search-suggestions', function(req, res) {
    try {
        const suggestions = siteService.getQuickSearchSuggestions();
        res.json(suggestions);
    } catch (error) {
        res.status(500).json({ message: "Errore nel recupero dei suggerimenti" });
    }
});

module.exports = router;
