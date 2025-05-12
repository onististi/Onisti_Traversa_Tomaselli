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
            content: content,
            chatTitle: window.chatData.chatTitle,
            chatName: window.chatData.chatName,
        };

        const response  = await fetch('http://localhost:3001/api/chat/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(messageData)
        })

        addMessageToChat(messageData);
        scrollToBottom();
        messageInput.value = '';

        if(!messageData.chatId)
            SocketManager.joinChatRoom(response.json()._id);
        await SocketManager.sendChatMessage(messageData); //da avere dopo la fetch dato che serve la connessione alla stanza con l'id nuovo appena creato
    }

    SocketManager.onNewMessage(function(message) {
        if (window.chatData.chatCode === message.chatCode) {
            addMessageToChat(message);
            scrollToBottom();
        }
    });


    SocketManager.onConnectionStatusChange(function(status) {
        updateConnectionStatus(status);
    });


    function addMessageToChat(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message';

        const usernameElement = document.createElement('div');
        usernameElement.className = 'message-username';
        usernameElement.textContent = message.username;

        const textElement = document.createElement('div');
        textElement.className = 'message-text';
        textElement.textContent = message.content;

        const timeElement = document.createElement('div');
        timeElement.className = 'message-time';
        timeElement.textContent = message.time || new Date().toLocaleTimeString('it-IT');

        messageElement.appendChild(usernameElement);
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