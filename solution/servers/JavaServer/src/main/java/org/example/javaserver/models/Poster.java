package org.example.javaserver.models;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "posters")
public class Poster {

    @EmbeddedId
    private PosterId id;//chiave primaria composta

    public Poster() {}

    public PosterId getId() {return id;}

    public void setId(PosterId id) {this.id = id;}
}

@Embeddable
class PosterId implements Serializable {
    @Column(name = "id_movie")
    private Integer idMovie;

    @Column(name = "link", columnDefinition = "TEXT")
    private String link;

    public PosterId() {}

    public Integer getIdMovie() {return idMovie;}

    public void setIdMovie(Integer idMovie) {this.idMovie = idMovie;}

    public String getLink() {return link;}

    public void setLink(String link) {this.link = link;}

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PosterId posterId = (PosterId) o;
        return Objects.equals(idMovie, posterId.idMovie) && Objects.equals(link, posterId.link);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idMovie, link);
    }
}
