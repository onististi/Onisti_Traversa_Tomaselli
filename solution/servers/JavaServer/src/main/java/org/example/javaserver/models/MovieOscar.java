package org.example.javaserver.models;

import jakarta.persistence.*;

@Entity
@Table(name = "movie_oscars")
public class MovieOscar {

    @Id
    @Column(name = "movie_id")
    private Integer movieId;

    @Column(name = "movie_title")
    private String movieTitle;

    @Column(name = "year_ceremony")
    private Integer yearCeremony;

    @Column(name = "category")
    private String category;

    @Column(name = "person_name")
    private String personName;

    @Column(name = "winner")
    private Boolean winner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_id", insertable = false, updatable = false)
    private Movie movie;

    public boolean getWinner() {
        return winner;
    }

    public Integer getYearCeremony() {
        return yearCeremony;
    }
}
