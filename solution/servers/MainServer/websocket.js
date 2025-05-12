const socketIo = require('socket.io');
const socketioJwt = require('socketio-jwt');

function setupWebSockets(server) {
    const io = socketIo(server, {
        cors: {
            origin: process.env.DATA_SERVER_URL || 'http://localhost:3001',
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    // Handle WebSocket connection
    io.on('connection', (socket) => {
        console.log('MainServer: Client connected to WebSocket', socket.id);

        // Only pass along connection events to data server
        // Actual chat functionality is handled by dataServer

        socket.on('disconnect', () => {
            console.log('MainServer: Client disconnected:', socket.id);
        });
    });

    // Store io instance in app for potential use in routes
    server.app = server.app || {};
    server.app.io = io;

    return io;
}

module.exports = { setupWebSockets };