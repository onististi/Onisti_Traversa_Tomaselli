document.addEventListener('DOMContentLoaded', function() {
    // Inizializza i carousel
    initializeSliders();

    // Aggiungi funzionalità al pulsante di ricerca
    setupSearchButton();

    // Gestisci le immagini mancanti
    handleMissingImages();
});

function initializeSliders() {
    // Opzioni generali per tutti i slider
    const sliderOptions = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        arrows: false,
        autoplay: false,
        autoplaySpeed: 5000,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    };

    // Inizializza slider Oscar
    $('.oscar-movie-slider').slick(sliderOptions);
    setupNavButtons('.oscar-nav', '.oscar-movie-slider');

    // Inizializza slider Latest Movies
    $('.latest-movie-slider').slick(sliderOptions);
    setupNavButtons('.latest-nav', '.latest-movie-slider');

    // Inizializza slider Top Rated
    $('.top-movie-slider').slick(sliderOptions);
    setupNavButtons('.top-nav', '.top-movie-slider');
}

function setupNavButtons(navSelector, sliderSelector) {
    // Configura i pulsanti di navigazione
    const prevBtn = document.querySelector(`${navSelector} .prev-arrow`);
    const nextBtn = document.querySelector(`${navSelector} .next-arrow`);

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', function() {
            $(sliderSelector).slick('slickPrev');
        });

        nextBtn.addEventListener('click', function() {
            $(sliderSelector).slick('slickNext');
        });
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

function performSearch(searchTerm) {
    // Qui puoi implementare la logica di ricerca
    if (searchTerm.trim() !== '') {
        // Reindirizza alla pagina di ricerca o esegui una richiesta AJAX
        console.log(`Ricerca per: ${searchTerm}`);
        // Esempio: window.location.href = `/search?term=${encodeURIComponent(searchTerm)}`;
    }
}

function handleMissingImages() {
    // Gestisci immagini mancanti o non caricate
    const posterImages = document.querySelectorAll('.poster img');

    posterImages.forEach(img => {
        // Controlla se l'immagine è caricata correttamente
        img.addEventListener('error', function() {
            // Aggiungi una classe per applicare stili alternativi
            this.parentElement.classList.add('missing-image');
            this.style.display = 'none';

            // Crea un elemento di fallback
            const fallback = document.createElement('div');
            fallback.className = 'image-fallback';
            fallback.textContent = 'No Image';
            this.parentElement.appendChild(fallback);
        });

        // Verifica anche le immagini già non caricate
        if (!img.complete || img.naturalHeight === 0 || !img.src || img.src === 'null' || img.src === 'undefined') {
            img.dispatchEvent(new Event('error'));
        }
    });
}