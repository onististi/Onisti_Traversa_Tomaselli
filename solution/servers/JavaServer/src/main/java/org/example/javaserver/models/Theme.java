package org.example.javaserver.models;
import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "themes")
public class Theme {

    @EmbeddedId
    private ThemeId id;

    public ThemeId getId() {
        return id;
    }

    public void setId(ThemeId id) {
        this.id = id;
    }

    public String getTheme() {return id.getTheme();}


    @Embeddable
    public static class ThemeId implements Serializable {

        @Column(name = "id_movie")
        private Integer idMovie;

        @Column(name = "theme")
        private String theme;

        public Integer getIdMovie() {
            return idMovie;
        }

        public void setIdMovie(Integer idMovie) {
            this.idMovie = idMovie;
        }

        public String getTheme() {return theme;}

        public void setTheme(String theme) {this.theme = theme;}

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            ThemeId themeId = (ThemeId) o;
            return idMovie.equals(themeId.idMovie);
        }

        @Override
        public int hashCode() {return Objects.hash(idMovie, theme);}
    }
}