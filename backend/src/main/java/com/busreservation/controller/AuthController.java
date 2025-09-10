package com.busreservation.controller;

import com.busreservation.dto.AuthRequest;
import com.busreservation.dto.AuthResponse;
import com.busreservation.entity.User;
import com.busreservation.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication and Registration APIs")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Register a new user")
    @ApiResponse(responseCode = "201", description = "User registered successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input data")
    @ApiResponse(responseCode = "409", description = "Email already exists")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody AuthRequest request,
            @RequestHeader(value = "X-Application-Source", required = false) String appSource) {
        
        // Set role based on the app source
        User.Role role = "admin-app".equalsIgnoreCase(appSource) ? User.Role.ADMIN : User.Role.USER;
        
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(authService.register(request, role));
    }
    
    // Removed admin-only registration endpoint since we're using X-Application-Source header
    
    @PostMapping("/login")
    @Operation(summary = "Authenticate user and get JWT token")
    @ApiResponse(responseCode = "200", description = "Authentication successful")
    @ApiResponse(responseCode = "400", description = "Invalid credentials")
    @ApiResponse(responseCode = "401", description = "Authentication failed")
    @ApiResponse(responseCode = "423", description = "Account is locked or disabled")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                    "status", "error",
                    "message", e.getMessage(),
                    "error", "Invalid credentials"
                ));
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "status", "error",
                    "message", "An error occurred during authentication. Please try again later.",
                    "error", e.getMessage()
                ));
        }
    }
    
    @PostMapping("/refresh-token")
    @Operation(summary = "Refresh JWT token")
    @ApiResponse(responseCode = "200", description = "Token refreshed successfully")
    @ApiResponse(responseCode = "401", description = "Invalid refresh token")
    public ResponseEntity<AuthResponse> refreshToken(@RequestParam String refreshToken) {
        return ResponseEntity.ok(authService.refreshToken(refreshToken));
    }
}