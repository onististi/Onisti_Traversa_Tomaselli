const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Registrazione nuovo utente
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: 'All fields are mandatory' });
        }

        // Controlla se l'utente esiste già
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Username or email already exist' });
        }

        // Crea nuovo utente
        const newUser = new User({ username, email, password });
        await newUser.save();

        return res.status(201).json({
            success: true,
            id: newUser._id,
            username: newUser.username,
            email: newUser.email
        });

    } catch (error) {
        console.error(' Error during registration:', error);
        return res.status(500).json({ success: false, message: 'Error during registration' });
    }
};

// Login utente
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Credenziali non valide' });
        }

        const token = jwt.sign(
            {
                id: user._id,
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }//token durata sessione
        );

      //  console.log('Token generato (login):', token);

        res.status(200).json({
            success: true,
            token,
            id: user._id,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        console.error('Errore durante il login:', error.message);
        res.status(500).json({ message: 'Errore del server' });
    }
};


exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ success: false, message: 'Refresh token is required' });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-key');

        const newToken = jwt.sign(
            { id: decoded.id },
            process.env.JWT_SECRET || 'default-secret-key',
            { expiresIn: '1h' }
        );

        return res.status(200).json({ success: true, token: newToken });
    } catch (error) {
        console.error('Error refreshing token:', error.message);
        return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
};