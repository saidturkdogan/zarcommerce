package com.zarcommerce.service_user.auth;

public record CustomerAuthResponse(
        String token,
        Long userId,
        String email,
        String firstName,
        String lastName
) {
}
