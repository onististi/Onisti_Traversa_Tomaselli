var express = require('express');
const axios = require('axios');
var router = express.Router();

router.get('/', async function(req, res, next) {
    try {
        //const oscarsResponse = await axios.get("http://localhost:8080/api/movies/oscars-winners");
        //const latestResponse = await axios.get("http://localhost:8080/api/movies/latest");
        //const topRatedResponse = await axios.get("http://localhost:8080/api/movies/top-rated");

        //dati di prova per testare grafica
           let oscarWinners= [
                {
                    title: "Oppenheimer",
                    description: "La storia di J. Robert Oppenheimer e lo sviluppo della bomba atomica.",
                    oscarWon: "Miglior Film 2024",
                    poster: "/images/oppenheimer.jpg"
                },
                {
                    title: "Povere Creature!",
                    description: "Una giovane donna riportata in vita da uno scienziato vive una straordinaria avventura.",
                    oscarWon: "Miglior Attrice 2024",
                    poster: "https://a.ltrbxd.com/resized/film-poster/4/7/5/8/6/47586-legally-blonde-0-230-0-345-crop.jpg?v=683a318854"
                },
                {
                    title: "The Zone of Interest",
                    description: "La vita familiare del comandante di Auschwitz, Rudolf Höss, e sua moglie Hedwig.",
                    oscarWon: "Miglior Film Internazionale 2024",
                    poster: "/images/zone-interest.jpg"
                },
                {
                    title: "Anatomia di una caduta",
                    description: "Una donna è sospettata della morte del marito dopo che viene trovato morto nella loro casa sulle Alpi.",
                    oscarWon: "Miglior Sceneggiatura Originale 2024",
                    poster: "/images/anatomy.jpg"
                },
               {
                   title: "Povere Creature!2",
                   description: "22Una giovane donna riportata in vita da uno scienziato vive una straordinaria avventura.",
                   oscarWon: "2Miglior Attrice 2024",
                   poster: "https://a.ltrbxd.com/resized/film-poster/4/7/5/8/6/47586-legally-blonde-0-230-0-345-crop.jpg?v=683a318854"
               },
                {
                    title: "American Fiction",
                    description: "Uno scrittore frustrato trova successo con un romanzo satirico sulla vita afroamericana.",
                    oscarWon: "Miglior Sceneggiatura Adattata 2024",
                    poster: "/images/american-fiction.jpg"
                }
            ];
           let latestMovies =  [
                {
                    title: "Dune: Parte Due",
                    description: "Paul Atreides si unisce ai Fremen e inizia un viaggio spirituale e bellico.",
                    releaseDate: "28 Febbraio 2024",
                    poster: "/images/dune2.jpg"
                },
               {
                   title: "Povere Creature!",
                   description: "Una giovane donna riportata in vita da uno scienziato vive una straordinaria avventura.",
                   oscarWon: "Miglior Attrice 2024",
                   poster: "https://a.ltrbxd.com/resized/film-poster/4/7/5/8/6/47586-legally-blonde-0-230-0-345-crop.jpg?v=683a318854"
               },
               {
                   title: "Povere Creature!",
                   description: "Una giovane donna riportata in vita da uno scienziato vive una straordinaria avventura.",
                   oscarWon: "Miglior Attrice 2024",
                   poster: "https://a.ltrbxd.com/resized/film-poster/4/7/5/8/6/47586-legally-blonde-0-230-0-345-crop.jpg?v=683a318854"
               },
                {
                    title: "Challengers",
                    description: "Un triangolo amoroso tra tennisti professionisti con un passato comune.",
                    releaseDate: "24 Aprile 2024",
                    poster: "/images/challengers.jpg"
                },
                {
                    title: "Civil War",
                    description: "In un'America futura, un gruppo di giornalisti viaggia attraverso un paese diviso dalla guerra civile.",
                    releaseDate: "18 Aprile 2024",
                    poster: "/images/civil-war.jpg"
                },
                {
                    title: "The Fall Guy",
                    description: "Uno stuntman è coinvolto in una cospirazione durante le riprese di un film d'azione.",
                    releaseDate: "1 Maggio 2024",
                    poster: "/images/fall-guy.jpg"
                },
                {
                    title: "Kingdom of the Planet of the Apes",
                    description: "Generazioni dopo il regno di Cesare, un nuovo leader scimmia emerge.",
                    releaseDate: "10 Maggio 2024",
                    poster: "/images/planet-apes.jpg"
                }
            ];
           let  topRatedMovies =  [
                {
                    title: "The Godfather",
                    description: "Il patriarca anziano di una dinastia del crimine organizzato trasferisce il controllo della sua impero al figlio.",
                    rating: "9.2",
                    poster: "/images/godfather.jpg"
                },
               {
                   title: "Povere Creature!",
                   description: "Una giovane donna riportata in vita da uno scienziato vive una straordinaria avventura.",
                   oscarWon: "Miglior Attrice 2024",
                   poster: "https://a.ltrbxd.com/resized/film-poster/4/7/5/8/6/47586-legally-blonde-0-230-0-345-crop.jpg?v=683a318854"
               },
                {
                    title: "Pulp Fiction",
                    description: "Le vite di due sicari, un pugile, la moglie di un gangster e una coppia di rapinatori si intrecciano.",
                    rating: "8.9",
                    poster: "/images/pulp-fiction.jpg"
                },
                {
                    title: "Parasite",
                    description: "Una famiglia povera escogita un piano per lavorare al servizio di una famiglia ricca.",
                    rating: "8.5",
                    poster: "/images/parasite.jpg"
                },
                {
                    title: "Il Signore degli Anelli",
                    description: "Un giovane hobbit e i suoi amici intraprendono un viaggio per distruggere un anello potente.",
                    rating: "8.8",
                    poster: "/images/lotr.jpg"
                },
                {
                    title: "Inception",
                    description: "Un ladro che ruba segreti aziendali attraverso l'uso della tecnologia di condivisione dei sogni.",
                    rating: "8.7",
                    poster: "/images/inception.jpg"
                }
            ];
           let topChats =  [
                {
                    username: "CinemaLover",
                    message: "Oppenheimer è un capolavoro assoluto! Nolan ha superato se stesso.",
                    movie: "Oppenheimer",
                    userAvatar: "/images/user1.jpg"
                },
               {
                   title: "Povere Creature!",
                   description: "Una giovane donna riportata in vita da uno scienziato vive una straordinaria avventura.",
                   oscarWon: "Miglior Attrice 2024",
                   poster: "https://a.ltrbxd.com/resized/film-poster/4/7/5/8/6/47586-legally-blonde-0-230-0-345-crop.jpg?v=683a318854"
               },
                {
                    username: "FilmCritic22",
                    message: "Povere Creature è uno dei film più originali che abbia mai visto. Emma Stone merita ogni premio!",
                    movie: "Povere Creature!",
                    userAvatar: "/images/user2.jpg"
                },
                {
                    username: "MovieBuff",
                    message: "Dune: Parte Due è visivamente spettacolare, ma il ritmo è troppo lento in alcuni punti.",
                    movie: "Dune: Parte Due",
                    userAvatar: "/images/user3.jpg"
                }
            ];

        res.render("index", {
            title: "Cineflix",
            oscarsWinners: oscarWinners,
            latestMovies: latestMovies,
            topRatedMovies: topRatedMovies,
            topChats : topChats
        });

    } catch (error) {res.status(500).json({ message: "Errore nel recupero del film" })}
});

module.exports = router;
