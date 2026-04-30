package com.zarcommerce.service_user.auth;

public record AdminLoginResponse(
        String token,
        String username,
        String email,
        boolean superAdmin
) {
}
