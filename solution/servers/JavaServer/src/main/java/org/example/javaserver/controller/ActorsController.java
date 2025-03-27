package org.example.javaserver.controller;
import org.example.javaserver.models.Actor;
import org.example.javaserver.models.ActorMovie;
import org.example.javaserver.models.Movie;
import org.example.javaserver.services.ActorsService;
import org.example.javaserver.services.MoviesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/actors")
public class ActorsController {

    private final ActorsService actorsService;
    private final MoviesService moviesService;

    @Autowired
    public ActorsController(ActorsService actorsService) {
        this.actorsService = actorsService; this.moviesService = new MoviesService();}

    @GetMapping("/{name}")  //films dell attore
    public ResponseEntity<Actor> searchActor(@PathVariable String name) {
        Optional<Actor> actor = actorsService.findActor(name);
        return actor.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/movie/{id}") //attori del film
    public ResponseEntity<List<Actor>> getActorsByMovie(@PathVariable Integer id) {
        Optional<List<Actor>> actors = actorsService.findActorsByMovie(id);
        return actors.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{name}/movies")  //films dell attore
    public ResponseEntity<List<ActorMovie>> getMoviesByActor(@PathVariable String name) {
        Optional<List<ActorMovie>> moviesWithRole = actorsService.findMoviesByActor(name);
        return moviesWithRole.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
}