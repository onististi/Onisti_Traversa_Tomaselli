class SocketManager {
    static init({userId, role, requestStatus}) {
        console.log('Esecuzione SocketManager.init()', {userId, role, requestStatus});

        if (this.socket) {
            console.log('Il socket è già stato inizializzato. Stato attuale:', {
                userId: this.userId,
                role: this.role,
                requestStatus: this.requestStatus
            });
            return;
        }

        this.userId = userId;
        this.role = role;
        this.requestStatus = requestStatus;

        // Crea una connessione socket la logga
        this.socket = io({withCredentials: true});
        console.log('Socket creato:', this.socket);

        this.setupEventHandlers();

        // Segnala che l'inizializzazione è completata
        console.log('SocketManager inizializzato con successo.');
    }


    static setupEventHandlers() {
        this.socket.on('connect', () => {
            console.log('Socket connected');
        });

        this.socket.on('status-update', (data) => {
            console.log('Evento status-update ricevuto dal WebSocket:', data);
            // Aggiorna sempre la UI, anche se lo stato è uguale a quello attuale
            if (data.userId === this.userId) {
                this.requestStatus = data.requestStatus;
                this.updateStatusUI(data.requestStatus);
                console.log(`Stato aggiornato per userId ${data.userId}: ${data.requestStatus}`);
            } else {
                console.warn(`Nessun aggiornamento per userId ${data.userId}. Stato corrente: ${this.requestStatus}`);
            }
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        this.socket.on('token-expired', (data) => {
            console.warn('Session expired:', data.message);
            window.location.href = '/auth/login?error=Session_expired';
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
        });

        this.socket.on('session-expiring', (data) => {
            console.log('Event session-expiring ricevuto:', data.message);
            this.showNotification(data.message, '#ffc107', true); // Mostra notifica con pulsante di chiusura
        });

        this.socket.on('session-expired', (data) => {
            console.warn('Event session-expired ricevuto:', data.message);
            this.showNotification(data.message, '#dc3545', false); // Mostra notifica senza pulsante di chiusura
            setTimeout(() => {
                window.location.href = '/auth/login?error=Session_expired';
            }, 3000); // Ritardo per il redirect
        });
    }

    static showNotification(message, backgroundColor, showCloseButton) {
        const notificationContainer = document.getElementById('status-notification');
        const notificationMessage = document.getElementById('notification-message');
        const closeButton = document.getElementById('close-notification');

        if (notificationContainer) {
            // Aggiorna contenitore con il messaggio e stile
            notificationContainer.style.display = 'block';
            notificationContainer.style.backgroundColor = backgroundColor;
            notificationMessage.textContent = message;

            // Mostra il pulsante di chiusura solo per session-expiring
            closeButton.style.display = showCloseButton ? 'inline-block' : 'none';

            // Nascondi la notifica automaticamente dopo 5 secondi
            setTimeout(() => {
                notificationContainer.style.display = 'none';
            }, 5000);
        } else {
            console.warn('Elemento notifiche non trovato nel DOM');
        }
    }

    static updateStatusUI(requestStatus) {
        const statusIndicator = document.querySelector('.status-indicator');
        console.log('Elemento status-indicator trovato?', !!statusIndicator);

        if (statusIndicator) {
            if (requestStatus === 'approved') {
                // Mostra una notifica temporanea
                statusIndicator.innerHTML = `
                <div class="status-approved notification">
                    <span class="icon">✅</span> Request approved
                </div>`;
                console.log('Aggiornamento dello stato in: approved (notifica temporanea)');

                // Nascondi o rimuovi la notifica dopo 5 secondi (5000 ms)
                setTimeout(() => {
                    statusIndicator.innerHTML = '';
                    console.log('Notifica approved rimossa automaticamente');
                }, 5000);
            } else if (requestStatus === 'rejected') {
                // Mostra la notifica persistente per il rifiuto, con opzione per richiedere nuovamente
                statusIndicator.innerHTML = `
                <div class="status-rejected">
                    <span class="icon">❌</span> Request rejected
                    <a href="/requests/request" class="request-journalist-btn">
                        <span class="icon">✉️</span> Request Again
                    </a>
                </div>`;
                console.log('Aggiornamento dello stato in: rejected (notifica persistente)');
            } else {
                console.warn('Stato non gestito:', requestStatus);
            }
        } else {
            console.error('Elemento status-indicator non trovato nel DOM.');
        }
    }
}

window.SocketManager = SocketManager;