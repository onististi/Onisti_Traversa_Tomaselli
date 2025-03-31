const User = require('../models/User');

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
        console.error(' Errore durante la registrazione:', error);
        return res.status(500).json({ success: false, message: 'Errore during registration' });
    }
};

// Login utente
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username e password are mandatory' });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        // Aggiorna last_login
        user.last_login = new Date();
        await user.save();

        return res.status(200).json({
            success: true,
            id: user._id,
            username: user.username,
            email: user.email
        });

    } catch (error) {
        console.error(' Errore durante il login:', error);
        return res.status(500).json({ success: false, message: 'Error during login' });
    }
};
