package org.example.javaserver.models;
import jakarta.persistence.*;
import java.math.BigDecimal;

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

    //campo non presente nella tabella "movies"
    @Transient
    private String posterLink;

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
}