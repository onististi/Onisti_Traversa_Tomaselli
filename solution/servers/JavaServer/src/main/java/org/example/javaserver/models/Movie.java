package org.example.javaserver.models;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "movies")
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "name", length = 255)
    private String name;

    @Column(name = "year")
    private Integer year;

    @Column(name = "tagline", length = 255)
    private String tagline;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "minute")
    private Integer minute;

    @Column(name = "rating", precision = 4, scale = 2)
    private BigDecimal rating;

    @OneToMany(mappedBy = "movie")
    private List<MovieOscar> movieOscars;

    //i transient non sono presenti nella tabella movies direttamente
    @Transient
    private String posterLink;

    @Transient
    private List<String> genres;

    @Transient
    private List<String> studios;

    @Transient
    private List<String> themes;

    @Transient
    private String language;

    @Transient
    private String dubbing;

    @Transient
    private String releaseInfo;

    @Transient
    private Integer yearCeremony;

    public Integer getId() {return id;}

    public void setId(Integer id) {this.id = id;}

    public String getName() {return name;}

    public void setName(String name) {this.name = name;}

    public Integer getYear() {return year;}

    public void setYear(Integer year) {this.year = year;}

    public String getTagline() {return tagline;}

    public void setTagline(String tagline) {this.tagline = tagline;}

    public String getDescription() {return description;}

    public void setDescription(String description) {this.description = description;}

    public Integer getMinute() {return minute;}

    public void setMinute(Integer minute) {this.minute = minute;}

    public BigDecimal getRating() {return rating;}

    public void setRating(BigDecimal rating) {this.rating = rating;}

    public void setPosterLink(String posterLink) {this.posterLink = posterLink;}

    public String getPosterLink() {return posterLink;}

    public List<String> getGenres() {return genres;}

    public void setGenres(List<String> genres) {this.genres = genres;}

    public List<String> getStudios() {return studios;}

    public void setStudios(List<String> studios) {this.studios = studios;}

    public List<String> getThemes() {return themes;}

    public void setThemes(List<String> themes) {this.themes = themes;}

    public String getLanguage() {return language;}

    public void setLanguage(String language) {this.language = language;}

    public String getDubbing() {return dubbing;}

    public void setDubbing(String dubbing) {this.dubbing = dubbing;}

    public String getReleaseInfo() {return releaseInfo;}

    public void setReleaseInfo(String releaseInfo) {this.releaseInfo = releaseInfo;}

    public Integer getYearCeremony() {
        return yearCeremony;
    }

    public void setYearCeremony(Integer integer) {
        this.yearCeremony = integer;
    }
}