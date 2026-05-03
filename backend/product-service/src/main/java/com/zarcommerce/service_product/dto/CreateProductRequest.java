package com.zarcommerce.service_product.dto;

/**
 * @param category   Görünen kategori adı (yoksa oluşturulur)
 * @param brand      İsteğe bağlı marka adı (yoksa oluşturulur)
 * @param slug       Boşsa isimden üretilir; benzersiz olana kadar sonek eklenir
 */
public record CreateProductRequest(
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
