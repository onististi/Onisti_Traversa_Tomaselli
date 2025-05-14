document.addEventListener('DOMContentLoaded', function() {
    if (window.SocketManager) {
        SocketManager.init({
            userId: window.chatData.userId,
            role: window.chatData.role,
            requestStatus: window.chatData.requestStatus,
        });
    }

    const chatMessagesContainer = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const connectionStatus = document.getElementById('connection-status');

    if (window.chatData.chatId) {
        SocketManager.joinChatRoom(window.chatData.chatId);

        if (chatMessagesContainer) {
            scrollToBottom();
        }
    }

    if (sendButton && messageInput) {
        sendButton.addEventListener('click', sendMessage);

        messageInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter')
                sendMessage();
        });
    }

    async function sendMessage() {
        const content = messageInput.value.trim();

        if (!content) return;

        const messageData = {
            chatId: window.chatData.chatId,
            chatCode: window.chatData.chatCode,
            userId: window.chatData.userId,
            username: window.chatData.username,
            role: window.chatData.role,
            content: content,
            chatTitle: window.chatData.chatTitle,
            chatName: window.chatData.chatName,
        };

        // Mostra il messaggio localmente con ruolo esplicito
        addMessageToChat({
            username: window.chatData.username,
            role: window.chatData.role, // Questo è corretto ma non veniva visualizzato correttamente
            content: content,
            time: new Date().toLocaleTimeString('it-IT')
        });

        scrollToBottom();
        messageInput.value = '';

        // Invia il messaggio tramite WebSocket
        await SocketManager.sendChatMessage(messageData);
    }

    SocketManager.onNewMessage(function(message) {
        // Mostra i messaggi dalla stessa chat, evitando duplicati se è l'utente corrente
        if (window.chatData.chatCode === message.chatCode) {
            console.log('Nuovo messaggio ricevuto via socket:', message);

            // Se NON è un messaggio dell'utente corrente, mostralo
            // (i messaggi dell'utente corrente sono già mostrati localmente)
            if (message.userId !== window.chatData.userId) {
                addMessageToChat({
                    username: message.username,
                    role: message.role || 'user', // Assicurati che ci sia sempre un ruolo
                    content: message.content,
                    time: message.time || new Date().toLocaleTimeString('it-IT')
                });
                scrollToBottom();
            }
        }
    });


    SocketManager.onConnectionStatusChange(function(status) {
        updateConnectionStatus(status);
    });


    function addMessageToChat(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message';

        // Create combined username and role element
        const userHeaderElement = document.createElement('div');
        userHeaderElement.className = 'message-header';

        // Create username element
        const usernameElement = document.createElement('span');
        usernameElement.className = 'message-username';
        usernameElement.textContent = message.username;

        // Aggiungi il ruolo tra parentesi accanto al nome utente
        const role = message.role || 'user';
        usernameElement.textContent += ` (${role})`;

        userHeaderElement.appendChild(usernameElement);

        const textElement = document.createElement('div');
        textElement.className = 'message-text';
        textElement.textContent = message.content;

        const timeElement = document.createElement('div');
        timeElement.className = 'message-time';
        timeElement.textContent = message.time || new Date().toLocaleTimeString('it-IT');

        // Append all elements in correct order
        messageElement.appendChild(userHeaderElement);
        messageElement.appendChild(textElement);
        messageElement.appendChild(timeElement);
        chatMessagesContainer.appendChild(messageElement);
    }

    function scrollToBottom() {
        if (chatMessagesContainer) {
            chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        }
    }

    // Function to update connection status
    function updateConnectionStatus(status) {
        if (connectionStatus) {
            connectionStatus.className = `connection-status ${status}`;
            connectionStatus.textContent = status === 'connected' ? 'Connesso' : 'Disconnesso';
        }
    }

    // Utility function to get query parameters
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }
});