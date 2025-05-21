const express = require('express');
const router = express.Router();
const chatController = require('../controllers/ChatController');

router.get('/chats', chatController.getChats);
router.get('/messages/:code', chatController.getMessagesByChatCode);
router.post('/messages', chatController.postMessage);

module.exports = router;