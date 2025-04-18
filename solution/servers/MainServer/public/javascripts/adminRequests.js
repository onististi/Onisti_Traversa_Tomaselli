if (!window.socketInitialized) {
    const socket = io();
    const userId = document.getElementById('userId')?.value;

    socket.on('status-update', (data) => {
        console.log('WebSocket status-update received:', data);
        const row = document.querySelector(`[data-user-id="${data.userId}"]`);
        if (row) {
            const statusCell = row.querySelector('.status-cell');
            if (data.requestStatus === 'approved') {
                statusCell.innerHTML = `<span class="approved-status">✅ Approved</span>`;
            } else if (data.requestStatus === 'rejected') {
                statusCell.innerHTML = `<span class="rejected-status">❌ Rejected</span>`;
            }
        } else {
            console.warn(`Row for user ${data.userId} not found`);
        }
    });

    socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
    });

    socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error.message);
    });
}