// socketManager.js - Client-side socket manager
class SocketManager {
    static socket = null;
    static userId = null;
    static role = null;
    static requestStatus = null;
    static dataServerUrl = null;
    static connectionStatus = 'disconnected';
    static connectionStatusListeners = [];
    static newMessageListeners = [];

    static init({ userId, role, requestStatus, dataServerUrl }) {
        this.userId = userId;
        this.role = role;
        this.requestStatus = requestStatus;
        this.dataServerUrl = dataServerUrl || window.chatData?.dataServerUrl;

        console.log('Initializing SocketManager for user:', userId);

        if (this.socket) {
            console.log('Socket already initialized, reconnecting...');
            this.socket.disconnect();
        }

        this.socket = io(this.dataServerUrl, {
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 3000
        });

        this.setupEventHandlers();
    }

    static setupEventHandlers() {
        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket.id);
            this.setConnectionStatus('connected');
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
            this.setConnectionStatus('disconnected');
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            this.setConnectionStatus('disconnected');
        });

        // Listen for new chat messages
        this.socket.on('new-chat-message', (data) => {
            console.log('New chat message received:', data);
            this.notifyNewMessageListeners(data);
        });

        // Status notification handlers
        this.socket.on('status-update', (data) => {
            console.log('Status update received:', data);
            if (data.userId === this.userId && data.requestStatus !== this.requestStatus) {
                this.requestStatus = data.requestStatus;
                this.showNotification(`Il tuo stato è cambiato a: ${data.requestStatus}`, '#28a745');

                if (data.requestStatus === 'approved' ||
                    (data.requestStatus === 'rejected' && window.location.pathname !== '/requests/request')) {
                    console.log('Status changed to', data.requestStatus, '. Reloading page.');
                    setTimeout(() => window.location.reload(), 2000);
                }
            }
        });

        this.socket.on('token-expired', (data) => {
            console.warn('Session expired:', data.message);
            this.showNotification('Sessione scaduta. Reindirizamento al login...', '#dc3545');
            setTimeout(() => {
                window.location.href = '/auth/login?error=Session_expired';
            }, 2000);
        });

        this.socket.on('session-expiring', (data) => {
            console.log('Session expiring:', data.message);
            this.showNotification(data.message, '#ffc107', true);
        });

        this.socket.on('session-expired', (data) => {
            console.warn('Session expired:', data.message);
            this.showNotification(data.message, '#dc3545');
            setTimeout(() => {
                window.location.href = '/auth/login?error=Session_expired';
            }, 3000);
        });
    }

    // Join a chat room
    static joinChatRoom(chatCode) {
        if (this.socket && chatCode) {
            console.log('Joining chat room:', chatCode);
            this.socket.emit('join-chat-room', { chatCode, userId: this.userId });
        } else {
            console.error('Cannot join chat room: Socket not initialized or no chatCode');
        }
    }

    // Send a chat message
    static async sendChatMessage(messageData) {
        if (!this.socket) {
            console.error('Cannot send message: Socket not initialized');
            return;
        }

        if (!messageData.chatCode || !messageData.userId || !messageData.content) {
            console.log(messageData)
            console.error('Cannot send message: Missing required data');
            return;
        }

        console.log('Sending chat message:', messageData);
        this.socket.emit('chat-message', messageData);
    }

    // Register listener for new messages
    static onNewMessage(callback) {
        if (typeof callback === 'function') {
            this.newMessageListeners.push(callback);
        }
    }

    // Notify all message listeners
    static notifyNewMessageListeners(message) {
        this.newMessageListeners.forEach(listener => {
            try {
                listener(message);
            } catch (error) {
                console.error('Error in message listener:', error);
            }
        });
    }

    // Set connection status and notify listeners
    static setConnectionStatus(status) {
        this.connectionStatus = status;
        this.connectionStatusListeners.forEach(listener => {
            try {
                listener(status);
            } catch (error) {
                console.error('Error in connection status listener:', error);
            }
        });
    }

    // Register listener for connection status changes
    static onConnectionStatusChange(callback) {
        if (typeof callback === 'function') {
            this.connectionStatusListeners.push(callback);
            // Immediately trigger with current status
            callback(this.connectionStatus);
        }
    }

    // Show notification to user
    static showNotification(message, backgroundColor, showCloseButton = false) {
        const notificationContainer = document.getElementById('status-notification');
        const notificationMessage = document.getElementById('notification-message');
        const closeButton = document.getElementById('close-notification');

        if (notificationContainer && notificationMessage) {
            // Update container with message and style
            notificationContainer.style.display = 'block';
            notificationContainer.style.backgroundColor = backgroundColor;
            notificationMessage.textContent = message;

            // Show close button only for session-expiring
            if (closeButton) {
                closeButton.style.display = showCloseButton ? 'inline-block' : 'none';
            }

            // Hide notification automatically after 5 seconds
            setTimeout(() => {
                notificationContainer.style.display = 'none';
            }, 5000);
        } else {
            console.warn('Notification elements not found in DOM');
        }
    }
}

// Export for global use
window.SocketManager = SocketManager;