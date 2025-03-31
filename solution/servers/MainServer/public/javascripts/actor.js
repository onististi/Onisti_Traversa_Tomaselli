document.addEventListener('DOMContentLoaded', function() {
    const loadBtn = document.getElementById('loadMoreBtn');
    let currentPage = 0;
    const actorName = document.querySelector('h1').textContent.trim(); // Ottieni il nome dell'attore dal titolo

    if (loadBtn) {
        loadBtn.addEventListener('click', function() {
            loadMoreMovies();
        });
    }

    function loadMoreMovies() {
        currentPage++; // Incrementa la pagina
        fetch(`http://localhost:8080/api/actors/${actorName}/movies?page=${currentPage}&size=8`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Errore nella risposta del server');
                }
                return response.json();
            })
            .then(newMovies => {
                if (newMovies && newMovies.length > 0) {
                    renderMovies(newMovies);
                    // Se ci sono meno di 8 film, nasconde il pulsante
                    if (newMovies.length < 8) {
                        loadBtn.style.display = 'none';
                    }
                } else {
                    loadBtn.style.display = 'none'; // Nasconde il pulsante se non ci sono più film
                }
            })
            .catch(error => console.error("Errore nel caricamento dei film:", error));
    }

    function renderMovies(movies) {
        const filmographyGrid = document.getElementById('filmographyGrid');

        movies.forEach(movie => {
            const movieElement = document.createElement('div');
            movieElement.classList.add('movie-card');

            movieElement.innerHTML = `
                <a href="/movies/:${movie.movie.id}">
                    <div class="movie-poster" style="background-image: url('${movie.movie.posterLink}');"></div>
                    <div class="movie-info">
                        <h3 class="movie-title">${movie.movie.title || movie.movie.name}</h3>
                        <p class="movie-role">${movie.role}</p>
                        <p class="movie-year">${movie.movie.year || 'N/A'}</p>
                        <p class="movie-rated">${movie.movie.rating ? movie.movie.rating + '/5' : 'N/A'}</p>
                    </div>
                </a>
            `;

            filmographyGrid.appendChild(movieElement);
        });
    }
});