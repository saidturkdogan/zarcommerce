package com.zarcommerce.service_product.dto;

public record CreateProductRequest(String name, Double price, String category, String description) {
}
