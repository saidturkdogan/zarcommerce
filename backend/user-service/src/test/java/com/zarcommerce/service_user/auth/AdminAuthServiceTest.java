package com.zarcommerce.service_user.auth;

import com.zarcommerce.service_user.entity.Admin;
import com.zarcommerce.service_user.entity.Role;
import com.zarcommerce.service_user.entity.User;
import com.zarcommerce.service_user.repository.AdminRepository;
import com.zarcommerce.service_user.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminAuthServiceTest {

    @Mock
    private AdminRepository adminRepository;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AdminAuthService service;

    private Admin buildAdmin(boolean superAdmin) {
        User user = User.builder()
                .id(1L)
                .email("admin@x.com")
                .password("hashed")
                .firstName("A")
                .lastName("B")
                .role(Role.ADMIN)
                .build();
        Admin admin = new Admin();
        admin.setId(99L);
        admin.setUsername("root");
        admin.setSuperAdmin(superAdmin);
        admin.setUser(user);
        return admin;
    }

    @Test
    void loginGeneratesTokenAndUpdatesLastLoginAt() {
        Admin admin = buildAdmin(true);
        OffsetDateTime before = OffsetDateTime.now();
        when(adminRepository.findByUsername("root")).thenReturn(Optional.of(admin));
        when(jwtService.generateToken(admin.getUser())).thenReturn("jwt-admin");

        AdminLoginResponse response = service.login(new AdminLoginRequest("root", "secret"));

        ArgumentCaptor<UsernamePasswordAuthenticationToken> tokenCaptor =
                ArgumentCaptor.forClass(UsernamePasswordAuthenticationToken.class);
        verify(authenticationManager).authenticate(tokenCaptor.capture());
        assertThat(tokenCaptor.getValue().getPrincipal()).isEqualTo("admin@x.com");
        assertThat(tokenCaptor.getValue().getCredentials()).isEqualTo("secret");

        verify(adminRepository).save(admin);
        assertThat(admin.getLastLoginAt()).isNotNull();
        assertThat(admin.getLastLoginAt()).isAfterOrEqualTo(before);

        assertThat(response.token()).isEqualTo("jwt-admin");
        assertThat(response.username()).isEqualTo("root");
        assertThat(response.email()).isEqualTo("admin@x.com");
        assertThat(response.superAdmin()).isTrue();
    }

    @Test
    void loginThrowsUnauthorizedWhenAdminNotFound() {
        when(adminRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.login(new AdminLoginRequest("ghost", "x")))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Invalid admin credentials");

        verify(authenticationManager, never()).authenticate(any());
        verify(adminRepository, never()).save(any());
    }

    @Test
    void loginPropagatesBadCredentialsAndDoesNotUpdateAdmin() {
        Admin admin = buildAdmin(false);
        when(adminRepository.findByUsername("root")).thenReturn(Optional.of(admin));
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("bad"));

        assertThatThrownBy(() -> service.login(new AdminLoginRequest("root", "wrong")))
                .isInstanceOf(BadCredentialsException.class);

        verify(adminRepository, never()).save(any());
        assertThat(admin.getLastLoginAt()).isNull();
    }
}
