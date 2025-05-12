const express = require('express');
const router = express.Router();
const Message = require('../models/message');
const Chat = require('../models/chats');
const User = require('../models/users');
const mongoose = require('mongoose');

//popola sidebar coi film
router.get('/chats', async (req, res) => {
    try {
        const chats = await Chat.find({ last_message: { $exists: true, $ne: null } })
            .populate({
                path: 'last_message',
                model: 'Message',
                populate: {
                    path: 'sender_id',
                    select: 'username'
                }
            })
            .sort({ last_updated: -1 });
        res.json(chats);
    } catch (error) {
        console.error("Errore nel recupero delle chat:", error);
        res.status(500).json({ error: 'Errore nel recupero delle chat' });
    }
});


router.get('/messages/:code', async (req, res) => {
    try {
        const code = req.params.code.replace(":", "");
        const type = req.query.Type;

        if (type === 'actor')
            chat = await Chat.findOne({ code: code, name: { $exists: true, $ne: null } });
        else if (type === 'movie')
            chat = await Chat.findOne({ code: code, title: { $exists: true, $ne: null } });
        if (!chat) return res.status(404).json({ error: 'Chat non trovata' });

        const messages = await Message.find({ chat_id: chat._id })
            .sort({ created_at: 1 })
            .populate('sender_id', 'username');

        res.json({
            target: chat.type === 'movie' ? chat.title : chat.name,
            messages: messages.map(msg => ({
                _id: msg._id,
                sender: {
                    id: msg.sender_id._id,
                    username: msg.sender_id.username
                },
                content: msg.content,
                created_at: msg.created_at
            }))
        });
    } catch (error) {
        console.error("Errore nel recupero dei messaggi:", error);
        res.status(500).json({ error: 'Errore nel recupero dei messaggi' });
    }
});


router.post('/messages', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { chatId, userId, content } = req.body;

        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({ error: 'ID chat non valido' });
        }

        const newMessage = new Message({
            chat_id: chatId,
            sender_id: userId,
            content
        });

        await newMessage.save({ session });

        await Chat.findByIdAndUpdate(
            chatId,
            {
                last_message: newMessage._id,
                last_updated: new Date()
            },
            { session }
        );

        await session.commitTransaction();

        const populatedMsg = await Message.findById(newMessage._id)
            .populate('sender_id', 'username');

        const io = req.app.get('io');
        if (io) {
            io.to(`chat-${chatId}`).emit('new-chat-message', {
                _id: populatedMsg._id,
                sender: populatedMsg.sender_id,
                content: populatedMsg.content,
                time: populatedMsg.created_at.toLocaleTimeString('it-IT')
            });
        }

        res.status(201).json({
            _id: populatedMsg._id,
            sender: populatedMsg.sender_id,
            content: populatedMsg.content,
            time: populatedMsg.created_at.toLocaleTimeString('it-IT')
        });
    } catch (error) {
        await session.abortTransaction();
        console.error("Errore nel salvataggio del messaggio:", error);
        res.status(500).json({ error: 'Errore nel salvataggio del messaggio' });
    } finally {
        session.endSession();
    }
});


module.exports = router;