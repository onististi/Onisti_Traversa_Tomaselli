package org.example.javaserver.controller;
import org.example.javaserver.models.Actor;
import org.example.javaserver.models.Movie;
import org.example.javaserver.services.ActorsService;
import org.example.javaserver.services.MoviesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/actors")
public class ActorsController {

    private final ActorsService actorsService;

    @Autowired
    public ActorsController(ActorsService actorsService) {
        this.actorsService = actorsService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Actor> getActorById(@PathVariable Integer id) {
        Optional<Actor> movie = actorsService.findActorById(id);
        return movie.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/movie/{id}")
    public ResponseEntity<List<Actor>> getActorsByMovie(@PathVariable Integer id) {
        Optional<List<Actor>> actors = actorsService.findActorsByMovie(id);
        return actors.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
}