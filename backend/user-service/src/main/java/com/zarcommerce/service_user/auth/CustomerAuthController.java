package com.zarcommerce.service_user.auth;

import com.zarcommerce.service_user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CustomerAuthController {

    private final CustomerAuthService customerAuthService;

    @PostMapping("/register")
    public CustomerAuthResponse register(@Valid @RequestBody CustomerRegisterRequest request) {
        return customerAuthService.register(request);
    }

    @PostMapping("/login")
    public CustomerAuthResponse login(@Valid @RequestBody CustomerLoginRequest request) {
        return customerAuthService.login(request);
    }

    @GetMapping("/me")
    public CustomerProfileResponse me(@AuthenticationPrincipal User user) {
        return customerAuthService.profile(user);
    }
}
