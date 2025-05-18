const express = require('express');
const router = express.Router();
const axios = require('axios');
const { ensureMaster } = require('../middleware/auth');
const {notifyUser} = require("../websocket");

const DATA_SERVER_URL = process.env.DATA_SERVER_URL || 'http://localhost:3001';

router.get('/requests', ensureMaster, async (req, res) => {
    console.log('DEBUG: Entrato nella route /admin/requests');
    try {
        // Check if the URL should include /api
        const baseUrl = DATA_SERVER_URL;
        const apiPath = baseUrl.endsWith('/api') ? '' : '/api';

        const response = await axios.get(
            `${baseUrl}${apiPath}/requests/pending`,
            {
                headers: {
                    'Authorization': `Bearer ${req.session.token}`,
                    'X-Admin-Id': req.session.user.id
                }
            }
        );

        console.log('DEBUG: Richieste recuperate:', response.data.requests);
        res.render('admin/requests', {
            title: 'Gestione Richieste',
            requests: response.data.requests || [],
            success: req.query.success,
            error: req.query.error
        });
    } catch (error) {
        console.error('Errore nel recupero delle richieste:', error.message);
        // Provide more detailed error information
        const errorDetails = {
            message: 'Errore nel recupero delle richieste pendenti',
            status: error.response ? error.response.status : 'unknown',
            details: error.response ? error.response.data : error.message
        };

        console.error('Dettagli errore:', errorDetails);

        res.render('error', {
            message: 'Errore nel recupero delle richieste pendenti',
            error: errorDetails
        });
    }
});


router.post('/handle', ensureMaster, async (req, res) => {
    console.log('Prima di gestire la richiesta, token in sessione:', req.session.token);

    try {
        const { userId, action, reason } = req.body;
        const baseUrl = DATA_SERVER_URL;
        const apiPath = baseUrl.endsWith('/api') ? '' : '/api';

        // Inoltra la richiesta al DataServer
        const response = await axios.post(
            `${baseUrl}${apiPath}/requests/handle`,
            { userId, action, reason },
            {
                headers: {
                    'Authorization': `Bearer ${req.session.token}`,
                    'X-User-Id': req.session.user.id
                }
            }
        );

        // Se il DataServer restituisce un nuovo token, lo aggiorna nella sessione
        if (response.data.token) {
            req.session.token = response.data.token; // Aggiorna il token
            // Aggiorna anche i dati dell'utente, così req.session.user è aggiornato.
            if (response.data.user) {
                req.session.approvedUser = response.data.user; // Salva i dati dell'utente approvato in un campo separato
                console.log('Utente approvato salvato:', req.session.approvedUser);
            }


            await new Promise((resolve, reject) => {
                req.session.save(err => {
                    if (err) {
                        console.error('Errore nel salvataggio del token nella sessione:', err.message);
                        return reject(err);
                    }
                    resolve();
                });
            });
        }

        console.log('Token DOPO la gestione:', req.session.token);
        return res.redirect('/admin/requests?success=Richiesta gestita con successo');
    } catch (error) {
        console.error('Errore gestione richiesta:', error.message);
        return res.redirect('/admin/requests?error=Errore durante l\'elaborazione della richiesta');
    }
});



module.exports = router;