package org.example.javaserver.models;
import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "crew")
public class Crew {

    @EmbeddedId
    private CrewId id;//chiave primaria composta

    public Crew() {}

    public CrewId getId() {return id;}

    public void setId(CrewId id) {this.id = id;}
}

@Embeddable
class CrewId implements Serializable {
    @Column(name = "id_movie")
    private Integer idMovie;

    @Column(name = "name", length = 255)
    private String name;

    @Column(name = "role", length = 255)
    private String role;

    public CrewId() {}

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CrewId crewId = (CrewId) o;
        return idMovie.equals(crewId.idMovie) && name.equals(crewId.name) && role.equals(crewId.role);
    }

    @Override
    public int hashCode() {return java.util.Objects.hash(idMovie, name, role);}
}
