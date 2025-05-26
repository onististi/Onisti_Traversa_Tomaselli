package org.example.javaserver.controller;
import org.example.javaserver.models.Crew;
import org.example.javaserver.models.Movie;
import org.example.javaserver.services.CrewsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin(origins = {"http://localhost:3000"})
@RequestMapping("/api/crews")
public class CrewsController {

    private final CrewsService crewsService;

    @Autowired
    public CrewsController(CrewsService crewsService) {
        this.crewsService = crewsService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<List<Crew>> getMovieById(@PathVariable Integer id) {
        Optional<List<Crew>> crew = crewsService.findCrewByMovie(id);
        return crew.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

}