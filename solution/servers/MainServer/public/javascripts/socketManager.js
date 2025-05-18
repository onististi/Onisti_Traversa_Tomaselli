class SocketManager {
    static socket = null;
    static userId = null;
    static role = null;
    static requestStatus = null;
    static dataServerUrl = null;
    static connectionStatus = 'disconnected';
    static connectionStatusListeners = [];
    static newMessageListeners = [];
    static lastNotifiedStatus = null; // Track the last notified status
    static notificationsShown = {}; // Track notifications by status

    static init({ userId, role, requestStatus, dataServerUrl }) {
        console.log('Esecuzione SocketManager.init()', { userId, role, requestStatus });

        if (this.userId && this.userId !== userId) {
            console.log('User changed, forcing reconnection');
            this.socket?.disconnect();
            this.socket = null;
            // Reset notification tracking on user change
            this.lastNotifiedStatus = null;
            this.notificationsShown = {};
        }

        this.userId = userId;
        this.role = role;
        this.requestStatus = requestStatus;
        this.dataServerUrl = dataServerUrl || window.chatData?.dataServerUrl;

        console.log('SocketManager role set to:', this.role);

        if (this.socket) {
            this.socket.disconnect();
        }

        this.socket = io(this.dataServerUrl, {
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 3000
        });

        this.setupEventHandlers();

        setTimeout(() => {
            if (this.socket?.connected && this.userId) {
                this.socket.emit('request-status-update', { userId: this.userId });
            }
        }, 1000);

        this.updateStatusUI(this.requestStatus);
    }

    static setupEventHandlers() {
        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket.id);
            this.setConnectionStatus('connected');
            if (this.userId) {
                this.socket.emit('request-status-update', { userId: this.userId });
            }
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
            this.setConnectionStatus('disconnected');
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            this.setConnectionStatus('disconnected');
        });

        this.socket.on('new-chat-message', (data) => {
            console.log('New chat message received:', data);
            this.notifyNewMessageListeners(data);
        });

        this.socket.on('status-update', (data) => {
            console.log('Evento status-update ricevuto:', data);
            if (data.userId === this.userId) {
                // Only show notification if the status has actually changed and hasn't been shown yet
                const statusKey = `${data.requestStatus}-${data.role || ''}`;

                if (data.requestStatus !== this.requestStatus && !this.notificationsShown[statusKey]) {
                    this.showNotification(`Stato aggiornato: ${data.requestStatus}`, '#28a745');
                    this.notificationsShown[statusKey] = true;
                }

                this.requestStatus = data.requestStatus;

                // Update the role if it has changed
                if (data.role) {
                    console.log(`Role updated from ${this.role} to ${data.role}`);
                    this.role = data.role;
                }

                this.updateStatusUI(data.requestStatus);
            }
        });

        this.socket.on('token-expired', (data) => {
            this.showNotification('Sessione scaduta. Reindirizzamento al login...', '#dc3545');
            setTimeout(() => {
                window.location.href = '/auth/login?error=Session_expired';
            }, 2000);
        });

        this.socket.on('session-expiring', (data) => {
            this.showNotification(data.message, '#ffc107', true);
        });

        this.socket.on('session-expired', (data) => {
            this.showNotification(data.message, '#dc3545');
            setTimeout(() => {
                window.location.href = '/auth/login?error=Session_expired';
            }, 3000);
        });
    }

    static joinChatRoom(chatCode) {
        if (this.socket && chatCode) {
            this.socket.emit('join-chat-room', { chatCode, userId: this.userId });
        }
    }

    static async sendChatMessage(messageData) {
        if (this.socket && messageData.chatCode && messageData.userId && messageData.content) {
            this.socket.emit('chat-message', messageData);
        }
    }

    static onNewMessage(callback) {
        if (typeof callback === 'function') {
            this.newMessageListeners.push(callback);
        }
    }

    static notifyNewMessageListeners(message) {
        this.newMessageListeners.forEach(listener => {
            try { listener(message); } catch (error) { console.error('Error in listener:', error); }
        });
    }

    static setConnectionStatus(status) {
        this.connectionStatus = status;
        this.connectionStatusListeners.forEach(listener => {
            try { listener(status); } catch (error) { console.error('Error in listener:', error); }
        });
    }

    static onConnectionStatusChange(callback) {
        if (typeof callback === 'function') {
            this.connectionStatusListeners.push(callback);
            callback(this.connectionStatus);
        }
    }

    static updateStatusUI(requestStatus) {
        const statusIndicator = document.getElementById('dynamic-status-indicator');
        if (!statusIndicator) return;

        console.log('Updating UI with role:', this.role, 'and status:', requestStatus);

        // Handling master role specifically
        if (this.role === 'master') {
            console.log('Master role detected, showing admin controls');
            statusIndicator.style.display = 'block';
            statusIndicator.innerHTML = '<a href="/admin/requests" class="admin-requests-btn"><span class="icon">⚙️</span> Manage Requests</a>';
            return;
        }

        // For non-master roles
        statusIndicator.style.display = 'block';
        statusIndicator.innerHTML = '';

        let newContent = '';
        switch(requestStatus) {
            case 'approved':
                newContent = `<div class="status-approved notification"><span class="icon">✅</span> Request approved</div>`;
                break;
            case 'rejected':
                newContent = `<div class="status-rejected">
                <span class="icon">❌</span> Request rejected
                <a href="/requests/request" class="request-journalist-btn">
                    <span class="icon">✉️</span> Request Again
                </a></div>`;
                break;
            case 'pending':
                newContent = `<div class="status-pending"><span class="icon">⏳</span> Request pending</div>`;
                break;
            default:
                newContent = `<a href="/requests/request" class="request-journalist-btn">
                <span class="icon">📝</span> Become a Journalist</a>`;
        }

        statusIndicator.innerHTML = newContent;
        void statusIndicator.offsetHeight;
    }

    static showNotification(message, backgroundColor, showCloseButton = false) {
        const notificationContainer = document.getElementById('status-notification');
        const notificationMessage = document.getElementById('notification-message');
        const closeButton = document.getElementById('close-notification');

        if (notificationContainer && notificationMessage) {
            notificationContainer.style.display = 'block';
            notificationContainer.style.backgroundColor = backgroundColor;
            notificationMessage.textContent = message;

            if (closeButton) {
                closeButton.style.display = showCloseButton ? 'inline-block' : 'none';
            }

            setTimeout(() => {
                notificationContainer.style.display = 'none';
            }, 5000);
        }
    }
}

window.SocketManager = SocketManager;