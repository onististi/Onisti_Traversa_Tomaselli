package org.example.javaserver.models;
import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "studios")
public class Studio {

    @EmbeddedId
    private StudioId id;

    public StudioId getId() {
        return id;
    }

    public void setId(StudioId id) {
        this.id = id;
    }

    public String getStudio() {return id.getStudio();}

    @Embeddable
    public static class StudioId implements Serializable {

        @Column(name = "id_movie")
        private Integer idMovie;

        @Column(name = "studio", length = 255)
        private String studio;

        public Integer getIdMovie() {
            return idMovie;
        }

        public void setIdMovie(Integer idMovie) {
            this.idMovie = idMovie;
        }

        public String getStudio() {
            return studio;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            StudioId studioId = (StudioId) o;
            return idMovie.equals(studioId.idMovie);
        }

        @Override
        public int hashCode() {
            return Objects.hash(idMovie, studio);
        }
    }
}