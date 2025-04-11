var express = require('express');
const axios = require('axios');
var router = express.Router();

//pagina movies
router.get('/', async function(req, res, next) {
    try {
        const response = await axios.get("http://localhost:8080/api/movies");
        let movies = getMock();

        res.render('movies', {
            movies: movies,
            selectedGenre: req.query.genre  //filtro per genere passato eventualmente dalla home o movie
        });

    } catch (error) {return res.status(500).json({ message: "Errore nel recupero dei film" });}
});

function getMock(){
    return [{
            id: 1,
            name: "The Shawshank Redemption",
            description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
            genres: "Drama",
            rating: 9.3,
            poster: "/images/shawshank.jpg",
            releaseDate: new Date("1994-09-23")
        },
        {
            id: 2,
            name: "The Godfather",
            description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
            genres: "Crime, Drama",
            rating: 9.2,
            poster: "/images/godfather.jpg",
            releaseDate: new Date("1972-03-24")
        },
        {
            id: 3,
            name: "The Dark Knight",
            description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
            genres: "Action, Crime, Drama",
            rating: 9.0,
            poster: "/images/darkknight.jpg",
            releaseDate: new Date("2008-07-18")
        },
        {
            id: 4,
            name: "Pulp Fiction",
            description: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
            genres: "Crime, Drama",
            rating: 8.9,
            poster: "/images/pulpfiction.jpg",
            releaseDate: new Date("1994-10-14")
        },
        {
            id: 5,
            name: "Fight Club",
            description: "An insomniac office worker and a devil-may-care soapmaker form an underground fight club that evolves into something much, much more.",
            genres: "Drama",
            rating: 8.8,
            poster: "/images/fightclub.jpg",
            releaseDate: new Date("1999-10-15")
        },
        {
            id: 6,
            name: "Inception",
            description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
            genres: "Action, Adventure, Science Fiction",
            rating: 8.8,
            poster: "/images/inception.jpg",
            releaseDate: new Date("2010-07-16")
        },
        {
            id: 7,
            name: "The Matrix",
            description: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
            genres: "Action, Science Fiction",
            rating: 8.7,
            poster: "/images/matrix.jpg",
            releaseDate: new Date("1999-03-31")
        },
        {
            id: 8,
            name: "Goodfellas",
            description: "The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners Jimmy Conway and Tommy DeVito in the Italian-American crime syndicate.",
            genres: "Biography, Crime, Drama",
            rating: 8.7,
            poster: "/images/goodfellas.jpg",
            releaseDate: new Date("1990-09-19")
        },
        {
            id: 9,
            name: "The Silence of the Lambs",
            description: "A young F.B.I. cadet must receive the help of an incarcerated and manipulative cannibal killer to help catch another serial killer.",
            genres: "Crime, Drama, Thriller",
            rating: 8.6,
            poster: "/images/silence.jpg",
            releaseDate: new Date("1991-02-14")
        },
        {
            id: 10,
            name: "Interstellar",
            description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
            genres: "Adventure, Drama, Science Fiction",
            rating: 8.6,
            poster: "/images/interstellar.jpg",
            releaseDate: new Date("2014-11-07")
        },
        {
            id: 11,
            name: "Parasite",
            description: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
            genres: "Comedy, Drama, Thriller",
            rating: 8.6,
            poster: "/images/parasite.jpg",
            releaseDate: new Date("2019-05-21")
        },
        {
            id: 12,
            name: "The Lion King",
            description: "Lion prince Simba and his father are targeted by his bitter uncle, who wants to ascend the throne himself.",
            genres: "Animation, Adventure, Drama",
            rating: 8.5,
            poster: "/images/lionking.jpg",
            releaseDate: new Date("1994-06-15")
        },
        {
            id: 13,
            name: "Gladiator",
            description: "A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.",
            genres: "Action, Adventure, Drama",
            rating: 8.5,
            poster: "/images/gladiator.jpg",
            releaseDate: new Date("2000-05-05")
        },
        {
            id: 14,
            name: "The Departed",
            description: "An undercover cop and a mole in the police attempt to identify each other while infiltrating an Irish gang in South Boston.",
            genres: "Crime, Drama, Thriller",
            rating: 8.5,
            poster: "/images/departed.jpg",
            releaseDate: new Date("2006-10-06")
        },
        {
            id: 15,
            name: "The Prestige",
            description: "After a tragic accident, two stage magicians engage in a battle to create the ultimate illusion while sacrificing everything they have to outwit each other.",
            genres: "Drama, Mystery, Thriller",
            rating: 8.5,
            poster: "/images/prestige.jpg",
            releaseDate: new Date("2006-10-20")
        },
        {
            id: 16,
            name: "Whiplash",
            description: "A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student's potential.",
            genres: "Drama, Music",
            rating: 8.5,
            poster: "/images/whiplash.jpg",
            releaseDate: new Date("2014-10-10")
        },
        {
            id: 17,
            name: "Joker",
            description: "In Gotham City, mentally troubled comedian Arthur Fleck is disregarded and mistreated by society. He then embarks on a downward spiral of revolution and bloody crime.",
            genres: "Crime, Drama, Thriller",
            rating: 8.4,
            poster: "/images/joker.jpg",
            releaseDate: new Date("2019-10-04")
        },
        {
            id: 18,
            name: "Toy Story",
            description: "A cowboy doll is profoundly threatened and jealous when a new spaceman figure supplants him as top toy in a boy's room.",
            genres: "Animation, Adventure, Comedy",
            rating: 8.3,
            poster: "/images/toystory.jpg",
            releaseDate: new Date("1995-11-22")
        },
        {
            id: 19,
            name: "The Social Network",
            description: "As Harvard student Mark Zuckerberg creates the social networking site that would become known as Facebook, he is sued by the twins who claimed he stole their idea.",
            genres: "Biography, Drama",
            rating: 7.7,
            poster: "/images/socialnetwork.jpg",
            releaseDate: new Date("2010-10-01")
        },
        {
            id: 20,
            name: "La La Land",
            description: "While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future.",
            genres: "Comedy, Drama, Music",
            rating: 8.0,
            poster: "/images/lalaland.jpg",
            releaseDate: new Date("2016-12-09")
        }
    ];
}

//route per pagina del singolo film
router.get('/:id', async function(req, res, next) {
    const movieId = req.params.id;
    let responseMovie, responseActors, responseCrew;

    try {
        responseMovie = await  axios.get("http://localhost:8080/api/movies/"+encodeURIComponent(movieId.replace(":",""))); // se non lo trova catch per errore 404

        responseActors = await  axios.get("http://localhost:8080/api/actors/movie/"+encodeURIComponent(movieId.replace(":","")));
        responseCrew =  await  axios.get("http://localhost:8080/api/crews/"+encodeURIComponent(movieId.replace(":","")));

        res.render("movie", {
            title: "Movie: "+responseMovie.data.name,
            movie: responseMovie.data ,//passa oggetti alla view, actors e crew non .data perche possono essere null e quinid mostrare messaggio unknown
            actors: responseActors,
            crew: responseCrew
        });

        } catch (error) {
        if (error.response && error.response.status === 404)
            return res.render('NotFound', { title: 'Film non trovato', message: 'Film non trovato! Torna alla home page.' });
        res.status(500).json({ message: "Errore nel recupero del film" })
        }
});
module.exports = router;