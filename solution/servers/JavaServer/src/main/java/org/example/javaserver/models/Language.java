package org.example.javaserver.models;
import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "languages")
public class Language {

    @EmbeddedId
    private LanguageId id;

    public LanguageId getId() {
        return id;
    }

    public void setId(LanguageId id) {
        this.id = id;
    }

    public String getType() {
        return id.getType();
    }

    public String getLanguage() {
        return id.getLanguage();
    }


    @Embeddable
    public static class LanguageId implements Serializable {

        @Column(name = "id_movie")
        private Integer idMovie;

        @Column(name = "type", length = 255)
        private String type;

        @Column(name = "language", columnDefinition = "text")
        private String language;

        public String getLanguage() {
            return language;
        }

        public String getType() {
            return type;
        }

        public Integer getIdMovie() {
            return idMovie;
        }

        public void setIdMovie(Integer idMovie) {
            this.idMovie = idMovie;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            LanguageId that = (LanguageId) o;
            return idMovie.equals(that.idMovie);
        }

        @Override
        public int hashCode() {
            return Objects.hash(idMovie, type, language);
        }
    }
}