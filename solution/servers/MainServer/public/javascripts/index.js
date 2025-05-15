document.addEventListener('DOMContentLoaded', function() {
    initializeSliders();
    setupSearchButton();
    handleMissingImages();
});

function initializeSliders() {
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
        searchButton.addEventListener('click', function() {
            searchInput.value = '';
        });

        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch(searchInput.value);
            }
        });
    }
}

function performSearch(searchTerm) {
    if (searchTerm.trim() !== '') {
        console.log(`Ricerca per: ${searchTerm}`);
        window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
    }
}

function handleMissingImages() {

    const posterImages = document.querySelectorAll('.poster img');

    posterImages.forEach(img => {
        img.addEventListener('error', function() {

            this.parentElement.classList.add('missing-image');

            const fallback = document.createElement('div');
            fallback.className = 'image-fallback';
            fallback.textContent = 'No Image';
            this.parentElement.appendChild(fallback);
        });

        if (!img.complete || img.naturalHeight === 0 || !img.src || img.src === 'null' || img.src === 'undefined') {
            img.dispatchEvent(new Event('error'));
        }
    });
}