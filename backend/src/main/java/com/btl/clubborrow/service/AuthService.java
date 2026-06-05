package com.btl.clubborrow.service;

import com.btl.clubborrow.dto.request.LoginRequest;
import com.btl.clubborrow.dto.request.RegisterRequest;
import com.btl.clubborrow.dto.response.LoginResponse;
import com.btl.clubborrow.entity.Role;
import com.btl.clubborrow.entity.User;
import com.btl.clubborrow.repository.UserRepository;
import com.btl.clubborrow.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng");
        }
        if (userRepository.existsByStudentId(request.getStudentId())) {
            throw new RuntimeException("Mã sinh viên đã được sử dụng");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT)
                .studentId(request.getStudentId())
                .build();

        userRepository.save(user);
    }

    public LoginResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = (User) auth.getPrincipal();
        String token = jwtTokenProvider.generateToken(user);

        return LoginResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .studentId(user.getStudentId())
                .build();
    }

    public LoginResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        return LoginResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .studentId(user.getStudentId())
                .build();
    }
}
