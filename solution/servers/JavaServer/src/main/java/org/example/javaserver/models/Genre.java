package org.example.javaserver.models;
import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "genres")
public class Genre {

    @EmbeddedId
    private GenreId id;

    public GenreId getId() {
        return id;
    }

    public void setId(GenreId id) {
        this.id = id;
    }

    public String getGenre() {return id.getGenre();}

    @Embeddable
    public static class GenreId implements Serializable {

        @Column(name = "id_movie")
        private Integer idMovie;

        @Column(name = "genre", length = 255)
        private String genre;

        public Integer getIdMovie() {
            return idMovie;
        }

        public void setIdMovie(Integer idMovie) {
            this.idMovie = idMovie;
        }

        public String getGenre() {return genre;}

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            GenreId genreId = (GenreId) o;
            return idMovie.equals(genreId.idMovie);
        }

        @Override
        public int hashCode() {
            return Objects.hash(idMovie, genre);
        }
    }
}