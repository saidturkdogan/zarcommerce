package com.zarcommerce.service_product.dto;

/**
 * Alanlar null ise değişiklik yapılmaz. brand: boş string gönderilirse marka kaldırılır.
 */
public record UpdateProductRequest(
        String name,
        Double price,
        String category,
        String imageUrl,
        String description,
        String slug,
        String brand,
        String status,
        String taxClass,
        String currency,
        Boolean active
) {
}
