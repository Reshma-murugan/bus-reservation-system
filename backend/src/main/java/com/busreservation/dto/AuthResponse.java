package com.busreservation.dto;

import com.busreservation.entity.User;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private User.Role role;
    private String email;
    private String name;

    public AuthResponse() {}

    public AuthResponse(String accessToken, String refreshToken, User.Role role, String email, String name) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.role = role;
        this.email = email;
        this.name = name;
    }

    // Builder pattern
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private String accessToken;
        private String refreshToken;
        private User.Role role;
        private String email;
        private String name;

        public Builder accessToken(String accessToken) { this.accessToken = accessToken; return this; }
        public Builder refreshToken(String refreshToken) { this.refreshToken = refreshToken; return this; }
        public Builder role(User.Role role) { this.role = role; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder name(String name) { this.name = name; return this; }

        public AuthResponse build() {
            return new AuthResponse(accessToken, refreshToken, role, email, name);
        }
    }
}