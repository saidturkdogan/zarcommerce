package com.zarcommerce.service_user.auth;

public record CustomerProfileResponse(
        Long userId,
        String email,
        String firstName,
        String lastName
) {
}
