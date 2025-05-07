document.addEventListener('DOMContentLoaded', function() {
    const { filmId, userId, username, dataServerUrl } = window.chatData;
    const socket = io(dataServerUrl);
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');
    const connectionStatus = document.getElementById('connection-status');

 //gestione socket, ricezione, invio
    socket.on('connect', () => {
        connectionStatus.textContent = 'Connesso';
        connectionStatus.className = 'connection-status connected';

        if (filmId) {
            socket.emit('join-film-room', filmId);
        }
    });

    socket.on('disconnect', () => {
        connectionStatus.textContent = 'Disconnesso';
        connectionStatus.className = 'connection-status disconnected';
    });

    socket.on('new-chat-message', (message) => {
        if (message.filmId._id === filmId) {
            const messageElement = document.createElement('div');
            messageElement.className = 'message';
            messageElement.innerHTML = `
                <div class="message-username">${message.username}</div>
                <div class="message-text">${message.content}</div>
                <div class="message-time">${message.time}</div>
            `;
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    });

    function sendMessage() {
        const content = messageInput.value.trim();
        if (content && filmId && userId) {
            socket.emit('chat-message', {
                filmId,
                userId,
                username,
                content
            });
            messageInput.value = '';
        }
    }

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
});