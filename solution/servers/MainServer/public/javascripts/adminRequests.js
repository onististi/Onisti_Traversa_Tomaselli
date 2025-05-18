// adminRequests.js - Client-side JavaScript for managing journalist requests

document.addEventListener('DOMContentLoaded', function() {
    const socket = io();

    // Setup WebSocket connection status indicator
    const connectionStatus = document.getElementById('connection-status');
    if (connectionStatus) {
        socket.on('connect', () => {
            connectionStatus.textContent = 'Connected';
            connectionStatus.className = 'connected';
        });

        socket.on('disconnect', () => {
            connectionStatus.textContent = 'Disconnected';
            connectionStatus.className = 'disconnected';
        });
    }

    // Handle approval/rejection buttons for requests
    document.querySelectorAll('.approve-btn, .reject-btn').forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();

            const requestId = this.getAttribute('data-id');
            const action = this.classList.contains('approve-btn') ? 'approve' : 'reject';

            // Get rejection reason if rejecting
            let reason = '';
            if (action === 'reject') {
                reason = prompt('Enter rejection reason (optional):');
                if (reason === null) return; // User cancelled
            }

            try {
                const response = await fetch('/admin/requests/handle', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userId: requestId,
                        action: action,
                        reason: reason
                    })
                });

                const result = await response.json();

                if (result.success) {
                    // Update UI
                    const requestItem = document.getElementById(`request-${requestId}`);
                    if (requestItem) {
                        if (action === 'approve') {
                            requestItem.classList.add('approved');
                            requestItem.querySelector('.status').textContent = 'Approved ✓';
                        } else {
                            requestItem.classList.add('rejected');
                            requestItem.querySelector('.status').textContent = 'Rejected ✗';
                        }

                        // Disable buttons
                        requestItem.querySelectorAll('button').forEach(btn => {
                            btn.disabled = true;
                        });
                    }

                    // Show notification
                    showNotification(`Request ${action === 'approve' ? 'approved' : 'rejected'} successfully.`, 'success');
                } else {
                    showNotification('Error processing request.', 'error');
                }
            } catch (error) {
                console.error('Error handling request:', error);
                showNotification('Server error. Please try again.', 'error');
            }
        });
    });

    // Function to show notifications
    function showNotification(message, type) {
        const notificationArea = document.getElementById('notification-area');
        if (!notificationArea) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        notificationArea.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 5000);
    }

    // Real-time updates for request status
    socket.on('status-update', (data) => {
        console.log('Status update received:', data);
        const requestItem = document.getElementById(`request-${data.userId}`);

        if (requestItem) {
            const statusElement = requestItem.querySelector('.status');
            if (statusElement) {
                if (data.requestStatus === 'approved') {
                    statusElement.textContent = 'Approved ✓';
                    requestItem.classList.add('approved');
                } else if (data.requestStatus === 'rejected') {
                    statusElement.textContent = 'Rejected ✗';
                    requestItem.classList.add('rejected');
                }

                // Disable buttons after status change
                requestItem.querySelectorAll('button').forEach(btn => {
                    btn.disabled = true;
                });
            }
        }
    });
});