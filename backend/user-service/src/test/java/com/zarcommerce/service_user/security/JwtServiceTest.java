package com.zarcommerce.service_user.security;

import com.zarcommerce.service_user.entity.Role;
import com.zarcommerce.service_user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private JwtService jwtService;
    private User user;

    @BeforeEach
    void setup() {
        jwtService = new JwtService();
        // base64 encoded 32-byte secret
        ReflectionTestUtils.setField(jwtService, "secretKey",
                "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 60_000L);
        user = User.builder()
                .id(1L)
                .email("user@example.com")
                .password("hashed")
                .role(Role.USER)
                .build();
    }

    @Test
    void generateTokenAndExtractUsernameRoundTrip() {
        String token = jwtService.generateToken(user);

        assertThat(token).isNotBlank();
        assertThat(jwtService.extractUsername(token)).isEqualTo("user@example.com");
    }

    @Test
    void generateTokenWithExtraClaimsCarriesClaims() {
        String token = jwtService.generateToken(Map.of("role", "ADMIN"), user);

        String role = jwtService.extractClaim(token, claims -> claims.get("role", String.class));
        assertThat(role).isEqualTo("ADMIN");
    }

    @Test
    void isTokenValidReturnsTrueForMatchingUserAndUnexpiredToken() {
        String token = jwtService.generateToken(user);

        assertThat(jwtService.isTokenValid(token, user)).isTrue();
    }

    @Test
    void isTokenValidReturnsFalseForDifferentUser() {
        String token = jwtService.generateToken(user);
        User other = User.builder().email("other@example.com").build();

        assertThat(jwtService.isTokenValid(token, other)).isFalse();
    }

    @Test
    void isTokenValidThrowsForExpiredToken() {
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", -1_000L);
        String expired = jwtService.generateToken(user);
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 60_000L);

        org.assertj.core.api.Assertions.assertThatThrownBy(() -> jwtService.isTokenValid(expired, user))
                .isInstanceOf(io.jsonwebtoken.ExpiredJwtException.class);
    }
}
