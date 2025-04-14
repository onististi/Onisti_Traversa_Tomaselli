document.addEventListener('DOMContentLoaded', function() {
    let filteredMovies;
    const ITEMS_PER_PAGE = 16;
    let loadMoreBtn = document.getElementById('load-more');
    loadMoreBtn.addEventListener('click', loadMoreMovies);

    //inizializza select2 per il dropdown dei generi
    const genreSelect = $('.genre-select').select2({
        placeholder: "ALL GENRES",
        minimumResultsForSearch: Infinity,
        closeOnSelect: false,
        width: 'auto'
    });

    //bottone + aggiunta filtri apre il dropdown
    document.querySelector('.add-filter-btn').addEventListener('click', function() {
        genreSelect.select2('open');
    });

    //l hbs carica tutte le card, vengono presi i dati e salvati per lavorarci e fatte vedere in base ai criteri scelti
    const movieCards = document.querySelectorAll('.movie-card');
    let allMovies = Array.from(movieCards).map(card => ({
        id: card.dataset.movieId,
        name: card.querySelector(".movie-name").textContent,
        rating: parseFloat(card.querySelector(".rating").textContent),
        genres: card.querySelector(".movie-meta span:last-child").textContent.split(',').map(g => g.trim()),
        posterLink : card.querySelector(".posterlink").src
    }));


    //se sceglie filtro all genres rimuove gli altri filtri e viceversa
    genreSelect.on('select2:select', function(e) {
        const selected = genreSelect.val();
        if (e.params.data.id === 'all') {
            genreSelect.val(['all']).trigger('change');
        }
        else if (selected.includes('all')) {
            const newSelected = selected.filter(item => item !== 'all');
            genreSelect.val(newSelected).trigger('change');
        }
    });
    //se rimuove l'ultimo filtro mette all come unico
    genreSelect.on('select2:unselect', function() {
        const selected = genreSelect.val();
        if (!selected || selected.length === 0)
            genreSelect.val(['all']).trigger('change');
    });

    genreSelect.on('select2:select select2:unselect', function() {
        applyFilters();
    });
    document.getElementById('sort-select').addEventListener('change', function() {
        applyFilters();
    });


    //imposta i generi passati all'url se presenti
    const genreFromUrl = new URLSearchParams(window.location.search).get('genre');
    if (genreFromUrl) {
        genreSelect.val([genreFromUrl]).trigger('change');
    }

    function applyFilters() {
        const selectedGenres = genreSelect.val() || [];
        const sortBy = document.getElementById('sort-select').value;

        //lowercase del genere selezionato se no non matcha con quelli scritti in minore nelle cards
        const normalizedSelectedGenres = selectedGenres.map(g => g.toLowerCase().trim());

        filteredMovies = [...allMovies];

        //filltro per genere
        if (selectedGenres.length > 0 && !selectedGenres.includes('all')) {
            filteredMovies = filteredMovies.filter(movie => {
                if (!movie.genres) return false;
                return movie.genres.some(genre =>
                    normalizedSelectedGenres.includes(genre.toLowerCase().trim())
                );
            });
        }

        //sorting
        filteredMovies.sort((a, b) => {
            if (sortBy === "name_asc")
                return a.name.localeCompare(b.name);
            else if (sortBy === "name_desc")
                return b.name.localeCompare(a.name);
            else if (sortBy === "release")
                return b.movies_count - a.movies_count;
            else if(sortBy === "rating")
                return b.rating - a.rating;
            return 0;
        });

        //mostra prima pagina, 16 cards
        const paginatedMovies = filteredMovies.slice(0, ITEMS_PER_PAGE);
        renderMovies(paginatedMovies, false);

        if (filteredMovies.length > ITEMS_PER_PAGE) {
            //gestione bottone dopo applicazione filtri (uguale ad actors): se dopo il filtraggio n<16 display=none, se dopo cambio filtrli > display = true
            if (getComputedStyle(loadMoreBtn).display !== 'none')
                loadMoreBtn.dataset.currentPage = '1';
            else if(getComputedStyle(loadMoreBtn).display === 'none') { //resetta a 1 la pagina, "slice" di film visionabili
                loadMoreBtn.style.display = 'inline'
                loadMoreBtn.dataset.currentPage = '1'
            }
        } else if (loadMoreBtn)
            loadMoreBtn.style.display = 'none';
    }

    function loadMoreMovies() {

        let currentPage = parseInt(loadMoreBtn.dataset.currentPage || '1');

        const endIndex = currentPage * ITEMS_PER_PAGE + ITEMS_PER_PAGE;
        const paginatedMovies = filteredMovies.slice(currentPage*ITEMS_PER_PAGE, endIndex);

        renderMovies(paginatedMovies, true);
        loadMoreBtn.dataset.currentPage = (currentPage+1).toString();

        if (endIndex >= filteredMovies.length) {
            loadMoreBtn.style.display = 'none';
        }
    }

    function renderMovies(movies, append = false) {
        const container = document.getElementById('movies-container');
        if (!append) {
            container.innerHTML = '';
        }

        movies.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'movie-card';
            card.dataset.movieID = movie.id;

            const genreLinks = movie.genres.map(genre =>
                `<a href="/movies?genre=${encodeURIComponent(genre)}" class="genre-link">`+genre.toLowerCase()+`</a> `);

            card.innerHTML = `
                <a href="/movies/:${movie.id}">
                    <div class="movie-poster">
                        <img src="${movie.posterLink}" alt="${movie.name}" onerror="this.style.display='none'">
                    </div>
                    <h3 class="movie-name">${movie.name}</h3>
                    <div class="movie-meta">
                        <span class="rating">average rating: ${movie.rating}</span><br>
                        <span>${genreLinks}</span>
                    </div>
                </a>`;
            container.appendChild(card);
        });
    }

    applyFilters();
});