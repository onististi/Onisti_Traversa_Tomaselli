document.addEventListener('DOMContentLoaded', () => {
    // Inizializzazione del SocketManager
    const userId = document.querySelector('#userId')?.value || localStorage.getItem('userId');
    const role = document.querySelector('.role-text')?.textContent.split(': ')[1];
    const requestStatus = document.querySelector('.status-indicator')?.dataset.status;

    if (userId && role && requestStatus) {
        SocketManager.init({ userId, role, requestStatus });
        console.log('SocketManager inizializzato:', { userId, role, requestStatus });
    } else {
        console.warn('Dati mancanti. Tentativo di aggiornare la sessione tramite /refresh-session.');
        axios.post('/user/refresh-session', { userId: localStorage.getItem('userId') })
            .then(response => {
                if (response.data.success) {
                    const { id, role, requestStatus } = response.data;
                    SocketManager.init({ userId: id, role, requestStatus });
                    console.log('SocketManager inizializzato con dati da /refresh-session:', { id, role, requestStatus });
                } else {
                    console.error('Errore nel recupero dei dati da /refresh-session:', response.data.message);
                }
            })
            .catch(error => {
                console.error('Errore durante la chiamata a /refresh-session:', error.message);
            });
    }

    // Collega l'aggiornamento del token al pulsante Home
    const homeIcon = document.getElementById('home-icon');
    if (homeIcon) {
        homeIcon.addEventListener('click', async (event) => {
            event.preventDefault(); // Blocca il comportamento predefinito
            const refreshedToken = await refreshTokenViaHTTP();

            if (refreshedToken) {
                console.log('Token aggiornato con successo. Connessione WebSocket in corso...');
                window.location.href = homeIcon.getAttribute('href')

                if (window.socket) {
                    console.log('Disconnessione del WebSocket per aggiornamento token...');
                    window.socket.disconnect();
                }

                // Riconnessione con il nuovo token
                window.socket = io('http://localhost:3000', {
                    query: { token: refreshedToken }
                });

                console.log('WebSocket riconnesso con token aggiornato:', refreshedToken);
            } else {
                console.error('Errore durante l’aggiornamento del token.');
                window.location.href = homeIcon.getAttribute('href')
            }
        });
    }
});

async function refreshTokenViaHTTP() {
    try {
        const response = await axios.post('/user/api/refresh-token', { userId: localStorage.getItem('userId') });
        if (response.data.token) {
            // Salva il nuovo token nel localStorage
            localStorage.setItem('jwtToken', response.data.token);
            console.log('Token aggiornato nel client!', response.data.token);

            // Se esiste una connessione WebSocket attiva la disconnette
            if (window.socket) {
                console.log('Disconnessione del WebSocket per aggiornamento token...');
                window.socket.disconnect();
            }

            // Riconnetti il WebSocket con il nuovo token
            window.socket = io('http://localhost:3000', {
                query: { token: response.data.token }
            });
            console.log('WebSocket riconnesso con token aggiornato!');

            return response.data.token;
        } else {
            console.warn('Nessun token aggiornato nella risposta del server.');
            return null;
        }
    } catch (error) {
        console.error('Errore nel refresh del token:', error.message);
        return null;
    }
}