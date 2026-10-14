package com.learnquest.controller;

import com.learnquest.dto.*;
import com.learnquest.model.User;
import com.learnquest.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public UserResponse register(@RequestBody RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }
        User user = new User();
        user.setName(request.getName());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setPoints(0);
        user.setAvatar((request.getAvatar() != null && !request.getAvatar().isBlank()) ? request.getAvatar() : "Felix");
        User saved = userRepository.save(user);
        return UserResponse.fromEntity(saved);
    }

    @PostMapping("/login")
    public UserResponse login(@RequestBody LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No account found with this email."));
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Incorrect password.");
        }
        return UserResponse.fromEntity(user);
    }

    @PutMapping("/update")
    public UserResponse updateProfile(@RequestBody UpdateProfileRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("User not found."));
        if (request.getName() != null && !request.getName().isBlank()) user.setName(request.getName());
        if (request.getAvatar() != null && !request.getAvatar().isBlank()) user.setAvatar(request.getAvatar());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }
        User saved = userRepository.save(user);
        return UserResponse.fromEntity(saved);
    }

    @PostMapping("/add-points")
    public UserResponse addPoints(@RequestBody AddPointsRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("User not found."));
        user.setPoints(user.getPoints() + request.getPoints());
        User saved = userRepository.save(user);
        return UserResponse.fromEntity(saved);
    }

    @PostMapping("/reset-password")
    public UserResponse resetPassword(@RequestBody ResetPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No account found with this email."));
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        User saved = userRepository.save(user);
        return UserResponse.fromEntity(saved);
    }
}