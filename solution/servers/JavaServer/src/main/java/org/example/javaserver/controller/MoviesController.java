package org.example.javaserver.controller;

import org.example.javaserver.models.Movie;
import org.example.javaserver.services.MoviesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin(origins = {"http://localhost:3000"})
@RequestMapping("/api/movies")
@Tag(name = "Movies", description = "Gestione film e contenuti correlati")
public class MoviesController {

    private final MoviesService moviesService;

    @Autowired
    public MoviesController(MoviesService moviesService) {
        this.moviesService = moviesService;
    }

    @GetMapping("")
    @Operation(summary = "Lista film principali", description = "Restituisce 300 film con rating ≥4 ordinati per nome")
    @ApiResponse(responseCode = "200", description = "Lista film")
    public ResponseEntity<List<Movie>> getMovies() {
        List<Movie> movies = moviesService.getMovies();
        return ResponseEntity.ok(movies);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Dettaglio completo film")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Dettaglio film"),
            @ApiResponse(responseCode = "404", description = "Film non trovato")
    })
    public ResponseEntity<Movie> getMovieById(
            @Parameter(description = "ID del film", example = "1000006")
            @PathVariable Integer id) {
        Optional<Movie> movie = moviesService.findMovieById(id);
        return movie.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/latest")
    @Operation(summary = "Ultimi film usciti")
    @ApiResponse(responseCode = "200", description = "20 film più recenti")
    public ResponseEntity<List<Movie>> getLatestMovies() {
        List<Movie> movies = moviesService.findLatestMovies(20);
        return ResponseEntity.ok(movies);
    }

    @GetMapping("/top-rated")
    @Operation(summary = "Film meglio valutati")
    @ApiResponse(responseCode = "200", description = "20 film top rated")
    public ResponseEntity<List<Movie>> getTopRatedMovies() {
        List<Movie> movies = moviesService.findTopRatedMovies(20);
        return ResponseEntity.ok(movies);
    }

    @GetMapping("/oscars-winners")
    @Operation(summary = "Vincitori Oscar")
    @ApiResponse(responseCode = "200", description = "20 vincitori recenti")
    public ResponseEntity<List<Movie>> getOscarWinners() {
        List<Movie> movies = moviesService.getOscarWinners(20);
        return ResponseEntity.ok(movies);
    }

    @GetMapping("/search")
    @Operation(summary = "Ricerca film")
    @ApiResponse(responseCode = "200", description = "Risultati ricerca")
    public ResponseEntity<List<Movie>> searchMovies(
            @Parameter(description = "Termine di ricerca", example = "Inception")
            @RequestParam String query) {
        List<Movie> movies = moviesService.searchMovies(query);
        return ResponseEntity.ok(movies);
    }
}