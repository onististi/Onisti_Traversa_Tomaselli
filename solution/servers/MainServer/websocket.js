const socketIo = require('socket.io');
const socketioJwt = require('socketio-jwt');
const axios = require('axios');

function setupWebSockets(server) {
    const io = socketIo(server, {
        cors: {
            origin: process.env.DATA_SERVER_URL || 'http://localhost:3001',
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('MainServer: Client connected to WebSocket', socket.id);

        socket.on('join-chat-room', ({ chatCode, userId }) => {
            console.log(`User ${userId} joined chat room: ${chatCode}`);
            socket.join(chatCode);
        });

        socket.on('chat-message', async (messageData) => {
            console.log('📩 Messaggio ricevuto dal client:', messageData);

            try {
                //  Salva il messaggio nel DataServer
                const savedMessage = await axios.post(`${process.env.DATA_SERVER_URL}/chat/messages`, messageData);

                const enrichedMessage = {
                    ...messageData,
                    chatId: savedMessage.data.chatId,
                    role: messageData.role || 'user',
                    time: savedMessage.data.time
                };

                console.log(' Trasmissione messaggio via WebSocket a:', messageData.chatCode);

                // Trasmette il messaggio con i dati aggiornati via WebSocket a TUTTI nella stanza
                const roomId = messageData.chatId || messageData.chatCode;
                io.to(roomId).emit('new-chat-message', enrichedMessage);

                // Se è un nuovo chat, fai unire il socket alla stanza
                if (!messageData.chatId && savedMessage.data.chatId) {
                    socket.join(savedMessage.data.chatId);
                }

                console.log(' Messaggio trasmesso con successo');

            } catch (error) {
                console.error(' Errore nel salvataggio o nella trasmissione del messaggio:', error);
                // Notifica il client dell'errore
                socket.emit('message-error', {
                    error: 'Errore nell\'invio del messaggio',
                    originalMessage: messageData
                });
            }
        });

        socket.on('disconnect', () => {
            console.log('MainServer: Client disconnected:', socket.id);
        });
    });

    server.app = server.app || {};
    server.app.io = io;

    return io;
}

module.exports = { setupWebSockets };