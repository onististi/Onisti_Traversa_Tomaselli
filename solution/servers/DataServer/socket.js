/*const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
let io = null;


exports.initialize = (server) => {
    io = socketIo(server);
    io.on('connection', (socket) => {
        handleConnection(socket); // Gestisce la connessione dell'utente
    });
    return io;
};

exports.getIo = () => {
    if (!io) throw new Error('Socket.io non inizializzato');
    return io;
};

// Funzione per gestire la connessione di un utente
const handleConnection = (socket) => {
    console.log('Nuova connessione WebSocket.');

    // Recupera il token dalla sessione
    const token = socket.handshake.auth?.token || socket.request.session?.token;

    if (!token) {
        console.warn('Connessione WebSocket negata: Token mancante');
        socket.disconnect(true); // Disconnette immediatamente
        return;
    }

    try {
        // Decodifica il token JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key');
        const sessionExpiresAt = decoded.exp * 1000; // Converti l'exp in millisecondi
        console.log(`Sessione utente ${decoded.id} scade il: ${new Date(sessionExpiresAt)}`);

        // Associa l'ID utente al socket
        socket.userId = decoded.id;

        // Avvisa della scadenza un minuto prima
        const timeToWarn = sessionExpiresAt - Date.now() - 60000; // 1 minuto prima della scadenza

        const timeToExpire = sessionExpiresAt - Date.now();

        if (timeToWarn > 0) {
            setTimeout(() => {
                console.log('Emit session-expiring');
                socket.emit('session-expiring', { message: 'La tua sessione sta per scadere. Effettua nuovamente il login.' });
            }, timeToWarn);
        }

        if (timeToExpire > 0) {
            setTimeout(() => {
                console.log('Emit session-expired');
                socket.emit('session-expired', { message: 'La tua sessione è scaduta. Sarai disconnesso.' });
                socket.disconnect(true);
            }, timeToExpire);
        }

        // Log evento di disconnessione
        socket.on('disconnect', (reason) => {
            console.warn(`Socket disconnesso per utente ${socket.userId}, motivo: ${reason}`);
        });

    } catch (error) {
        console.error('Errore nella verifica del token:', error.message);
        socket.emit('token-invalid', { message: 'Token non valido o scaduto. Reimmettere il login.' });
        socket.disconnect(true); // Disconnette il socket
    }
};*/