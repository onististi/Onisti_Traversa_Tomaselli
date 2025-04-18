const express = require('express');
const router = express.Router();
const requestController = require('../controllers/JournalistRequestController');
const auth = require('../middleware/auth');

// Richiesta per diventare journalist
router.post('/request', auth, requestController.requestJournalist);

// Ottienimento richieste pendenti
router.get('/pending', auth, requestController.getPendingRequests);

// Gestisione richiesta
router.post('/handle', auth, requestController.handleRequest);

module.exports = router;