const express = require('express');
const router = express.Router();
const axios = require('axios');

// Mostra pagina chat
router.get('/', async function (req, res, next) {
    try {
        const chatsResponse = await axios.get(`${process.env.DATA_SERVER_URL}/chat/chats`); //popola sidebar con chats
        const chatList = chatsResponse.data;

        const chatCode = req.query.Code;
        const chatType = req.query.Type;
        let currentChat = null;
        let messages = [];

        if (chatCode &&chatType) {
            try {
                const messagesResponse = await axios.get(
                    `${process.env.DATA_SERVER_URL}/chat/messages/${chatCode}?Type=${chatType}`
                );
                messages = messagesResponse.data.messages;
                currentChat = chatList.find(chat => chat.code == chatCode);
            } catch (err) {
                console.error("Errore nel recupero dei messaggi:", err);
                messages = [];
            }
        }

        let userData = {
            userId: null,
            username: null,
            role: 'guest',
            requestStatus: 'none'
        };

        if (req.session && req.session.user) {
            userData = {
                userId: req.session.user.id,
                username: req.session.user.username,
                role: req.session.user.role || 'user',
                requestStatus: req.session.user.requestStatus || 'none'
            };
        }
console.log(currentChat)
        res.render('chat', {
            title: 'Cineverse - Chat',
            chatList,
            currentChat,
            messages,
            chatCode: chatCode,
            userId: userData.userId,
            username: userData.username,
            role: userData.role,
            requestStatus: userData.requestStatus,
            dataServerUrl: process.env.DATA_SERVER_WS_URL
        });
    } catch (error) {
        console.error("Errore nel caricamento della chat:", error);
        res.status(500).render('error', {
            message: "Errore nel caricamento della chat",
            error: req.app.get('env') === 'development' ? error : {}
        });
    }
});

// Invia un nuovo messaggio
router.post('/message', async function (req, res) {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ error: 'Non autorizzato' });
        }

        const { chatId, content } = req.body;

        if (!chatId || !content) {
            return res.status(400).json({ error: 'Dati mancanti' });
        }

        const messageData = {
            chatId,
            userId: req.session.user.id,
            content,
            timestamp: new Date()
        };

        const response = await axios.post(
            `${process.env.DATA_SERVER_URL}/chat/messages`,
            messageData,
            {
                headers: {
                    'Authorization': `Bearer ${req.session.token}`
                }
            }
        );

        res.status(201).json(response.data);
    } catch (error) {
        console.error("Errore nel salvataggio del messaggio:", error);
        res.status(500).json({ error: 'Errore nel salvataggio del messaggio' });
    }
});

module.exports = router;
