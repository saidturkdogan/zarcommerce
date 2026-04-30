package com.zarcommerce.service_user.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity
@Table(name = "admins")
@Getter
@Setter
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, unique = true, length = 80)
    private String username;

    @Column(name = "is_super_admin", nullable = false)
    private boolean superAdmin;

    @Column(name = "last_login_at")
    private OffsetDateTime lastLoginAt;
}
