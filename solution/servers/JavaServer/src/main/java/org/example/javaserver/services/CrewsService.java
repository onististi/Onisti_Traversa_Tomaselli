package org.example.javaserver.services;
import jakarta.transaction.Transactional;
import org.example.javaserver.models.Actor;
import org.example.javaserver.models.Crew;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import java.util.List;
import java.util.Optional;

@Service
public class CrewsService {
    @Autowired
    private EntityManager entityManager;

    @Transactional
    public Optional<List<Crew>> findCrewByMovie(Integer movie_id) {
        String jpql = "SELECT c FROM Crew c WHERE c.id.idMovie = :film_id";

        TypedQuery<Crew> query = entityManager.createQuery(jpql, Crew.class);
        query.setParameter("film_id",movie_id );
        List<Crew> crew = query.getResultList();

        return Optional.of(crew);
    }
}