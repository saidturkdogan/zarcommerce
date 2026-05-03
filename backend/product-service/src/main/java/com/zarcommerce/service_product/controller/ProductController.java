package com.zarcommerce.service_product.controller;

import com.zarcommerce.service_product.dto.CreateProductRequest;
import com.zarcommerce.service_product.dto.ProductPageResponse;
import com.zarcommerce.service_product.dto.ProductResponse;
import com.zarcommerce.service_product.dto.UpdateProductRequest;
import com.zarcommerce.service_product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public List<ProductResponse> getProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/page")
    public ProductPageResponse getProductsPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category
    ) {
        Sort.Direction sortDirection = "asc".equalsIgnoreCase(direction)
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1), Sort.by(sortDirection, sortBy));
        return productService.getProductsPage(pageable, search, category);
    }

    @GetMapping("/{id:\\d+}")
    public ProductResponse getProduct(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    @PostMapping
    public ProductResponse createProduct(@RequestBody CreateProductRequest request) {
        return productService.createProduct(request);
    }

    @PutMapping("/{id:\\d+}")
    public ProductResponse updateProduct(@PathVariable Long id, @RequestBody UpdateProductRequest request) {
        return productService.updateProduct(id, request);
    }

    @DeleteMapping("/{id:\\d+}")
    public void deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
    }
}
