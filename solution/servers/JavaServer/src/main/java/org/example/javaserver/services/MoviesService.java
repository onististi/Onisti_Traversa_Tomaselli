package org.example.javaserver.services;
import jakarta.transaction.Transactional;
import org.example.javaserver.models.Movie;
import org.example.javaserver.models.Poster;
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
        System.out.println("ricevuta richiesta per film id " + id);

        Movie movie = entityManager.find(Movie.class, id);

        String posterQuery = "SELECT p.id.link FROM Poster p WHERE p.id.idMovie = :movieId";
        List<String> posterLinks = entityManager.createQuery(posterQuery, String.class)
                .setParameter("movieId", id)
                .getResultList();

        if (!posterLinks.isEmpty() && movie != null)
            movie.setPosterLink(posterLinks.get(0));
        else if(movie != null)
            movie.setPosterLink(null);

        return Optional.ofNullable(movie); //returna null se non presente
    }
}