package com.resumeanalyzer.service;

import com.resumeanalyzer.dto.AuthRequest;
import com.resumeanalyzer.dto.AuthResponse;
import com.resumeanalyzer.dto.LoginRequest;
import com.resumeanalyzer.model.User;
import com.resumeanalyzer.repository.UserRepository;
import com.resumeanalyzer.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    public AuthResponse register(AuthRequest authRequest) {
        if (userRepository.existsByEmail(authRequest.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        
        User user = new User();
        user.setName(authRequest.getName());
        user.setEmail(authRequest.getEmail());
        user.setPassword(passwordEncoder.encode(authRequest.getPassword()));
        
        user = userRepository.save(user);
        
        String token = jwtUtil.generateToken(user.getEmail());
        
        return new AuthResponse(token, "Bearer", user.getId(), user.getName(), user.getEmail());
    }
    
    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getEmail(),
                loginRequest.getPassword()
            )
        );
        
        User user = userRepository.findByEmail(loginRequest.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        String token = jwtUtil.generateToken(user.getEmail());
        
        return new AuthResponse(token, "Bearer", user.getId(), user.getName(), user.getEmail());
    }
}
