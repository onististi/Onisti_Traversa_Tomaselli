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
                console.log('Token decodificato (WebSocket):', decoded);

                // Calcola il tempo rimanente della sessione
                const timeRemaining = (decoded.exp * 1000) - Date.now();
                console.log(`Tempo rimanente della sessione (ms): ${timeRemaining}`);

                // Aggiorna i dettagli dell'utente nel socket
                socket.userId = decoded.id;
                socket.userRole = decoded.role; // Ruolo aggiornato nel token
                socket.sessionExpiresAt = decoded.exp * 1000; // Millisecondi
                next();
            } catch (error) {
                console.error('Errore nella verifica del token (WebSocket):', error.message);
                return next(new Error('Invalid token'));
            }
        });
    });


    io.on('connection', (socket) => {
        const userId = socket.userId;
        console.log(`User ${userId} connected via WebSocket`);

        // Entra in una stanza specifica con l'userId
        socket.join(userId.toString());

        // Recupera lo stato corrente della richiesta e il ruolo
        const userStatus = socket.request.session.user.requestStatus || 'none';
        const userRole = socket.userRole;

        // Invia lo stato e il ruolo aggiornati all'utente
        socket.emit('status-update', {
            userId,
            requestStatus: userStatus,
            role: userRole,
            timestamp: Date.now()
        });

        // Gestisce la scadenza della sessione
        const timeToWarn = socket.sessionExpiresAt - Date.now() - 60000; // 1 minuto prima della scadenza
        const timeToExpire = socket.sessionExpiresAt - Date.now();

        if (timeToWarn > 0) {
            setTimeout(() => {
                console.log('Emit session-expiring');
                socket.emit('session-expiring', {message: 'La tua sessione sta per scadere. Effettua nuovamente il login.'});
            }, timeToWarn);
        } else {
            console.warn('TimeToWarn negativo, session-expiring non emesso');
        }

        if (timeToExpire > 0) {
            setTimeout(() => {
                console.log('Emit session-expired');
                socket.emit('session-expired', {message: 'La tua sessione è scaduta. Sarai disconnesso.'});
                socket.disconnect(true); // Disconnette il socket
            }, timeToExpire);
        } else {
            console.warn('TimeToExpire negativo, session-expired non emesso');
        }

        socket.on('error', (error) => {
            if (error.message === 'Token expired') {
                socket.emit('token-expired', {message: 'Your session has expired. Please login again.'});
            }
        });

        socket.on('disconnect', (reason) => {
            console.warn(`Socket disconnected for user ${socket.userId}, reason: ${reason}`);
        });
    });
}


const notifyUser = (userId, requestStatus) => {
    if (!io) {
        console.warn('WebSocket non inizializzato. Evento status-update non inviato.');
        return false;
    }

    try {
        console.log(`Tentativo di inviare evento status-update per userId ${userId} con stato: ${requestStatus}`);
        io.to(userId.toString()).emit('status-update', {
            userId,
            requestStatus,
            timestamp: Date.now()
        });
        console.log(`Evento status-update inviato a userId ${userId} con stato: ${requestStatus}`);
        return true;
    } catch (error) {
        console.error(`Errore durante la notifica a userId ${userId}:`, error);
        return false;
    }
};



module.exports = { setupWebSockets, notifyUser };