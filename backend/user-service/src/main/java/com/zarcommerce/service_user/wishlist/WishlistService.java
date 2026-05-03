package com.zarcommerce.service_user.wishlist;

import com.zarcommerce.service_user.entity.User;
import com.zarcommerce.service_user.entity.Wishlist;
import com.zarcommerce.service_user.entity.WishlistItem;
import com.zarcommerce.service_user.repository.WishlistItemRepository;
import com.zarcommerce.service_user.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final WishlistItemRepository wishlistItemRepository;

    @Transactional(readOnly = true)
    public List<Long> getFavoriteProductIds(User user) {
        return wishlistRepository.findByUser_Id(user.getId())
                .map(w -> wishlistItemRepository.findProductIdsByWishlistId(w.getId()))
                .orElse(List.of());
    }

    @Transactional
    public void addProduct(User user, Long productId) {
        Wishlist wishlist = getOrCreateWishlist(user);
        if (!wishlistItemRepository.existsByWishlist_IdAndProductId(wishlist.getId(), productId)) {
            wishlistItemRepository.save(
                    WishlistItem.builder().wishlist(wishlist).productId(productId).build()
            );
        }
    }

    @Transactional
    public void removeProduct(User user, Long productId) {
        wishlistRepository.findByUser_Id(user.getId()).ifPresent(wishlist ->
                wishlistItemRepository.deleteByWishlist_IdAndProductId(wishlist.getId(), productId)
        );
    }

    private Wishlist getOrCreateWishlist(User user) {
        return wishlistRepository.findByUser_Id(user.getId())
                .orElseGet(() -> wishlistRepository.save(Wishlist.builder().user(user).build()));
    }
}
