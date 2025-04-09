package org.example.javaserver.models;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "actors")
public class Actor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "id_movie")
    private Integer id_movie;

    @Column(name = "name", length = 255)
    private String name;

    @Column(name = "role", length = 255)
    private String role;

    // Campi transient per i dati aggiuntivi
    @Transient
    private Integer movies_count;

    @Transient
    private BigDecimal avg_rating;

    @Transient
    private List<String> genres;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getId_movie() {
        return id_movie;
    }

    public void setId_movie(Integer id_movie) {
        this.id_movie = id_movie;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Integer getMovies_count() {
        return movies_count;
    }

    public void setMovies_count(Integer movies_count) {
        this.movies_count = movies_count;
    }

    public List<String> getGenres() {
        return genres;
    }

    public BigDecimal getAvg_rating() {
        return avg_rating;
    }

    public void setAvg_rating(BigDecimal avg_rating) {
        this.avg_rating = avg_rating;
    }

    public void setGenres(List<String> genres) {
        this.genres = genres;
    }
}