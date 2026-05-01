package com.zarcommerce.service_user.controller;

import com.zarcommerce.service_user.entity.User;
import com.zarcommerce.service_user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping
    public List<UserResponse> getUsers() {
        return userRepository.findAll()
                .stream()
                .map(u -> new UserResponse(
                        u.getId(),
                        u.getFirstName() != null ? u.getFirstName() : "-",
                        u.getLastName() != null ? u.getLastName() : "-",
                        u.getEmail(),
                        u.getRole().name()
                ))
                .toList();
    }

    public record UserResponse(Long id, String firstName, String lastName, String email, String role) {}
}
