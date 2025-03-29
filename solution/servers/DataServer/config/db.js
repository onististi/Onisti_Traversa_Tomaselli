const mongoose = require('mongoose');

const uri = 'mongodb://localhost:27017/MongoDB';

const connectDB = async () => {
    try {
        await mongoose.connect(uri);
        console.log(' Connessione al database MongoDB riuscita');
    } catch (err) {
        console.error(' Errore di connessione al database:', err);
        process.exit(1); // Termina il processo se non riesce a connettersi
    }
};

connectDB(); // Chiama subito la funzione per connettere il database

module.exports = mongoose;
