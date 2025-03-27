package org.example.javaserver.services;
import jakarta.transaction.Transactional;
import org.example.javaserver.models.Actor;
import org.example.javaserver.models.ActorMovie;
import org.example.javaserver.models.Movie;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ActorsService {
    @Autowired
    private EntityManager entityManager;

    @Transactional
    public Optional<Actor> findActor(String actor_name) {
        String jpql = "SELECT a FROM Actor a WHERE LOWER(a.name) = LOWER(:name)";
        TypedQuery<Actor> query = entityManager.createQuery(jpql, Actor.class);
        query.setParameter("name", actor_name);

        List<Actor> actors = query.getResultList();
        return actors.isEmpty() ? Optional.empty() : Optional.of(actors.get(0));
    }

    @Transactional
    public Optional<List<Actor>> findActorsByMovie(Integer movie_id) {
        String jpql = "SELECT a FROM Actor a WHERE a.id_movie = :film_id";

        TypedQuery<Actor> query = entityManager.createQuery(jpql, Actor.class);
        query.setParameter("film_id",movie_id );
        List<Actor> actors = query.getResultList();

        return Optional.ofNullable(actors);
    }

    @Transactional
    public Optional<List<ActorMovie>> findMoviesByActor(String actor_name){
        String jpql = """
        SELECT m, STRING_AGG(a.role, ' '), p.id.link FROM Actor a
        JOIN Movie m ON a.id_movie = m.id
        JOIN Poster p ON p.id.idMovie = m.id
        WHERE a.name = :name GROUP BY m, p.id.link""";

        List<Object[]> results = entityManager.createQuery(jpql, Object[].class)
                .setParameter("name", actor_name)
                .getResultList();

        List<ActorMovie> movieRoles = results.stream()
                .map(result -> {
                    Movie movie = (Movie) result[0];
                    String roles = (String) result[1];
                    movie.setPosterLink((String)result[2]);
                    if (roles == null)
                        roles = "unknown";

                    return new ActorMovie(movie, roles);
                }).toList();

        return movieRoles.isEmpty() ? Optional.empty() : Optional.of(movieRoles);
    }
}