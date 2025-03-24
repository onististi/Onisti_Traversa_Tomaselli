package org.example.javaserver.services;
import jakarta.transaction.Transactional;
import org.example.javaserver.models.Actor;
import org.example.javaserver.models.Movie;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ActorsService {
    @Autowired
    private EntityManager entityManager;

    @Transactional
    public Optional<Actor> findActorById(Integer actor_id) {
        System.out.println("ricevuta richiesta per attore id"+actor_id);
        Actor actor = entityManager.find(Actor.class, actor_id);

        return Optional.ofNullable(actor);
    }

    @Transactional
    public Optional<List<Actor>> findActorsByMovie(Integer movie_id) {
        //System.out.println("ricevuta richiesta per attore id"+movie_id);
        String jpql = "SELECT a FROM Actor a WHERE a.id_movie = :film_id";

        TypedQuery<Actor> query = entityManager.createQuery(jpql, Actor.class);
        query.setParameter("film_id",movie_id );
        List<Actor> actors = query.getResultList();

        return Optional.ofNullable(actors);
    }
}