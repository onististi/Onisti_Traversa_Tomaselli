
//chiamata al server java di prova
document.addEventListener("DOMContentLoaded", function () {
    fetch("http://localhost:8080/api/message") // Chiamata al server Java
        .then(response => response.text())
        .then(data => {
            document.getElementById("output").innerText = data; //mostra il messaggio
        })
        .catch(error => console.error("Errore:", error));
});