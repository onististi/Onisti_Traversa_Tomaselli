document.addEventListener('DOMContentLoaded', function() {
    fetchMoviesAndInitializeSliders();

    function fetchMoviesAndInitializeSliders() {
        try {
            if (oscarsWinnerData && oscarsWinnerData.length > 0)
                populateSlider('oscarsWinnerSlider', oscarsWinnerData, 'OSCAR VINTO');

            if (latestMoviesData && latestMoviesData.length > 0)
                populateSlider('latestMoviesSlider', latestMoviesData, 'DATA USCITA');

            if (topRatedMoviesData && topRatedMoviesData.length > 0)
                populateSlider('topRatedMoviesSlider', topRatedMoviesData, 'VALUTAZIONE');

            initializeSliders();
        } catch (error) {
            console.error('Error processing movies', error);
        }
    }

    function populateSlider(sliderId, movies, subtitleText) {
        const slider = document.getElementById(sliderId);
        slider.innerHTML = '';

        movies.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            movieCard.innerHTML = `
                <a href="/movies/${movie.id}">
                    <img src="${movie.posterLink}" alt="Movie Poster" class="movie-poster">
                    <div class="movie-info">
                        <h3>${movie.name}</h3>
                        <p>${movie.description}</p>
                        <span class="movie-subtitle">${subtitleText}</span>
                    </div>
               </a>
            `;
            slider.appendChild(movieCard);
        });
    }

    function initializeSliders() {
        initializeSlider('#oscarsWinnerSlider', '.oscars-nav');
        initializeSlider('#latestMoviesSlider', '.latest-nav');
        initializeSlider('#topRatedMoviesSlider', '.top-rated-nav');
    }

    function initializeSlider(sliderSelector, navSelector) {
        if ($(sliderSelector).children().length > 0) {
            $(sliderSelector).slick({
                slidesToShow: 3,
                slidesToScroll: 1,
                autoplay: false,
                dots: false,
                infinite: true,
                responsive: [
                    { breakpoint: 1024, settings: { slidesToShow: 2 } },
                    { breakpoint: 768, settings: { slidesToShow: 1 } }
                ]
            });

            $(`${navSelector} .next-arrow`).on('click', function() {
                $(sliderSelector).slick('slickNext');
            });

            $(`${navSelector} .prev-arrow`).on('click', function() {
                $(sliderSelector).slick('slickPrev');
            });
        }
    }
});
