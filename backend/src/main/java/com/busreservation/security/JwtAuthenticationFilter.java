package com.busreservation.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpHeaders;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        final String path = request.getRequestURI();

        try {
            // Handle token refresh endpoint
            if (path.equals("/api/auth/refresh")) {
                handleRefreshToken(request, response, filterChain);
                return;
            }

            // Skip JWT for public endpoints
            if (path.startsWith("/api/auth/") || path.startsWith("/api/public/")) {
                filterChain.doFilter(request, response);
                return;
            }

            final String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("No JWT token found in request headers for path: {}", path);
                response.sendError(HttpStatus.UNAUTHORIZED.value(), "Missing or invalid Authorization header");
                return;
            }

            final String jwt = authHeader.substring(7);
            String userEmail;
            
            try {
                userEmail = jwtService.extractUsername(jwt);
                log.debug("Extracted email from JWT: {}", userEmail);
            } catch (ExpiredJwtException ex) {
                log.warn("Expired JWT token for path: {}", path);
                response.sendError(HttpStatus.UNAUTHORIZED.value(), "JWT token has expired");
                return;
            } catch (MalformedJwtException | SignatureException ex) {
                log.warn("Invalid JWT token for path: {}", path);
                response.sendError(HttpStatus.UNAUTHORIZED.value(), "Invalid JWT token");
                return;
            } catch (Exception ex) {
                log.error("Error processing JWT token for path: " + path, ex);
                response.sendError(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Error processing authentication");
                return;
            }

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                try {
                    // Check if this is a refresh token being used as an access token
                    if (jwtService.isRefreshToken(jwt)) {
                        log.warn("Refresh token used as access token for path: {}", path);
                        response.sendError(HttpStatus.FORBIDDEN.value(), "Invalid token type");
                        return;
                    }

                    UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);
                    
                    if (jwtService.isTokenValid(jwt, userDetails)) {
                        // Extract the role from the token claims
                        String role = jwtService.extractClaim(jwt, claims -> claims.get("role", String.class));
                
                        // Create authorities list with the role from the token
                        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                
                        // If role claim exists in the token, use it with ROLE_ prefix
                        if (role != null && !role.trim().isEmpty()) {
                            // Ensure the role has the ROLE_ prefix
                            if (!role.startsWith("ROLE_")) {
                                role = "ROLE_" + role;
                            }
                            authorities.add(new SimpleGrantedAuthority(role));
                        } else {
                            // Fallback to user details authorities if role claim is missing
                            authorities.addAll(userDetails.getAuthorities().stream()
                                .map(auth -> new SimpleGrantedAuthority(auth.getAuthority()))
                                .collect(Collectors.toList()));
                        }
                        log.debug("Using authorities from JWT token: {}", authorities);
                        
                        UsernamePasswordAuthenticationToken authToken = 
                            new UsernamePasswordAuthenticationToken(userDetails, null, authorities);
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        log.debug("Successfully authenticated user: {}", userEmail);
                    } else {
                        log.warn("Invalid JWT token for user: {}", userEmail);
                        response.sendError(HttpStatus.UNAUTHORIZED.value(), "Invalid JWT token");
                        return;
                    }
                } catch (UsernameNotFoundException ex) {
                    log.warn("User not found: {}", userEmail);
                    response.sendError(HttpStatus.UNAUTHORIZED.value(), "User not found");
                    return;
                } catch (Exception ex) {
                    log.error("Error loading user details for: " + userEmail, ex);
                    response.sendError(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Error loading user details");
                    return;
                }
            }

            filterChain.doFilter(request, response);
            
        } catch (Exception ex) {
            log.error("Unexpected error during JWT authentication for path: " + path, ex);
            response.sendError(HttpStatus.INTERNAL_SERVER_ERROR.value(), "An unexpected error occurred");
        }
    }
    
    private void handleRefreshToken(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) 
            throws IOException, ServletException {
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                response.sendError(HttpStatus.BAD_REQUEST.value(), "Missing or invalid refresh token");
                return;
            }
            
            String refreshToken = authHeader.substring(7);
            
            // Validate refresh token
            if (!jwtService.isRefreshToken(refreshToken)) {
                response.sendError(HttpStatus.FORBIDDEN.value(), "Invalid refresh token");
                return;
            }
            
            String userEmail = jwtService.extractUsername(refreshToken);
            if (userEmail == null) {
                response.sendError(HttpStatus.FORBIDDEN.value(), "Invalid refresh token");
                return;
            }
            
            UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);
            if (!jwtService.isTokenValid(refreshToken, userDetails)) {
                response.sendError(HttpStatus.FORBIDDEN.value(), "Invalid refresh token");
                return;
            }
            
            // Generate new access token
            String newAccessToken = jwtService.generateToken(userDetails);
            String newRefreshToken = jwtService.generateRefreshToken(userDetails);
            
            // Set response headers
            response.setHeader(HttpHeaders.AUTHORIZATION, "Bearer " + newAccessToken);
            response.setHeader("X-Refresh-Token", newRefreshToken);
            response.setStatus(HttpStatus.OK.value());
            
            // Write response body
            response.setContentType("application/json");
            response.getWriter().write(
                "{\"accessToken\":\"" + newAccessToken + 
                "\",\"refreshToken\":\"" + newRefreshToken + "\"}"
            );
            
        } catch (Exception e) {
            log.error("Error refreshing token: {}", e.getMessage());
            response.sendError(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Error refreshing token");
        }
    }
}
