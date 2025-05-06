document.addEventListener('DOMContentLoaded', function() {
    // Recupera i dati passati dal server
    const { filmId, userId, username, dataServerUrl } = window.chatData;

    // Elementi DOM
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');
    const connectionStatus = document.getElementById('connection-status');
    const typingIndicator = document.getElementById('typing-indicator');
    const filmListItems = document.querySelectorAll('.film-list li');

    // Inizializza Socket.io
    const socket = io(dataServerUrl);

    // Gestione connessione WebSocket
    socket.on('connect', () => {
        console.log('Connesso al server WebSocket');
        connectionStatus.textContent = 'Connesso';
        connectionStatus.classList.remove('disconnected');
        connectionStatus.classList.add('connected');

        if (filmId) {
            // Unisciti alla stanza del film se è stato selezionato
            socket.emit('join-film-room', filmId);
        }
    });

    socket.on('disconnect', () => {
        console.log('Disconnesso dal server WebSocket');
        connectionStatus.textContent = 'Disconnesso';
        connectionStatus.classList.remove('connected');
        connectionStatus.classList.add('disconnected');
    });

    // Ricezione nuovi messaggi
    socket.on('new-chat-message', (message) => {
        if (message.filmId === filmId) {
            const messageElement = document.createElement('div');
            messageElement.className = 'message';
            messageElement.innerHTML = `
                <div class="message-username">${message.username}</div>
                <div class="message-text">${message.text}</div>
                <div class="message-time">${message.time ||
            new Date(message.timestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</div>
            `;
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    });

    // Invio messaggi
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    function sendMessage() {
        const text = messageInput.value.trim();
        if (text && filmId && userId) {
            const messageData = {
                filmId,
                username,
                text,
                userId
            };
            socket.emit('chat-message', messageData);
            messageInput.value = '';
        }
    }

    // Gestione cambio film dalla sidebar
    filmListItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Se già su questo film, non fare nulla
            if (item.classList.contains('active')) {
                e.preventDefault();
                return;
            }

            // Altrimenti il link normale porterà al refresh della pagina con il nuovo filmId
        });
    });
});