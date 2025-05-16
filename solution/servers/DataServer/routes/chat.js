const express = require('express');
const router = express.Router();
const Message = require('../models/message');
const Chat = require('../models/chats');
const User = require('../models/users');
const mongoose = require('mongoose');

//popola sidebar con chat esistenti
router.get('/chats', async (req, res) => {
    try {
        const chats = await Chat.find({ last_message: { $exists: true, $ne: null } })
            .populate({
                path: 'last_message',
                model: 'Message',
                populate: {
                    path: 'sender_id',
                    select: 'username role'
                }
            })
            .sort({ last_updated: -1 });

       // console.log("Dati della chat:", JSON.stringify(chats, null, 2)); // 🔹 Debug

        res.json(chats);
    } catch (error) {
        console.error("Errore nel recupero delle chat:", error);
        res.status(500).json({ error: 'Errore nel recupero delle chat' });
    }
});



//messaggi per chat specifica
router.get('/messages/:code', async (req, res) => {
    try {
        const code = req.params.code;
        const type = req.query.Type;

        if (!type || !['movie', 'actor'].includes(type))
            return res.status(400).json({ error: 'Invalid chat type' });

        if (type == 'movie')
            chat = await Chat.findOne({code: code})
        else if (type == 'actor')
            chat = await Chat.findOne({ code: code, name: { $exists: true } });

        if (!chat) {
            return res.json({
                id: null,
                target: null,
                messages: [],
            });
        }

        const messages = await Message.find({ chat_id: chat._id })
            .sort({ created_at: 1 })
            .populate('sender_id', 'username role'); // Add role to populated fields

        const target = type === 'movie' ? chat.title : chat.name;
        res.json({
            id: chat._id,
            target: target,
            messages: messages.map(msg => ({
                sender: {
                    id: msg.sender_id._id,
                    username: msg.sender_id.username,
                    role:msg.sender_role || msg.sender_id.role || 'user'
                },
                content: msg.content,
                created_at: msg.created_at,
                time: msg.created_at.toLocaleTimeString('it-IT')
            })),
        });
    } catch (error) {
        console.error("Error retrieving messages:", error);
        res.status(500).json({ error: 'Error retrieving messages' });
    }
});


//invio di messaggi(salvataggio nel db)
router.post('/messages', async (req, res) => {
    try {
        const { chatId, chatCode, userId, username, role, content, chatTitle, chatName } = req.body;
        console.log("Received message data:", req.body);

        if (!chatCode || !userId || !username || !content) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const user = await User.findById(userId);
        if (!user)
            return res.status(404).json({ error: 'User not found' });

        let chat
        if(chatId)
            chat = await Chat.findById(chatId);

        if (!chatId || !chat) {
            chat = new Chat({
                code: chatCode,
                last_updated: new Date(),
            });

            if(req.body.chatTitle)
                chat.title = req.body.chatTitle;
            else if(req.body.chatName)
                chat.name = req.body.chatName;

            await chat.save();
        }

        const newMessage = new Message({
            chat_id: chat._id,
            sender_id: userId,
            content: content,
            sender_role: role,
            created_at: new Date()
        });

        const savedMessage = await newMessage.save();

        await Chat.findByIdAndUpdate(
            chat._id,
            {
                last_message: savedMessage._id,
                last_updated: new Date()
            }
        );

        res.status(201).json({
            _id: savedMessage._id,
            chatId: chat._id,
            chatCode: chat.code,
            sender: {
                id: userId,
                username: username
            },
            role: role,
            content: savedMessage.content,
            time: savedMessage.created_at.toLocaleTimeString('it-IT')
        });
    } catch (error) {
        console.error("Error saving message:", error);
        res.status(500).json({ error: 'Error saving message' });
    }
});
module.exports = router;