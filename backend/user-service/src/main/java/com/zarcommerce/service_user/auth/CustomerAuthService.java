package com.zarcommerce.service_user.auth;

import com.zarcommerce.service_user.entity.Role;
import com.zarcommerce.service_user.entity.User;
import com.zarcommerce.service_user.repository.UserRepository;
import com.zarcommerce.service_user.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
@RequiredArgsConstructor
public class CustomerAuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public CustomerAuthResponse register(CustomerRegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(CONFLICT, "Email already registered");
        }

        String lastName = request.lastName() != null ? request.lastName().trim() : "";
        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(request.password()))
                .firstName(request.firstName().trim())
                .lastName(lastName)
                .role(Role.USER)
                .build();
        userRepository.save(user);

        String token = jwtService.generateToken(user);
        return new CustomerAuthResponse(token, user.getId(), user.getEmail(), user.getFirstName(), user.getLastName());
    }

    public CustomerAuthResponse login(CustomerLoginRequest request) {
        String email = request.email().trim().toLowerCase();
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.password())
        );

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Invalid credentials"));

        String token = jwtService.generateToken(user);
        return new CustomerAuthResponse(token, user.getId(), user.getEmail(), user.getFirstName(), user.getLastName());
    }

    public CustomerProfileResponse profile(User user) {
        return new CustomerProfileResponse(user.getId(), user.getEmail(), user.getFirstName(), user.getLastName());
    }
}
