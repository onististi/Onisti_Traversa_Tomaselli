const express = require('express');
const router = express.Router();
const axios = require('axios');

// Mostra pagina chat
router.get('/', async function (req, res, next) {
    try {

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

        const chatsResponse = await axios.get(`${process.env.DATA_SERVER_URL}/chat/chats`);
        const chatList = chatsResponse.data;

        const chatCode = req.query.Code;
        const chatType = req.query.Type;
        let currentChat={type:chatType};
        let messages = [];

        if (chatCode && chatType) { //in base al code cambia l api del dataaserver al quale richiedere in quanto i code di actors sono "da actor_summaries" e potrebbero essercene uguali a movie da movies
            try {
                let targetExists = false;

                try {
                    if (chatType === "movie") {
                        let responseMovie = await axios.get(`http://localhost:8080/api/movies/${chatCode}`);
                        targetExists = responseMovie.data && Object.keys(responseMovie.data).length > 0;

                        currentChat.title= responseMovie.data.name;
                    } else if (chatType === "actor") {
                        let responseActor = await axios.get(`http://localhost:8080/api/actors/actor/${chatCode}`);
                        targetExists = responseActor.data && Object.keys(responseActor.data).length > 0;

                        currentChat.name= responseActor.data.name;
                    }
                }catch (targetErr) {targetExists = false;}
                                    //controlli sul coddice prima di cercare i messaggi con quel code
                if (!targetExists)
                    return res.redirect('/chat');

                const messagesResponse = await axios.get(`${process.env.DATA_SERVER_URL}/chat/messages/${chatCode}?Type=${chatType}`);  //ricehista dei messaggi di quella chat
                if(messagesResponse) {
                    messages = messagesResponse.data.messages;
                    currentChat.id = messagesResponse.data.id;
                }

            } catch (err) {console.error("Errore nel recupero dei messaggi:", err);}
        }

        currentChat.code= chatCode;

        res.render('chat', {
            title: 'Cineverse - Chat',
            chatList,
            currentChat,
            messages,

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

module.exports = router;