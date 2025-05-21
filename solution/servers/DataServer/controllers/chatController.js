const Message = require('../models/message');
const Chat = require('../models/chats');
const User = require('../models/users');

exports.getChats = async (req, res) => {
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
        res.json(chats);
    } catch (error) {
        console.error("Errore nel recupero delle chat:", error);
        res.status(500).json({ error: 'Error retrieving chat' });
    }
};

exports.getMessagesByChatCode = async (req, res) => {
    try {
        const code = req.params.code;
        const type = req.query.Type;

        if (!type || !['movie', 'actor'].includes(type))
            return res.status(400).json({ error: 'Invalid chat type' });

        let chat;
        if (type == 'movie')
            chat = await Chat.findOne({ code });
        else
            chat = await Chat.findOne({ code, name: { $exists: true } });

        if (!chat) {
            return res.json({
                id: null,
                target: null,
                messages: [],
            });
        }

        const messages = await Message.find({ chat_id: chat._id })
            .sort({ created_at: 1 })
            .populate('sender_id', 'username role');

        const target = type === 'movie' ? chat.title : chat.name;
        res.json({
            id: chat._id,
            target,
            messages: messages.map(msg => ({
                sender: {
                    id: msg.sender_id._id,
                    username: msg.sender_id.username,
                    role: msg.sender_role || msg.sender_id.role || 'user'
                },
                content: msg.content,
                created_at: msg.created_at,
                time: msg.created_at.toLocaleTimeString('it-IT')
            })),
        });
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving messages' });
    }
};

exports.postMessage = async (req, res) => {
    try {
        const { chatId, chatCode, userId, username, role, content, chatTitle, chatName } = req.body;
        console.log(req.body)

        if (!chatCode || !userId || !username || !content) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        let chat = chatId ? await Chat.findById(chatId) : null;

        if (!chatId || !chat) {
            chat = new Chat({ code: chatCode, last_updated: new Date() });
            if (chatTitle) chat.title = chatTitle;
            else if (chatName) chat.name = chatName;
            await chat.save();
        }

        const newMessage = new Message({
            chat_id: chat._id,
            sender_id: userId,
            content,
            sender_role: role,
            created_at: new Date()
        });

        const savedMessage = await newMessage.save();

        await Chat.findByIdAndUpdate(chat._id, {
            last_message: savedMessage._id,
            last_updated: new Date()
        });

        res.status(201).json({
            _id: savedMessage._id,
            chatId: chat._id,
            chatCode: chat.code,
            sender: { id: userId, username },
            role,
            content: savedMessage.content,
            time: savedMessage.created_at.toLocaleTimeString('it-IT')
        });
    } catch (error) {
        console.error("Error saving message:", error);
        res.status(500).json({ error: 'Error saving message' });
    }
};