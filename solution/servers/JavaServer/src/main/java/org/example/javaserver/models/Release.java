package org.example.javaserver.models;
import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Date;
import java.util.Objects;

@Entity
@Table(name = "releases")
public class Release {

    @EmbeddedId
    private ReleaseId id;

    @Column(name = "rating", length = 10)
    private String rating;

    public ReleaseId getId() {
        return id;
    }

    public void setId(ReleaseId id) {
        this.id = id;
    }

    public String getCountry() {
        return id.country;
    }

    public Date getReleaseDate() {
        return id.releaseDate;
    }

    public String getType() {
        return id.type;
    }

    public String getRating() {
        return rating;
    }

    public void setRating(String rating) {this.rating = rating;}

    @Embeddable
    public static class ReleaseId implements Serializable {

        @Column(name = "id_movie")
        private Integer idMovie;

        @Column(name = "country", length = 255)
        private String country;

        @Column(name = "release_date")
        @Temporal(TemporalType.DATE)
        private Date releaseDate;

        @Column(name = "type", length = 255)
        private String type;

        public String getCountry() {return country;}

        public void setCountry(String country) {this.country = country;}

        public Date getReleaseDate() {return releaseDate;}

        public void setReleaseDate(Date releaseDate) {this.releaseDate = releaseDate;}

        public String getType() {return type;}

        public void setType(String type) {this.type = type;}

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
            ReleaseId that = (ReleaseId) o;
            return idMovie.equals(that.idMovie);
        }

        @Override
        public int hashCode() {
            return Objects.hash(idMovie, releaseDate, country, type);
        }
    }
}