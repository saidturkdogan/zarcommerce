package com.zarcommerce.service_product.repository;

import com.zarcommerce.service_product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);

    Page<Product> findByCategory_NameIgnoreCase(String categoryName, Pageable pageable);

    Page<Product> findByNameContainingIgnoreCaseAndCategory_NameIgnoreCase(String name, String categoryName, Pageable pageable);
}
