package org.example.javaserver.models;

public class ActorMovie {
    private Movie movie;
    private String role;

    public ActorMovie(Movie movie, String role) {
        this.movie = movie;
        this.role = role;
    }

    public Movie getMovie() {
        return movie;
    }

    public void setMovie(Movie movie) {
        this.movie = movie;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}

