package com.zarcommerce.service_product.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @GetMapping
    public List<ProductResponse> getProducts() {
        return List.of(
                new ProductResponse(1L, "Premium Kablosuz Kulaklik", 1499.00, "Elektronik"),
                new ProductResponse(2L, "Smartwatch Pro", 2299.00, "Elektronik"),
                new ProductResponse(3L, "Spor Ayakkabi", 1799.00, "Spor"),
                new ProductResponse(4L, "Cilt Bakim Seti", 899.00, "Kozmetik")
        );
    }

    public record ProductResponse(Long id, String name, Double price, String category) {
    }
}
