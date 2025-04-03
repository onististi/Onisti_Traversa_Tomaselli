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
        List<Movie> movies = List.of(movie);
        return ResponseEntity.ok(movies);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Movie> getMovieById(@PathVariable Integer id) {
        Optional<Movie> movie = moviesService.findMovieById(id);
        return movie.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build()); //404 se non presente
    }

    @GetMapping("/latest")
    public ResponseEntity<List<Movie>> getLatestMovies() {
        List<Movie> movies = moviesService.findLatestMovies(20);
        return ResponseEntity.ok(movies);
    }

    @GetMapping("/top-rated")
    public ResponseEntity<List<Movie>> getTopRatedMovies() {
        List<Movie> movies = moviesService.findTopRatedMovies(20); //limite 20 film
        return ResponseEntity.ok(movies);
    }

    @GetMapping("/oscars-winners")
    public ResponseEntity<List<Movie>> getOscarWinners() {
        List<Movie> movies = moviesService.getOscarWinners(20);
        return ResponseEntity.ok(movies);
    }

}