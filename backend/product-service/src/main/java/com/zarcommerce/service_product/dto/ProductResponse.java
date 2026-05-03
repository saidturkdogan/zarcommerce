package com.zarcommerce.service_product.dto;

public record ProductResponse(
        Long id,
        String name,
        String slug,
        String imageUrl,
        String description,
        Double price,
        String category,
        Long categoryId,
        String brand,
        Long brandId,
        String status,
        String taxClass,
        String currency,
        boolean active
) {
}
