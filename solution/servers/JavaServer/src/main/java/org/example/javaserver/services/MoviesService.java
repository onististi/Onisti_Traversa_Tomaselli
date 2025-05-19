package org.example.javaserver.services;
import jakarta.transaction.Transactional;
import org.example.javaserver.models.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityManager;
import java.text.SimpleDateFormat;
import java.math.BigDecimal;
import java.util.stream.Collectors;
import java.text.SimpleDateFormat;
import java.util.*;

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

        // Get the most recent Oscar ceremony year if the movie won any Oscar
        String ceremonyQuery = "SELECT MAX(mo.yearCeremony) FROM MovieOscar mo " +
                "WHERE mo.movieId = :movieId AND mo.winner = true";

        Integer ceremonyYear = entityManager.createQuery(ceremonyQuery, Integer.class)
                .setParameter("movieId", id)
                .getSingleResult();

        movie.setYearCeremony(ceremonyYear);

        // Check if the movie has won any Oscars and set a display string
        String oscarQuery = "SELECT COUNT(mo) FROM MovieOscar mo " +
                "WHERE mo.movieId = :movieId AND mo.winner = true";

        Long oscarCount = entityManager.createQuery(oscarQuery, Long.class)
                .setParameter("movieId", id)
                .getSingleResult();

        if (oscarCount > 0) {
            movie.setMovieOscars("Yes - Won " + oscarCount + (oscarCount == 1 ? " Oscar" : " Oscars"));
            if (ceremonyYear != null) {
                movie.setMovieOscars(movie.getMovieOscars() + " (in " + ceremonyYear + ")");
            }
        } else {
            // Check if movie was nominated but didn't win
            String nominationQuery = "SELECT COUNT(mo) FROM MovieOscar mo " +
                    "WHERE mo.movieId = :movieId";

            Long nominationCount = entityManager.createQuery(nominationQuery, Long.class)
                    .setParameter("movieId", id)
                    .getSingleResult();

            if (nominationCount > 0) {
                movie.setMovieOscars("No - Only Nominated");
            } else {
                movie.setMovieOscars("None");
            }
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
    public List<Movie> getMovies() {
        String movieQuery = "SELECT m.id, m.name, m.year, m.minute, m.rating FROM Movie m  WHERE m.rating IS NOT NULL AND m.rating >=    4 ORDER BY m.name LIMIT 300";
        List<Object[]> movieResults =  entityManager.createQuery(movieQuery).getResultList();

        List<Movie> movies = new ArrayList<>();
        List<Integer> movieIds = new ArrayList<>();

        for (Object[] result : movieResults) {   //in "dati separati" perche non serve descrizione e tagline
            Movie movie = new Movie();
            movie.setId((Integer) result[0]);
            movie.setName((String) result[1]);
            movie.setYear((Integer) result[2]);
            movie.setMinute((Integer) result[3]);
            movie.setRating((BigDecimal) result[4]);

            movies.add(movie);
            movieIds.add(movie.getId());
        }

        movies.forEach(movie ->{

            String posterQuery = "SELECT p.id.link FROM Poster p WHERE p.id.idMovie = :movieId";
            List<String> posterLinks = entityManager.createQuery(posterQuery, String.class)
                    .setParameter("movieId", movie.getId())
                    .getResultList();

            if (!posterLinks.isEmpty())
                movie.setPosterLink(posterLinks.get(0));
            else
                movie.setPosterLink(null);


            List<Genre> genreEntities = entityManager.createQuery(
                            "SELECT g FROM Genre g WHERE g.id.idMovie = :movieId", Genre.class)
                    .setParameter("movieId", movie.getId())
                    .getResultList();

            List<String> genres = genreEntities.stream()
                    .map(Genre::getGenre)
                    .toList();
            movie.setGenres(genres);

        });


        return movies;
    }
    //3 query per popolazione pagina home
    @Transactional
    public List<Movie> findLatestMovies(int limit) {
        String query = "SELECT m FROM Movie m WHERE m.year IS NOT NULL ORDER BY m.year DESC";
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


    @Transactional
    public List<Movie> getOscarWinners(int limit) {
        List<Movie> movies = new ArrayList<>();
        int currentLimit = limit;
        int currentYear = 2024;
        Set<String> uniqueMovieTitles = new HashSet<>(); // Per evitare i film duplicati

        while (movies.size() < limit) {
            String query = "SELECT DISTINCT m.id FROM Movie m " +
                    "JOIN m.oscars mo " +
                    "WHERE mo.winner = true AND mo.yearCeremony = :year";

            List<Integer> result = entityManager.createQuery(query, Integer.class)
                    .setParameter("year", currentYear)
                    .setMaxResults(currentLimit)
                    .getResultList();

            for (Integer movieId : result) {
                Optional<Movie> optionalMovie = findMovieById(movieId);
                if (optionalMovie.isPresent()) {
                    Movie movie = optionalMovie.get();

                    if (!uniqueMovieTitles.contains(movie.getName())) {
                        uniqueMovieTitles.add(movie.getName());
                        movies.add(movie);
                        if (movies.size() >= limit) {
                            break;
                        }
                    }
                }
            }

            currentLimit = limit - movies.size();
            currentYear--; // Passa all'anno precedente se non ha caricato limit film
            if (currentYear < 1929) break; // Stoppa al primo anno degli Oscar
        }

        // Ordinamento per anno di cerimonia più recente
        movies.sort(Comparator.comparing(
                Movie::getYearCeremony,
                Comparator.nullsLast(Comparator.reverseOrder()) // Gestione date nulle
        ));

        return movies;
    }


    @Transactional //ricerca da searchbar per movies con titolo simile cercato
    public List<Movie> searchMovies(String query) {
        String movieQuery = "SELECT m FROM Movie m WHERE LOWER(m.name) LIKE LOWER(:query) AND m.rating IS NOT NULL ORDER BY m.rating DESC";
        List<Movie> movies = entityManager.createQuery(movieQuery, Movie.class)
                .setParameter("query", "%" + query + "%")
                .setMaxResults(100)
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