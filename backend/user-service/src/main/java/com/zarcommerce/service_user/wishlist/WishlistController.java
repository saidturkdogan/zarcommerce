package com.zarcommerce.service_user.wishlist;

import com.zarcommerce.service_user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/wishlist")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping("/product-ids")
    public List<Long> listProductIds(@AuthenticationPrincipal User user) {
        return wishlistService.getFavoriteProductIds(user);
    }

    @PostMapping("/products/{productId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void add(@AuthenticationPrincipal User user, @PathVariable Long productId) {
        wishlistService.addProduct(user, productId);
    }

    @DeleteMapping("/products/{productId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@AuthenticationPrincipal User user, @PathVariable Long productId) {
        wishlistService.removeProduct(user, productId);
    }
}
