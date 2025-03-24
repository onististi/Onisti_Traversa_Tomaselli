const User = require('../models/User');

// Registrazione nuovo utente
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validazione input
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Tutti i campi sono obbligatori'
            });
        }

        // Verifica se l'username o email sono già in uso
        const existingUserByUsername = await User.findByUsername(username);
        const existingUserByEmail = await User.findByEmail(email);

        if (existingUserByUsername) {
            return res.status(400).json({
                success: false,
                message: 'Username già esistente'
            });
        }

        if (existingUserByEmail) {
            return res.status(400).json({
                success: false,
                message: 'Email già registrata'
            });
        }

        // Crea nuovo utente
        const newUser = await User.create(username, email, password);

        return res.status(201).json({
            success: true,
            id: newUser.id,
            username: newUser.username,
            email: newUser.email
        });

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(400).json({
            success: false,
            message: error.message || 'Errore durante la registrazione'
        });
    }
};


// Login utente
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validazione input
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username e password sono obbligatori'
            });
        }

        // Autenticazione
        const user = await User.authenticate(username, password);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Username o password non validi'
            });
        }

        return res.status(200).json({
            success: true,
            id: user.id,
            username: user.username,
            email: user.email
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Errore durante il login'
        });
    }
};