document.addEventListener('DOMContentLoaded', function() {
    const { filmId, chatCode, userId, username, dataServerUrl } = window.chatData;
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');
    const connectionStatus = document.getElementById('connection-status');

    if (!window.SocketManager || !window.SocketManager.socket) {
        if (window.SocketManager) {
            window.SocketManager.init({
                userId: userId,
                role: window.chatData.role || 'user',
                requestStatus: window.chatData.requestStatus || 'none'
            });
        } else {

            console.warn('SocketManager non trovato, creazione socket diretto');
            window.socket = io(dataServerUrl, { withCredentials: true });
        }
    }


    const socket = window.SocketManager ? window.SocketManager.socket : window.socket;


    function updateConnectionStatus() {
        if (socket.connected) {
            connectionStatus.textContent = 'Connesso';
            connectionStatus.className = 'connection-status connected';
        } else {
            connectionStatus.textContent = 'Disconnesso';
            connectionStatus.className = 'connection-status disconnected';
        }
    }


    updateConnectionStatus();


    socket.on('connect', () => {
        updateConnectionStatus();

        if (filmId) {
            console.log(`Entrando nella room del film: ${filmId}`);
            socket.emit('join-film-room', filmId);
        }
    });

    socket.on('disconnect', () => {
        updateConnectionStatus();
    });


    socket.on('new-chat-message', (message) => {
        console.log('Nuovo messaggio ricevuto:', message);


        if (message.filmId === filmId || message.filmId._id === filmId) {
            const messageElement = document.createElement('div');
            messageElement.className = 'message';

            const username = message.username || (message.sender ? message.sender.username : 'Utente');

            messageElement.innerHTML = `
                <div class="message-username">${username}</div>
                <div class="message-text">${message.content}</div>
                <div class="message-time">${message.time || new Date().toLocaleTimeString()}</div>
            `;

            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    });

    function sendMessage() {
        const content = messageInput.value.trim();
        if (content && filmId && userId) {
            console.log('Invio messaggio:', content);

            socket.emit('chat-message', {
                filmId,
                chatCode,
                userId,
                username,
                content
            });

            messageInput.value = '';
        }
    }

    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }

    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
});