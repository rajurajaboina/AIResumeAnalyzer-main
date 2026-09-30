package com.resumeanalyzer.dto;

public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private String userId;
    private String name;
    private String email;

    public AuthResponse() {}

    public AuthResponse(String token, String userId, String name, String email) {
        this.token = token;
        this.userId = userId;
        this.name = name;
        this.email = email;
    }

    public AuthResponse(String token, String type, String userId, String name, String email) {
        this.token = token;
        this.type = type;
        this.userId = userId;
        this.name = name;
        this.email = email;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
