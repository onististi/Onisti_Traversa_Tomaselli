const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'SQLDB',
    password: 'root',
    port: 5432,
});

// Test di connessione
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Errore di connessione al database:', err);
    } else {
        console.log('Connessione al database riuscita:', res.rows[0]);
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};