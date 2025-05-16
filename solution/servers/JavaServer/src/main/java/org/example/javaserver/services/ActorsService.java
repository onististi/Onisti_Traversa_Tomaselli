package org.example.javaserver.services;
import jakarta.transaction.Transactional;
import org.example.javaserver.models.Actor;
import org.example.javaserver.models.ActorMovie;
import org.example.javaserver.models.OscarAwards;
import org.example.javaserver.models.Movie;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;

import java.math.BigDecimal;
import java.util.*;

@Service
public class ActorsService {

    @Autowired
    private EntityManager entityManager;

    @Transactional
    public Optional<Actor> findActor(String actor_name) {
        String sql = """
            SELECT
                actor_name AS name,
                movies_count,
                average_rating as avg_rating,
                id
            FROM actor_summaries
            WHERE actor_name = ?
            """;

        try {
            List<Object[]> results = entityManager.createNativeQuery(sql)
                    .setParameter(1, actor_name)
                    .getResultList();

            if (!results.isEmpty()) {
                Object[] row = results.get(0);
                Actor actor = new Actor();
                actor.setName((String) row[0]);
                actor.setMovies_count(((Number) row[1]).intValue());
                actor.setAvg_rating((BigDecimal) row[2]);
                actor.setId( ((Number) row[3]).intValue());
                return Optional.of(actor);
            }

            return Optional.empty();
        } catch (Exception e) {
            // Gestione delle eccezioni (opzionale)
            return Optional.empty();
        }
    }


    @Transactional
    public Optional<Actor> findActor(Integer id_actor) {
        String sql = """
            SELECT
                actor_name AS name,
                movies_count,
                average_rating as avg_rating,
                id
            FROM actor_summaries
            WHERE id = ?
            """;

        try {
            List<Object[]> results = entityManager.createNativeQuery(sql)
                    .setParameter(1, id_actor)
                    .getResultList();

            if (!results.isEmpty()) {
                Object[] row = results.get(0);
                Actor actor = new Actor();
                actor.setName((String) row[0]);
                actor.setMovies_count(((Number) row[1]).intValue());
                actor.setAvg_rating((BigDecimal) row[2]);
                actor.setId( ((Number) row[3]).intValue());
                System.out.println(actor.getName());
                return Optional.of(actor);
            }

            return Optional.empty();
        } catch (Exception e) {
            // Gestione delle eccezioni (opzionale)
            return Optional.empty();
        }
    }


    @Transactional
    public List<Actor> getAllActorsWithGenresAndCount() {
        String sql = """
                SELECT
                    actor_name AS name,
                    movies_count,
                    genres,
                    average_rating as avg_rating
                FROM actor_summaries
                where movies_count > 2
                ORDER BY movies_count DESC, actor_name DESC
                limit 500""";

        List<Object[]> results = entityManager.createNativeQuery(sql).getResultList();

        return results.stream()
                .map(result -> {
                    Actor actor = new Actor();
                    actor.setName((String) result[0]);
                    actor.setMovies_count(((Number) result[1]).intValue());
                    actor.setGenres(Arrays.asList(((String[]) result[2])));
                    actor.setAvg_rating((BigDecimal) result[3]);
                    return actor;
                }).toList();
    } //non puo essere null

    @Transactional
    public Optional<List<Actor>> findActorsByMovie(Integer movie_id) {
        String jpql = "SELECT a FROM Actor a WHERE a.id_movie = :film_id";

        TypedQuery<Actor> query = entityManager.createQuery(jpql, Actor.class);
        query.setParameter("film_id", movie_id);
        List<Actor> actors = query.getResultList();

        return Optional.ofNullable(actors);
    }

    @Transactional
    public Optional<List<ActorMovie>> findMoviesByActor(String actorName, int page, int size) {
        String jpql = """
    
                SELECT m, STRING_AGG(a.role, ' '), p.id.link FROM Actor a
    JOIN Movie m ON a.id_movie = m.id
    JOIN Poster p ON p.id.idMovie = m.id
    WHERE a.name = :name GROUP BY m, p.id.link
    ORDER BY m.year DESC""";

        List<Object[]> results = entityManager.createQuery(jpql, Object[].class)
                .setParameter("name", actorName)
                .setFirstResult(page * size)  // Imposta l'offset per il paging
                .setMaxResults(size)  // Limita il numero di risultati a 8
                .getResultList();

        List<ActorMovie> movieRoles = results.stream()
                .map(result -> {
                    Movie movie = (Movie) result[0];
                    String roles = (String) result[1];
                    movie.setPosterLink((String) result[2]);
                    if (roles == null) roles = "unknown";

                    return new ActorMovie(movie, roles);
                }).toList();

        return movieRoles.isEmpty() ? Optional.empty() : Optional.of(movieRoles);
    }

    @Transactional
    public List<OscarAwards> getOscarsByActor(String actorName) {
        String jpql = """
        SELECT o FROM OscarAwards o
        WHERE LOWER(o.personName) = LOWER(:actorName)
        ORDER BY o.yearCeremony DESC
    """;
        TypedQuery<OscarAwards> query = entityManager.createQuery(jpql, OscarAwards.class);
        query.setParameter("actorName", actorName);
        return query.getResultList();
    }

    @Transactional
    public List<Actor> searchActors(String query) {
        String sql = """
        SELECT actor_name AS name, movies_count, genres, average_rating
        FROM actor_summaries
        WHERE LOWER(actor_name) LIKE LOWER(:query)
         ORDER BY name DESC LIMIT 100""";

        List<Object[]> results = entityManager.createNativeQuery(sql).setParameter("query", "%" + query + "%").getResultList();

        return results.stream()
                .map(result -> {
                    Actor actor = new Actor();
                    actor.setName((String) result[0]);
                    actor.setMovies_count(((Number) result[1]).intValue());
                    actor.setGenres(Arrays.asList(((String[]) result[2])));
                    actor.setAvg_rating((BigDecimal) result[3]);
                    return actor;
                }).toList();
    }

}