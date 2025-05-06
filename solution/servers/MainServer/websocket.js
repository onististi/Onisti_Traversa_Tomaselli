const socketIo = require('socket.io');
const { sessionMiddleware } = require('./middleware/auth');

let io;
const jwt = require('jsonwebtoken');


const setupWebSockets = (server) => {
    io = socketIo(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:3000",
            credentials: true
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 5000
    });

    io.use((socket, next) => {
        sessionMiddleware(socket.request, {}, (err) => {
            if (err) {
                console.error('Session middleware error:', err.message);
                return next(err);
            }

            const token = socket.request.session?.token;

            console.log('Token ricevuto (WebSocket):', token);

            if (!token) {
                console.warn('WebSocket connection denied: Missing token');
                return next(new Error('Unauthorized'));
            }

            try {
                const decoded = jwt.verify(
                    token,
                    process.env.JWT_SECRET || 'default-secret-key'
                );
                //console.log('Token decodificato (WebSocket):', decoded);

                // Calcolo tempo rimanente della sessione
                const timeRemaining = (decoded.exp * 1000) - Date.now();
                console.log(`Tempo rimanente della sessione (ms): ${timeRemaining}`);

                socket.userId = decoded.id;
                socket.sessionExpiresAt = decoded.exp * 1000; //millisencondi
                next();
            } catch (error) {
                console.error('Errore WebSocket token:', error.message);
                return next(new Error('Invalid token'));
            }
        });
    });


    io.on('connection', (socket) => {
        const userId = socket.userId;
        console.log(`User ${userId} connected via WebSocket`);

        //Entra in una stanza specifica con questo user
        socket.join(userId.toString());

        //Invia lo status corrente
        socket.emit('status-update', {
            userId,
            requestStatus: socket.request.session.user.requestStatus || 'none',
            timestamp: Date.now()
        });

        // Calcolo dei timer per gli eventi session-expiring e session-expired
        const timeToWarn = socket.sessionExpiresAt - Date.now() - 60000; // 1 minuto prima della scadenza
        const timeToExpire = socket.sessionExpiresAt - Date.now();

        if (timeToWarn > 0) {
            setTimeout(() => {
                console.log('Emit session-expiring');
                socket.emit('session-expiring', { message: 'La tua sessione sta per scadere. Effettua nuovamente il login.' });
            }, timeToWarn);
        } else {
            console.warn('TimeToWarn negativo, session-expiring non emesso');
        }

        if (timeToExpire > 0) {
            setTimeout(() => {
                console.log('Emit session-expired');
                socket.emit('session-expired', { message: 'La tua sessione è scaduta. Sarai disconnesso.' });
                socket.disconnect(true); // Disconnette il socket
            }, timeToExpire);
        } else {
            console.warn('TimeToExpire negativo, session-expired non emesso');
        }

        socket.on('error', (error) => {
            if (error.message === 'Token expired') {
                socket.emit('token-expired', { message: 'Your session has expired. Please login again.' });
            }
        });

        socket.on('disconnect', (reason) => {
            console.warn(`Socket disconnected for user ${socket.userId}, reason: ${reason}`);
        });
    });
};

const notifyUser = (userId, requestStatus) => {
    if (!io) return false;

    try {
        io.to(userId.toString()).emit('status-update', {
            userId,
            requestStatus,
            timestamp: Date.now()
        });

        // Forza la sincronizzazione della sessione includendo il token
        const axiosInstance = require('axios');
        axiosInstance.get(`${process.env.DATA_SERVER_URL}/api/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${process.env.JWT_SECRET || 'default-secret-key'}`,
                'Cache-Control': 'no-cache'
            }
        });

        console.log(`WebSocket status-update sent to user ${userId}: ${requestStatus}`);
        return true;
    } catch (error) {
        console.error(`Error notifying user ${userId}:`, error);
        return false;
    }
};



module.exports = { setupWebSockets, notifyUser };