$(document).ready(function(){
    $('.oscar-movie-slider').slick({
        slidesToShow: 5,
        slidesToScroll: 1,
        arrows: false,
        dots: false,
        infinite: true,
        autoplay: false,
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

    $('.top-movie-slider').slick({
        slidesToShow: 5,
        slidesToScroll: 1,
        arrows: false,
        dots: false,
        infinite: true,
        autoplay: false,
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

    $('.latest-movie-slider').slick({
        slidesToShow: 5,
        slidesToScroll: 1,
        arrows: false,
        dots: false,
        infinite: true,
        autoplay: false,
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

    $('.oscar-nav .next-arrow').on('click', function() {
        $('.oscar-movie-slider').slick('slickNext');
    });
    $('.oscar-nav .prev-arrow').on('click', function() {
        $('.oscar-movie-slider').slick('slickPrev');
    });


    $('.latest-nav .next-arrow').on('click', function() {
        $('.latest-movie-slider').slick('slickNext');
    });
    $('.latest-nav .prev-arrow').on('click', function() {
        $('.latest-movie-slider').slick('slickPrev');
    });


    $('.top-nav .next-arrow').on('click', function() {
        $('.top-movie-slider').slick('slickNext');
    });
    $('.top-nav .prev-arrow').on('click', function() {
        $('.top-movie-slider').slick('slickPrev');
    });
});