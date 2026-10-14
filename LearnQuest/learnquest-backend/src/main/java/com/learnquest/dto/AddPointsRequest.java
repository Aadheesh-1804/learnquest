package com.learnquest.dto;

public class AddPointsRequest {
    private String email;
    private Integer points; // how many points to add for this quiz

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Integer getPoints() { return points; }
    public void setPoints(Integer points) { this.points = points; }
}