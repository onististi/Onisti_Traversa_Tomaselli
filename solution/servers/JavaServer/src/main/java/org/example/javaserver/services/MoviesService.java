package org.example.javaserver.services;
import jakarta.transaction.Transactional;
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
public class MoviesService {
    @Autowired
   private EntityManager entityManager;

    @Transactional
    public Optional<Movie> findMovieById(Integer id) {
        System.out.println("ricevuta richiesta per id"+id);
        // Movie movie = entityManager.find(Movie.class, id);
        String jpql = "SELECT m FROM Movie m WHERE m.id = :id";
        TypedQuery<Movie> query = entityManager.createQuery(jpql, Movie.class);
        query.setParameter("id",1000022 );
        List<Movie> movies = query.getResultList();

        return Optional.ofNullable(movies.get(0));
    }

    @Transactional
    public boolean existsById(Integer id) {
       Movie movie = entityManager.find(Movie.class, id);
        return movie != null;
    }
}