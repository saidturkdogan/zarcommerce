package com.zarcommerce.service_product.repository;

import com.zarcommerce.service_product.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BrandRepository extends JpaRepository<Brand, Long> {

    Optional<Brand> findByName(String name);

    boolean existsBySlug(String slug);
}
