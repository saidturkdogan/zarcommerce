package com.zarcommerce.service_product.repository;

import com.zarcommerce.service_product.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {

    Optional<ProductImage> findFirstByProduct_IdAndPrimaryTrueOrderBySortOrderAscIdAsc(Long productId);

    List<ProductImage> findByProduct_IdOrderBySortOrderAscIdAsc(Long productId);
}
