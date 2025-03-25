package org.example.javaserver.controller;

import org.example.javaserver.dto.LoginRequest;
import org.example.javaserver.dto.RegisterRequest;
import org.example.javaserver.models.User;
import org.example.javaserver.services.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        try {
            User registeredUser = authService.register(registerRequest);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", Map.of(
                    "id", registeredUser.getId(),
                    "username", registeredUser.getUsername(),
                    "email", registeredUser.getEmail()
            ));

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            User authenticatedUser = authService.login(loginRequest);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", Map.of(
                    "id", authenticatedUser.getId(),
                    "username", authenticatedUser.getUsername(),
                    "email", authenticatedUser.getEmail()
            ));

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(401).body(errorResponse);
        }
    }
}