document.addEventListener('DOMContentLoaded', function() {
   //tutto questo è per gli slideshows di attori e crew
    fetchActorsAndCrew()

    function fetchActorsAndCrew() {
        let hasActorsData = false;
        let hasCrewData = false;

        try {
            hasActorsData = actorsData && actorsData.length > 0;
            hasCrewData = crewData && crewData.length > 0;

            if (hasActorsData)
                populateActors(actorsData);
            else
                displayUnknownActors();

            if (hasCrewData)
                populateCrew(crewData);
            else
                displayUnknownCrew();

            if (hasActorsData || hasCrewData)
                initializeSliders();

        } catch (error) {
            console.error('Error for processing actors or crew', error);
            displayUnknownActors();
            displayUnknownCrew();
        }
    }


    function displayUnknownActors() {
        const actorsSlider = document.getElementById('actorsSlider');
        actorsSlider.innerHTML = '<div class="unknown">Unknown actors</div>';
        document.querySelector('.actors-nav').style.display = 'none';
    }

    function displayUnknownCrew() {
        const crewSlider = document.getElementById('crewSlider');
        crewSlider.innerHTML = '<div class="unknown">Unknown crew</div>';
        document.querySelector('.crew-nav').style.display = 'none';
    }


    function populateActors(actorsData) {
        const actorsSlider = document.getElementById('actorsSlider');
        actorsSlider.innerHTML = ''; // Clear existing content

        actorsData.forEach(actor => {
            const actorCard = document.createElement('div');
            actorCard.className = 'actor-card';

            const photoUrl = actor.photo || '/images/placeholder.jpg';

            actorCard.innerHTML = `
            <div class="actor-image" style="background-image: url('${photoUrl}');"></div>
            <p class="actor-name">${actor.name}</p>
            <p class="actor-role">${actor.role}</p>
        `;
            actorsSlider.appendChild(actorCard);
        });
    }


    function populateCrew(crewData) {
        const crewSlider = document.getElementById('crewSlider');
        crewSlider.innerHTML = ''; // Clear existing content

        crewData.forEach(crewMember => {
            const crewCard = document.createElement('div');
            crewCard.className = 'crew-card';

            //da trovare modo per fare vedere immagini?
            const photoUrl = crewMember.photo || '/images/placeholder.jpg';

            crewCard.innerHTML = `
            <div class="crew-image" style="background-image: url('${photoUrl}');"></div>
            <p class="crew-name">${crewMember.name}</p>
            <p class="crew-role">${crewMember.role}</p>
        `;
            crewSlider.appendChild(crewCard);
        });
    }


    function initializeSliders() {
        if ($('.actors-slider').children().length > 0 && !$('.actors-slider').hasClass('slick-initialized') && !$('.actors-slider').find('.unknown-message').length) {
            $('.actors-slider').slick({
                slidesToShow: 6,
                slidesToScroll: 1,
                autoplay: false,
                dots: false,
                infinite: true,
                responsive: [
                    {
                        breakpoint: 1024,
                        settings: {
                            slidesToShow: 4
                        }
                    },
                    {
                        breakpoint: 768,
                        settings: {
                            slidesToShow: 3
                        }
                    },
                    {
                        breakpoint: 480,
                        settings: {
                            slidesToShow: 2
                        }
                    }
                ]
            });

            $('.actors-nav .next-arrow').on('click', function() {
                $('.actors-slider').slick('slickNext');
            });

            $('.actors-nav .prev-arrow').on('click', function() {
                $('.actors-slider').slick('slickPrev');
            });
        }

        if ($('.crew-slider').children().length > 0 && !$('.crew-slider').hasClass('slick-initialized') && !$('.crew-slider').find('.unknown-message').length) {
            $('.crew-slider').slick({
                slidesToShow: 6,
                slidesToScroll: 1,
                autoplay: false,
                dots: false,
                infinite: true,
                responsive: [
                    {
                        breakpoint: 1024,
                        settings: {
                            slidesToShow: 4
                        }
                    },
                    {
                        breakpoint: 768,
                        settings: {
                            slidesToShow: 3
                        }
                    },
                    {
                        breakpoint: 480,
                        settings: {
                            slidesToShow: 2
                        }
                    }
                ]
            });

            //eventhandlers per frecce come per attori
            $('.crew-nav .next-arrow').on('click', function() {
                $('.crew-slider').slick('slickNext');
            });

            $('.crew-nav .prev-arrow').on('click', function() {
                $('.crew-slider').slick('slickPrev');
            });
        }
    }
});