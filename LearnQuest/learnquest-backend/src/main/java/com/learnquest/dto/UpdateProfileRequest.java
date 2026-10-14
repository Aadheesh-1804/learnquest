package com.learnquest.dto;

public class UpdateProfileRequest {
    private String email;       // which account to update (we identify by current email)
    private String name;
    private String password;    // optional — only sent if the user wants to change it
    private String avatar;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
}