package org.example.javaserver.models;

import jakarta.persistence.*;

@Entity
@Table(name = "oscar_awards")
public class OscarAwards {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "year_film")
    private Integer yearFilm;

    @Column(name = "year_ceremony")
    private Integer yearCeremony;

    @Column(name = "category")
    private String category;

    @Column(name = "name")
    private String personName;

    @Column(name = "film")
    private String film;

    @Column(name = "winner")
    private Boolean winner;

    public Integer getId() {
        return id;
    }

    public Integer getYearFilm() {
        return yearFilm;
    }

    public Integer getYearCeremony() {
        return yearCeremony;
    }

    public String getCategory() {
        return category;
    }

    public String getPersonName() {
        return personName;
    }

    public String getFilm() {
        return film;
    }

    public Boolean getWinner() {
        return winner;
    }
}
