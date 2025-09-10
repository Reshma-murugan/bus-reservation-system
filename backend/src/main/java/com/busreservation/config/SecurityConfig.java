package com.busreservation.config;

import com.busreservation.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.http.HttpStatus;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    
    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter, AuthenticationProvider authenticationProvider) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.authenticationProvider = authenticationProvider;
    }
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(req ->
                req
                    // Public endpoints (no authentication required)
                    .requestMatchers(
                        "/api/public/**",
                        "/api/auth/login",
                        "/api/auth/refresh-token",
                        "/actuator/health",
                        "/error",
                        "/v3/api-docs/**",
                        "/swagger-ui/**",
                        "/swagger-ui.html"
                    ).permitAll()
                    
                    // User registration (public but rate-limited in production)
                    .requestMatchers("/api/auth/register").permitAll()
                    
                    // Admin registration (admin only)
                    .requestMatchers("/api/auth/admin/**").hasRole("ADMIN")
                    
                    // User endpoints (require USER role)
                    .requestMatchers(
                        "/api/user/search",
                        "/api/user/buses/**",
                        "/api/user/bookings/**",
                        "/api/user/profile/**"
                    ).hasRole("USER")
                    
                    // Admin endpoints (require ADMIN role)
                    .requestMatchers(
                        "/api/admin/**",
                        "/api/notifications/admin/**"
                    ).hasRole("ADMIN")
                    
                    // Shared authenticated endpoints (both USER and ADMIN)
                    .requestMatchers(
                        "/api/notifications/**"
                    ).authenticated()
                    
                    // Seat management endpoints
                    .requestMatchers("/api/seats/initialize").hasRole("ADMIN")
                    
                    // All other API requests require authentication
                    .requestMatchers("/api/**").authenticated()
                    
                    // Any other request (non-API) is permitted
                    .anyRequest().permitAll()
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .exceptionHandling(exception -> 
                exception.authenticationEntryPoint((request, response, authException) -> {
                    response.setContentType("application/json");
                    response.setStatus(HttpStatus.UNAUTHORIZED.value());
                    response.getWriter().write(
                        "{\"status\": 401, \"error\": \"Unauthorized\", " +
                        "\"message\": \"Authentication required\"}"
                    );
                })
            );
            
        return http.build();
    }
    
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        // Register CORS configuration for all paths
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}