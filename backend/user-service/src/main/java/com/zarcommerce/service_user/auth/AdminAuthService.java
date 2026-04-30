package com.zarcommerce.service_user.auth;

import com.zarcommerce.service_user.entity.Admin;
import com.zarcommerce.service_user.entity.User;
import com.zarcommerce.service_user.repository.AdminRepository;
import com.zarcommerce.service_user.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
@RequiredArgsConstructor
public class AdminAuthService {

    private final AdminRepository adminRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AdminLoginResponse login(AdminLoginRequest request) {
        Admin admin = adminRepository.findByUsername(request.username())
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Invalid admin credentials"));

        User user = admin.getUser();
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getEmail(), request.password())
        );

        admin.setLastLoginAt(OffsetDateTime.now());
        adminRepository.save(admin);

        String token = jwtService.generateToken(user);
        return new AdminLoginResponse(token, admin.getUsername(), user.getEmail(), admin.isSuperAdmin());
    }
}
