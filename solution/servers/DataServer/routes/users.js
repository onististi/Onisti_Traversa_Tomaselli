const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/UserController');

// Ottieni un utente per ID (protetto)
router.get('/:id', auth, userController.getUserById);

module.exports = router;
