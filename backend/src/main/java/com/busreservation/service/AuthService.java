package com.busreservation.service;

import com.busreservation.dto.AuthRequest;
import com.busreservation.dto.AuthResponse;
import com.busreservation.entity.User;
import com.busreservation.exception.*;
import com.busreservation.repository.UserRepository;
import com.busreservation.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(AuthRequest request, User.Role role) {
        log.info("Starting registration for email: {}, role: {}", request.getEmail(), role);
        
        // Log the incoming request details
        log.debug("Registration request - Name: {}, Email: {}, Role: {}", 
                request.getName(), request.getEmail(), role);
                
        // Validate name
        if (!StringUtils.hasText(request.getName())) {
            log.error("Registration failed: Name is required");
            throw new IllegalArgumentException("Name is required");
        }
        
        // Validate email
        String email = request.getEmail();
        if (!StringUtils.hasText(email)) {
            log.error("Registration failed: Email is required");
            throw new IllegalArgumentException("Email is required");
        }
        
        // Check for existing user with same email
        if (userRepository.existsByEmail(email)) {
            log.warn("Registration failed: Email {} already exists", email);
            throw new DuplicateEmailException("An account with this email already exists");
        }
        
        // Validate password
        String password = request.getPassword();
        if (!StringUtils.hasText(password) || password.length() < 6) {
            log.error("Registration failed: Password must be at least 6 characters");
            throw new IllegalArgumentException("Password must be at least 6 characters long");
        }
        
        // Log before creating user
        log.debug("Creating user with role: {}", role);
        
        var user = User.builder()
                .name(request.getName())
                .email(email)
                .password(passwordEncoder.encode(password))
                .role(role)  // This should be either USER or ADMIN based on the X-Application-Source header
                .build();
        
        try {
            user = userRepository.save(user);
            log.info("User registered successfully with ID: {} and role: {}", user.getId(), user.getRole());
            log.debug("User details - ID: {}, Email: {}, Role: {}", user.getId(), user.getEmail(), user.getRole());
        } catch (Exception e) {
            log.error("Error saving user to database: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to register user: " + e.getMessage(), e);
        }
        
        String jwtToken;
        try {
            jwtToken = jwtService.generateToken(user);
            log.debug("JWT token generated successfully");
        } catch (Exception e) {
            log.error("Error generating JWT token: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate authentication token");
        }
        
        return AuthResponse.builder()
                .accessToken(jwtToken)
                .role(user.getRole())
                .email(user.getEmail())
                .name(user.getName())
                .build();
    }
    
    @Transactional
    public AuthResponse registerAdmin(AuthRequest request) {
        log.info("Starting admin registration for email: {}", request.getEmail());
        
        // Validate name
        if (!StringUtils.hasText(request.getName())) {
            log.error("Admin registration failed: Name is required");
            throw new IllegalArgumentException("Name is required");
        }
        
        // Validate email
        String email = request.getEmail();
        if (!StringUtils.hasText(email)) {
            log.error("Admin registration failed: Email is required");
            throw new IllegalArgumentException("Email is required");
        }
        
        // Check for existing admin with same email
        boolean userExists = userRepository.existsByEmail(email);
        log.debug("Checking if user with email {} exists: {}", email, userExists);
        
        if (userExists) {
            log.warn("Admin registration failed: An admin with email {} already exists", email);
            throw new DuplicateEmailException("An admin with this email already exists");
        }
        
        // Validate password
        String password = request.getPassword();
        if (!StringUtils.hasText(password) || password.length() < 8) {
            log.error("Admin registration failed: Password must be at least 8 characters long");
            throw new IllegalArgumentException("Admin password must be at least 8 characters long");
        }
        
        try {
            var user = User.builder()
                    .name(request.getName().trim())
                    .email(email.trim().toLowerCase())
                    .password(passwordEncoder.encode(password))
                    .role(User.Role.ADMIN)
                    .build();
            
            log.debug("Saving admin user: {}", user);
            User savedUser = userRepository.save(user);
            log.info("Admin user saved successfully with ID: {}", savedUser.getId());
            
            var jwtToken = jwtService.generateToken(user);
            log.debug("JWT token generated for admin user");
            
            return AuthResponse.builder()
                    .accessToken(jwtToken)
                    .role(user.getRole())
                    .email(user.getEmail())
                    .name(user.getName())
                    .build();
                    
        } catch (Exception e) {
            log.error("Error during admin registration: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to register admin: " + e.getMessage(), e);
        }
    }
    
    @Transactional(readOnly = true)
    public AuthResponse login(AuthRequest request) {
        String email = request.getEmail();
        String password = request.getPassword();
        
        log.info("Login attempt for email: {}", email);
        
        // Validate input
        if (!StringUtils.hasText(email) || !StringUtils.hasText(password)) {
            log.warn("Login validation failed: Email or password is empty");
            throw new InvalidCredentialsException("Email and password are required");
        }
        
        try {
            log.debug("Attempting to authenticate user: {}", email);
            
            // Try to authenticate
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
            );
            
            log.debug("Authentication successful for user: {}", email);
            
            // Get user details with explicit type
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> {
                        String errorMsg = "User account not found";
                        log.error("{}: {}", errorMsg, email);
                        return new InvalidCredentialsException(errorMsg);
                    });
            
            log.info("Login successful for user: {}", email);
            return generateAuthResponse(user);
            
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            log.warn("Invalid credentials for user: {}", email);
            throw new InvalidCredentialsException("Invalid email or password");
            
        } catch (org.springframework.security.authentication.LockedException e) {
            String errorMsg = "Account is locked. Please contact support or try again later.";
            log.warn("Login failed - locked account: {}", email);
            throw new AccountLockedException(errorMsg);
            
        } catch (org.springframework.security.authentication.DisabledException e) {
            String errorMsg = "Account is disabled. Please contact support.";
            log.warn("Login failed - disabled account: {}", email);
            throw new AccountDisabledException(errorMsg);
            
        } catch (Exception e) {
            log.error("Unexpected error during login for user {}: {}", email, e.getMessage(), e);
            throw new AuthenticationException("An error occurred during login. Please try again later.");
        }
    }
    
    /**
     * Refreshes the access token using a valid refresh token
     * @param refreshToken The refresh token
     * @return New AuthResponse with fresh tokens
     */
    public AuthResponse refreshToken(String refreshToken) {
        String email = jwtService.extractUsername(refreshToken);
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
                
        if (!jwtService.isTokenValid(refreshToken, user)) {
            throw new IllegalArgumentException("Invalid refresh token");
        }
        
        return generateAuthResponse(user);
    }
    
    /**
     * Generates authentication response with access and refresh tokens
     */
    private AuthResponse generateAuthResponse(User user) {
        try {
            log.info("Generating tokens for user: {}", user.getEmail());
            // Generate access token with shorter expiration (15 minutes)
            var accessToken = jwtService.generateToken(user);
            
            // Generate refresh token with longer expiration (7 days)
            var refreshToken = jwtService.generateRefreshToken(user);
            
            log.debug("Access token generated for user: {}", user.getEmail());
            
            return AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .role(user.getRole())
                    .email(user.getEmail())
                    .name(user.getName())
                    .build();
        } catch (Exception e) {
            log.error("Error generating auth response for user {}: {}", user.getEmail(), e.getMessage(), e);
            throw new RuntimeException("Failed to generate authentication tokens: " + e.getMessage(), e);
        }
    }
}