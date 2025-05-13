document.addEventListener('DOMContentLoaded', function() {
    setupSearchButton();
    setTimeout(() => {
        console.log("Bottone trovato?", document.getElementById('loadMoreBtn'));
    }, 2000);

    const loadBtn = document.getElementById('loadMoreBtn');
    let currentPage = 0;
    const pathSegments = window.location.pathname.split('/');
    // Correzione: decodifica una sola volta e codifica per l'URL
    const actorNameEncoded = pathSegments[2];
    const actorName = decodeURIComponent(actorNameEncoded);

    if (loadBtn) {
        loadBtn.addEventListener('click', function() {
            loadMoreMovies();
        });
    }

    function loadMoreMovies() {
        currentPage++;
        // Codifica il nome per l'URL
        const encodedName = encodeURIComponent(actorName);
        fetch(`http://localhost:8080/api/actors/${encodedName}/movies?page=${currentPage}&size=8`)
            .then(response => {
                if (!response.ok) {
                    loadBtn.style.display = 'none';
                    throw new Error('Errore nella risposta del server');
                }
                return response.json();
            })
            .then(newMovies => {
                if (newMovies.length > 0) {
                    renderMovies(newMovies);
                    loadBtn.style.display = newMovies.length < 8 ? 'none' : 'block';
                } else {
                    loadBtn.style.display = 'none';
                }
            })
            .catch(() => loadBtn.style.display = 'none');
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

    function performSearch(searchTerm) {
        if (searchTerm.trim() !== '') {
            window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
        }
    }

    function setupSearchButton() {
        const searchButton = document.querySelector('.search-container button');
        const searchInput = document.querySelector('.search-container input');

        if (searchButton && searchInput) {
            // Pulisci il campo di ricerca quando si clicca sulla X
            searchButton.addEventListener('click', function() {
                searchInput.value = '';
            });

            // Gestisci la ricerca quando si preme Enter
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    performSearch(searchInput.value);
                }
            });
        }
    }

});