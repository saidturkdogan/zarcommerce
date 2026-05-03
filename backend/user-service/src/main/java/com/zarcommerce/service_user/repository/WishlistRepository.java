package com.zarcommerce.service_user.repository;

import com.zarcommerce.service_user.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    Optional<Wishlist> findByUser_Id(Long userId);
}
