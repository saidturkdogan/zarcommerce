package com.zarcommerce.service_user.repository;

import com.zarcommerce.service_user.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {

    boolean existsByWishlist_IdAndProductId(Long wishlistId, Long productId);

    void deleteByWishlist_IdAndProductId(Long wishlistId, Long productId);

    @Query("select wi.productId from WishlistItem wi where wi.wishlist.id = :wishlistId order by wi.id asc")
    List<Long> findProductIdsByWishlistId(@Param("wishlistId") Long wishlistId);
}
