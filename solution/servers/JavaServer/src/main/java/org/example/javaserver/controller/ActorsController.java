package org.example.javaserver.controller;
import org.example.javaserver.models.Actor;
import org.example.javaserver.models.ActorMovie;
import org.example.javaserver.models.OscarAwards;
import org.example.javaserver.services.ActorsService;
import org.example.javaserver.services.MoviesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
@RequestMapping("/api/actors")
public class ActorsController {

    private final ActorsService actorsService;
    private final MoviesService moviesService;
    private static final Pattern unsafeChars = Pattern.compile("[^a-zA-Z0-9\\-_.~]");

    @Autowired
    public ActorsController(ActorsService actorsService) {
        this.actorsService = actorsService; this.moviesService = new MoviesService();}

    @GetMapping("") //controller per  index actors, restituzione 500 top actors
    public ResponseEntity<List<Actor>> getAllActors() {
        List<Actor> actors = actorsService.getAllActorsWithGenresAndCount();
        return ResponseEntity.ok(actors);
    }

    @GetMapping("/{name}") //pagina actor singolo restituzione solo un actor, opzionale per restituire 404 e gestire errore
    public ResponseEntity<Actor> searchActor(@PathVariable String name) {
        Optional<Actor> actor = actorsService.findActor(name);
        return actor.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/actor/{id}") //ricerca actor per id usato per la chat su un attore, la ricerca normalmente avviene su nome-> lavora su actor_summaries
    public ResponseEntity<Actor> searchActor(@PathVariable Integer id) {
        Optional<Actor> actor = actorsService.findActor(id);
        return actor.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/movie/{id}") //attori del film
    public ResponseEntity<List<Actor>> getActorsByMovie(@PathVariable Integer id) {
        Optional<List<Actor>> actors = actorsService.findActorsByMovie(id);
        return actors.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{name}/movies") //pagina actor, popolazione filmography
    public ResponseEntity<List<ActorMovie>> getMoviesByActor(
            @PathVariable String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size) {

        Optional<List<ActorMovie>> moviesWithRole = actorsService.findMoviesByActor(name, page, size);
        return moviesWithRole.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{name}/oscars") //oppolazione oscars della pagina actor singolo
    public ResponseEntity<List<OscarAwards>> getOscarsByActor(@PathVariable String name) {
        List<OscarAwards> oscars = actorsService.getOscarsByActor(name);
        return ResponseEntity.ok(oscars);
    }

    @GetMapping("/search") //per searchbar
    public ResponseEntity<List<Actor>> searchActors(@RequestParam String query) {
        List<Actor> actors = actorsService.searchActors(query);
        return ResponseEntity.ok(actors);
    }

}