package com.learnquest.dto;

import com.learnquest.model.User;

public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private Integer points;
    private String avatar;

    public static UserResponse fromEntity(User u) {
        UserResponse r = new UserResponse();
        r.id = u.getId();
        r.name = u.getName();
        r.email = u.getEmail();
        r.points = u.getPoints();
        r.avatar = u.getAvatar();
        return r;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public Integer getPoints() { return points; }
    public String getAvatar() { return avatar; }
}