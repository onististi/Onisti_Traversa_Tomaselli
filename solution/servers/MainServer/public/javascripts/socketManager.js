class SocketManager {
    static init({ userId, role, requestStatus }) {
        this.userId = userId;
        this.role = role;
        this.requestStatus = requestStatus;

        console.log('Initializing SocketManager for user:', userId);

        if (this.socket) {
            console.log('Socket already initialized');
            return;
        }

        this.socket = io({ withCredentials: true, reconnection: true, reconnectionAttempts: 3, reconnectionDelay: 5000 });
        this.setupEventHandlers();
    }


    static setupEventHandlers() {
        this.socket.on('connect', () => {
            console.log('Socket connected');
        });

        this.socket.on('status-update', (data) => {
            console.log('Status update received:', data);
            if (data.userId === this.userId && data.requestStatus !== this.requestStatus) {
                this.requestStatus = data.requestStatus;
                this.updateStatusUI(data.requestStatus);

                //Ricarica solamente quando ci sono cambiamenti di status
                if (data.requestStatus === 'approved' ||
                    (data.requestStatus === 'rejected' && window.location.pathname !== '/requests/request')) {
                    console.log('Status changed to', data.requestStatus, '. Reloading page.');
                    setTimeout(() => window.location.reload(), 2000);
                }
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

}

// Export for global use
window.SocketManager = SocketManager;