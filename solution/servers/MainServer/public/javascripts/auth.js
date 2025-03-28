document.addEventListener('DOMContentLoaded', function() {
    var messages = document.querySelectorAll('.message');
    messages.forEach(function(message) {
        // Nasconde il messaggio dopo 5 secondi
        setTimeout(function() {
            message.style.display = 'none';
        }, 5000);
    });
});
