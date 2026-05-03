package com.zarcommerce.service_user.auth;

import com.zarcommerce.service_user.entity.Role;
import com.zarcommerce.service_user.entity.User;
import com.zarcommerce.service_user.repository.UserRepository;
import com.zarcommerce.service_user.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomerAuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtService jwtService;

    @InjectMocks
    private CustomerAuthService service;

    private CustomerRegisterRequest registerRequest;
    private CustomerLoginRequest loginRequest;

    @BeforeEach
    void setup() {
        registerRequest = new CustomerRegisterRequest(
                "  Foo@Example.COM ",
                "secret123",
                " Foo ",
                " Bar "
        );
        loginRequest = new CustomerLoginRequest("FOO@example.com", "secret123");
    }

    @Test
    void registerNormalisesEmailAndPersistsHashedPassword() {
        when(userRepository.existsByEmail("foo@example.com")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("hashed");
        when(jwtService.generateToken(any(User.class))).thenReturn("jwt-token");

        CustomerAuthResponse response = service.register(registerRequest);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User saved = userCaptor.getValue();
        assertThat(saved.getEmail()).isEqualTo("foo@example.com");
        assertThat(saved.getPassword()).isEqualTo("hashed");
        assertThat(saved.getFirstName()).isEqualTo("Foo");
        assertThat(saved.getLastName()).isEqualTo("Bar");
        assertThat(saved.getRole()).isEqualTo(Role.USER);

        assertThat(response.token()).isEqualTo("jwt-token");
        assertThat(response.email()).isEqualTo("foo@example.com");
        assertThat(response.firstName()).isEqualTo("Foo");
        assertThat(response.lastName()).isEqualTo("Bar");
    }

    @Test
    void registerWithNullLastNameStoresEmptyString() {
        CustomerRegisterRequest req = new CustomerRegisterRequest(
                "x@x.com", "pwd", "Alice", null
        );
        when(userRepository.existsByEmail("x@x.com")).thenReturn(false);
        when(passwordEncoder.encode("pwd")).thenReturn("hashed");
        when(jwtService.generateToken(any(User.class))).thenReturn("jwt");

        CustomerAuthResponse response = service.register(req);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertThat(userCaptor.getValue().getLastName()).isEmpty();
        assertThat(response.lastName()).isEmpty();
    }

    @Test
    void registerThrowsConflictWhenEmailExists() {
        when(userRepository.existsByEmail("foo@example.com")).thenReturn(true);

        assertThatThrownBy(() -> service.register(registerRequest))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Email already registered");

        verify(userRepository, never()).save(any());
        verify(jwtService, never()).generateToken(any(User.class));
    }

    @Test
    void loginAuthenticatesWithNormalisedEmailAndReturnsToken() {
        User user = User.builder()
                .id(7L)
                .email("foo@example.com")
                .firstName("Foo")
                .lastName("Bar")
                .role(Role.USER)
                .password("hashed")
                .build();
        when(userRepository.findByEmail("foo@example.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("jwt-login");

        CustomerAuthResponse response = service.login(loginRequest);

        ArgumentCaptor<UsernamePasswordAuthenticationToken> tokenCaptor =
                ArgumentCaptor.forClass(UsernamePasswordAuthenticationToken.class);
        verify(authenticationManager).authenticate(tokenCaptor.capture());
        assertThat(tokenCaptor.getValue().getPrincipal()).isEqualTo("foo@example.com");
        assertThat(tokenCaptor.getValue().getCredentials()).isEqualTo("secret123");

        assertThat(response.token()).isEqualTo("jwt-login");
        assertThat(response.userId()).isEqualTo(7L);
    }

    @Test
    void loginPropagatesAuthenticationFailure() {
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("bad"));

        assertThatThrownBy(() -> service.login(loginRequest))
                .isInstanceOf(BadCredentialsException.class);

        verify(userRepository, never()).findByEmail(anyString());
        verify(jwtService, never()).generateToken(any(User.class));
    }

    @Test
    void loginThrowsUnauthorizedWhenUserMissingAfterAuth() {
        when(userRepository.findByEmail("foo@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.login(loginRequest))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Invalid credentials");
    }

    @Test
    void profileMapsUserFields() {
        User user = User.builder()
                .id(11L)
                .email("p@p.com")
                .firstName("F")
                .lastName("L")
                .build();

        CustomerProfileResponse profile = service.profile(user);

        assertThat(profile.userId()).isEqualTo(11L);
        assertThat(profile.email()).isEqualTo("p@p.com");
        assertThat(profile.firstName()).isEqualTo("F");
        assertThat(profile.lastName()).isEqualTo("L");
    }
}
