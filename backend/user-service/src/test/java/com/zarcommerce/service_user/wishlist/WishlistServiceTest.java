package com.zarcommerce.service_user.wishlist;

import com.zarcommerce.service_user.entity.User;
import com.zarcommerce.service_user.entity.Wishlist;
import com.zarcommerce.service_user.entity.WishlistItem;
import com.zarcommerce.service_user.repository.WishlistItemRepository;
import com.zarcommerce.service_user.repository.WishlistRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WishlistServiceTest {

    @Mock
    private WishlistRepository wishlistRepository;
    @Mock
    private WishlistItemRepository wishlistItemRepository;

    @InjectMocks
    private WishlistService service;

    private User user;
    private Wishlist wishlist;

    @BeforeEach
    void setup() {
        user = User.builder().id(42L).email("u@u.com").password("x").build();
        wishlist = Wishlist.builder().id(7L).user(user).build();
    }

    @Test
    void getFavoriteProductIdsReturnsEmptyWhenNoWishlist() {
        when(wishlistRepository.findByUser_Id(42L)).thenReturn(Optional.empty());

        List<Long> result = service.getFavoriteProductIds(user);

        assertThat(result).isEmpty();
        verify(wishlistItemRepository, never()).findProductIdsByWishlistId(any());
    }

    @Test
    void getFavoriteProductIdsReturnsRepositoryResult() {
        when(wishlistRepository.findByUser_Id(42L)).thenReturn(Optional.of(wishlist));
        when(wishlistItemRepository.findProductIdsByWishlistId(7L)).thenReturn(List.of(1L, 2L, 3L));

        List<Long> result = service.getFavoriteProductIds(user);

        assertThat(result).containsExactly(1L, 2L, 3L);
    }

    @Test
    void addProductCreatesWishlistWhenMissing() {
        when(wishlistRepository.findByUser_Id(42L)).thenReturn(Optional.empty());
        when(wishlistRepository.save(any(Wishlist.class))).thenAnswer(inv -> {
            Wishlist w = inv.getArgument(0);
            w.setId(101L);
            return w;
        });
        when(wishlistItemRepository.existsByWishlist_IdAndProductId(101L, 5L)).thenReturn(false);

        service.addProduct(user, 5L);

        ArgumentCaptor<Wishlist> wishlistCaptor = ArgumentCaptor.forClass(Wishlist.class);
        verify(wishlistRepository).save(wishlistCaptor.capture());
        assertThat(wishlistCaptor.getValue().getUser()).isSameAs(user);

        ArgumentCaptor<WishlistItem> itemCaptor = ArgumentCaptor.forClass(WishlistItem.class);
        verify(wishlistItemRepository).save(itemCaptor.capture());
        assertThat(itemCaptor.getValue().getProductId()).isEqualTo(5L);
        assertThat(itemCaptor.getValue().getWishlist().getId()).isEqualTo(101L);
    }

    @Test
    void addProductIsIdempotentWhenItemAlreadyExists() {
        when(wishlistRepository.findByUser_Id(42L)).thenReturn(Optional.of(wishlist));
        when(wishlistItemRepository.existsByWishlist_IdAndProductId(7L, 5L)).thenReturn(true);

        service.addProduct(user, 5L);

        verify(wishlistRepository, never()).save(any());
        verify(wishlistItemRepository, never()).save(any());
    }

    @Test
    void addProductReusesExistingWishlist() {
        when(wishlistRepository.findByUser_Id(42L)).thenReturn(Optional.of(wishlist));
        when(wishlistItemRepository.existsByWishlist_IdAndProductId(7L, 5L)).thenReturn(false);

        service.addProduct(user, 5L);

        verify(wishlistRepository, never()).save(any());
        verify(wishlistItemRepository, times(1)).save(any(WishlistItem.class));
    }

    @Test
    void removeProductDeletesWhenWishlistExists() {
        when(wishlistRepository.findByUser_Id(42L)).thenReturn(Optional.of(wishlist));

        service.removeProduct(user, 9L);

        verify(wishlistItemRepository).deleteByWishlist_IdAndProductId(7L, 9L);
    }

    @Test
    void removeProductIsNoOpWhenWishlistMissing() {
        when(wishlistRepository.findByUser_Id(42L)).thenReturn(Optional.empty());

        service.removeProduct(user, 9L);

        verify(wishlistItemRepository, never()).deleteByWishlist_IdAndProductId(any(), any());
    }
}
