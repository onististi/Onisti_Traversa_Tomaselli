const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;

    console.log('Token ricevuto (middleware):', token);

    if (!token || token === process.env.JWT_SECRET) {
        console.error('Errore: Token mancante o errato:', token);
        return res.status(401).json({ message: 'Token mancante' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key');
        //console.log('Token decodificato (middleware):', decoded);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Errore token JWT (middleware):', error.message);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token scaduto' });
        }
        return res.status(401).json({ message: 'Token non valido' });
    }
};


