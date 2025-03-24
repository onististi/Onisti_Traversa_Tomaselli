const db = require('../config/db');
const bcrypt = require('bcrypt');

class User {
    // Registrazione nuovo utente
    static async create(username, email, password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const now = new Date();

        const query = `
  INSERT INTO users (username, email, password, created_at, last_login) 
  VALUES ($1, $2, $3, $4, $5) 
  RETURNING id, username, email, created_at
`;

        try {
            const result = await db.query(query, [username, email, hashedPassword, now, now]);
            return result.rows[0];
        } catch (error) {
            if (error.code === '23505') { // Unique violation
                if (error.constraint.includes('username')) {
                    throw new Error('Username already exists');
                } else if (error.constraint.includes('email')) {
                    throw new Error('Email already exists');
                }
            }
            throw error;
        }
    }

    // Ricerca utente per username
    static async findByUsername(username) {
        const query = 'SELECT * FROM users WHERE username = $1';
        const result = await db.query(query, [username]);
        return result.rows[0];
    }

    // Ricerca utente per email
    static async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await db.query(query, [email]);
        return result.rows[0];
    }

    // Verifica credenziali e aggiorna last_login
    static async authenticate(username, password) {
        const user = await this.findByUsername(username);

        if (!user) {
            return null;
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            // Aggiorna last_login
            const now = new Date();
            await db.query('UPDATE users SET last_login = $1 WHERE id = $2', [now, user.id]);

            // Non restituire la password
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }

        return null;
    }
}

module.exports = User;