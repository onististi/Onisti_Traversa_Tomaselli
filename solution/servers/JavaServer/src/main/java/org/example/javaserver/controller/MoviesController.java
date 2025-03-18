package org.example.javaserver.controller;
import org.example.javaserver.models.Movie;
import org.example.javaserver.services.MoviesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:3000") //per evitare errore CORS importante
@RequestMapping("/api/movies")
public class MoviesController {

    private final MoviesService moviesService;

    @Autowired
    public MoviesController(MoviesService moviesService) {
        this.moviesService = moviesService;
    }

    @GetMapping
    public ResponseEntity<List<Movie>> getAllMovies() {
       // List<Movie> movies = moviesService.findAllMovies();
        //return ResponseEntity.ok(movies);
        Movie movie = new Movie();
        movie.setId(1);
        movie.setName("Inception");
        movie.setYear(2010);
        movie.setTagline("Your mind is the scene of the crime.");
        movie.setDescription("A thief who steals corporate secrets through the use of dream-sharing technology is given the task of planting an idea into the mind of a CEO.");
        movie.setMinute(148);
        movie.setRating(BigDecimal.valueOf(8.88) );

        //film di prova, deve returnare lista tutti i films(per ricerca film e home)
        List<Movie> movies = List.of(movie);
        return ResponseEntity.ok(movies);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Movie> getMovieById(@PathVariable Integer id) {
        Optional<Movie> movie = moviesService.findMovieById(2);
        return movie.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

}