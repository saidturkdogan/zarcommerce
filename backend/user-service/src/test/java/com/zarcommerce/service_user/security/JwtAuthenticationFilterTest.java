package com.zarcommerce.service_user.security;

import com.zarcommerce.service_user.entity.Role;
import com.zarcommerce.service_user.entity.User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private JwtService jwtService;
    @Mock
    private UserDetailsService userDetailsService;
    @Mock
    private FilterChain filterChain;

    @InjectMocks
    private JwtAuthenticationFilter filter;

    private MockHttpServletRequest request;
    private MockHttpServletResponse response;

    @BeforeEach
    void setup() {
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void teardown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void skipsAuthenticationWhenNoAuthorizationHeader() throws Exception {
        filter.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(any(HttpServletRequest.class), any(HttpServletResponse.class));
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verifyNoInteractions(jwtService, userDetailsService);
    }

    @Test
    void skipsAuthenticationWhenHeaderDoesNotStartWithBearer() throws Exception {
        request.addHeader("Authorization", "Basic abc");

        filter.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(any(HttpServletRequest.class), any(HttpServletResponse.class));
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verifyNoInteractions(jwtService, userDetailsService);
    }

    @Test
    void setsAuthenticationOnValidToken() throws Exception {
        request.addHeader("Authorization", "Bearer good-token");
        User user = User.builder()
                .email("user@example.com")
                .password("hashed")
                .role(Role.USER)
                .build();
        when(jwtService.extractUsername("good-token")).thenReturn("user@example.com");
        when(userDetailsService.loadUserByUsername("user@example.com")).thenReturn(user);
        when(jwtService.isTokenValid(eq("good-token"), eq(user))).thenReturn(true);

        filter.doFilter(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getPrincipal()).isEqualTo(user);
        verify(filterChain).doFilter(any(HttpServletRequest.class), any(HttpServletResponse.class));
    }

    @Test
    void doesNotAuthenticateOnInvalidToken() throws Exception {
        request.addHeader("Authorization", "Bearer bad-token");
        User user = User.builder()
                .email("user@example.com")
                .password("hashed")
                .role(Role.USER)
                .build();
        when(jwtService.extractUsername("bad-token")).thenReturn("user@example.com");
        when(userDetailsService.loadUserByUsername("user@example.com")).thenReturn(user);
        when(jwtService.isTokenValid("bad-token", user)).thenReturn(false);

        filter.doFilter(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(any(HttpServletRequest.class), any(HttpServletResponse.class));
    }

    @Test
    void doesNotOverrideExistingAuthentication() throws Exception {
        request.addHeader("Authorization", "Bearer t");
        when(jwtService.extractUsername("t")).thenReturn("user@example.com");
        org.springframework.security.authentication.UsernamePasswordAuthenticationToken existing =
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                        "preset", null, java.util.List.of()
                );
        SecurityContextHolder.getContext().setAuthentication(existing);

        filter.doFilter(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isSameAs(existing);
        verify(userDetailsService, never()).loadUserByUsername(any());
        verify(filterChain).doFilter(any(HttpServletRequest.class), any(HttpServletResponse.class));
    }
}
