package org.example.javaserver.services;
import jakarta.transaction.Transactional;
import org.example.javaserver.models.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityManager;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MoviesService {
    @Autowired
    private EntityManager entityManager;

    @Transactional
    public Optional<Movie> findMovieById(Integer id) {
        Movie movie = entityManager.find(Movie.class, id);
        if (movie == null)
            return Optional.empty();


        String posterQuery = "SELECT p.id.link FROM Poster p WHERE p.id.idMovie = :movieId";
        List<String> posterLinks = entityManager.createQuery(posterQuery, String.class)
                .setParameter("movieId", id)
                .getResultList();

        if (!posterLinks.isEmpty())
            movie.setPosterLink(posterLinks.get(0));
         else
             movie.setPosterLink(null);


        List<Genre> genreEntities = entityManager.createQuery(
                        "SELECT g FROM Genre g WHERE g.id.idMovie = :movieId", Genre.class)
                .setParameter("movieId", id)
                .getResultList();

        List<String> genres = genreEntities.stream()
                .map(Genre::getGenre)
                .toList();
        movie.setGenres(genres);


        List<Studio> studioEntities = entityManager.createQuery(
                        "SELECT s FROM Studio s WHERE s.id.idMovie = :movieId", Studio.class)
                .setParameter("movieId", id)
                .getResultList();

       List<String> studios = studioEntities.stream()
                .map(Studio::getStudio)
                .toList();
       movie.setStudios(studios);

        List<Theme> themeEntities = entityManager.createQuery(
                        "SELECT t FROM Theme t WHERE t.id.idMovie = :movieId", Theme.class)
                .setParameter("movieId", id)
                .getResultList();

        List<String> themes = themeEntities.stream()
                .map(Theme::getTheme)
                .toList();
        movie.setThemes(themes);

        List<Language> originalLanguageEntities = entityManager.createQuery(
                        "SELECT l FROM Language l WHERE l.id.idMovie = :movieId AND l.id.type = 'Language' OR l.id.type = 'Primary Language'", Language.class)
                .setParameter("movieId", id)
                .getResultList();

        if (!originalLanguageEntities.isEmpty()) {
            List<String> languages = originalLanguageEntities.stream()
                    .map(Language::getLanguage)
                    .toList();
            movie.setLanguage(String.join(", ", languages));
        } else {
            movie.setLanguage("Unknown");
        }

        List<Language> dubbedLanguageEntities = entityManager.createQuery(
                        "SELECT l FROM Language l WHERE l.id.idMovie = :movieId AND l.id.type = 'Spoken Language'", Language.class)
                .setParameter("movieId", id)
                .getResultList();

        if (!dubbedLanguageEntities.isEmpty()) {
            List<String> dubbedLanguages = dubbedLanguageEntities.stream()
                    .map(Language::getLanguage)
                    .toList();
            movie.setDubbing(String.join(", ", dubbedLanguages));
        } else {
            movie.setDubbing("None");
        }

        List<Release> releaseEntities = entityManager.createQuery(
                        "SELECT r FROM Release r WHERE r.id.idMovie = :movieId", Release.class)
                .setParameter("movieId", id)
                .getResultList();

        List<String> releaseInfos = new ArrayList<>();
        SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");

        for (Release release : releaseEntities) {
            String country = release.getCountry();
            String formattedDate = release.getReleaseDate() != null ? dateFormat.format(release.getReleaseDate()) : "unknown date";
            String type = release.getType() != null ? release.getType() : "";
            String rating = release.getRating() != null ? release.getRating() : "unknown rating";

            releaseInfos.add(country + " in " + formattedDate + (type.isEmpty() ? "" : " (" + type + ")")+"["+rating+"]");
        }

        movie.setReleaseInfo(String.join(", ", releaseInfos));

        return Optional.of(movie);
    }

    @Transactional
    public List<Movie> findLatestMovies(int limit) {
        String query = "SELECT m FROM Movie m ORDER BY m.year DESC, m.id DESC";
        List<Movie> movies = entityManager.createQuery(query, Movie.class)
                .setMaxResults(limit)
                .getResultList();

        List<Movie> enrichedMovies = new ArrayList<>();
        for (Movie movie : movies) {
            Optional<Movie> enrichedMovie = findMovieById(movie.getId());
            if (enrichedMovie.isPresent()) {
                enrichedMovies.add(enrichedMovie.get());
            }
        }

        return enrichedMovies;
    }

    @Transactional
    public List<Movie> findTopRatedMovies(int limit) {

        String query = "SELECT m FROM Movie m WHERE m.rating IS NOT NULL ORDER BY m.rating DESC, m.year DESC";
        List<Movie> movies = entityManager.createQuery(query, Movie.class)
                .setMaxResults(limit)
                .getResultList();

        List<Movie> enrichedMovies = new ArrayList<>();
        for (Movie movie : movies) {
            Optional<Movie> enrichedMovie = findMovieById(movie.getId());
            if (enrichedMovie.isPresent()) {
                enrichedMovies.add(enrichedMovie.get());
            }
        }

        return enrichedMovies;
    }
}