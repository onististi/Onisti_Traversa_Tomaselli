const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route per la registrazione
router.post('/register', authController.register);

// Route per il login
router.post('/login', authController.login);

module.exports = router;
