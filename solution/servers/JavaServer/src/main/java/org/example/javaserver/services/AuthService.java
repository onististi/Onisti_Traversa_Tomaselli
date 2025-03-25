package org.example.javaserver.services;

import jakarta.transaction.Transactional;
import org.example.javaserver.dto.LoginRequest;
import org.example.javaserver.dto.RegisterRequest;
import org.example.javaserver.models.User;
import org.example.javaserver.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User register(RegisterRequest request) {
        // Validazione input
        if (request.getUsername() == null || request.getEmail() == null || request.getPassword() == null) {
            throw new IllegalArgumentException("Tutti i campi sono obbligatori");
        }

        // Verifica esistenza username o email
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username già esistente");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email già registrata");
        }

        // Crea nuovo utente
        User newUser = new User();
        newUser.setUsername(request.getUsername());
        newUser.setEmail(request.getEmail());
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));
        newUser.setCreatedAt(LocalDateTime.now());
        newUser.setLastLogin(LocalDateTime.now());

        return userRepository.save(newUser);
    }

    @Transactional
    public User login(LoginRequest request) {
        // Validazione input
        if (request.getUsername() == null || request.getPassword() == null) {
            throw new IllegalArgumentException("Username e password sono obbligatori");
        }

        // Trova utente
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Username o password non validi"));

        // Verifica password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Username o password non validi");
        }

        // Aggiorna last_login
        user.setLastLogin(LocalDateTime.now());
        return userRepository.save(user);
    }
}