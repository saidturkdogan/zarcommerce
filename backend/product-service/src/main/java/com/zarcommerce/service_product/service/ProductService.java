package com.zarcommerce.service_product.service;

import com.zarcommerce.service_product.dto.CreateProductRequest;
import com.zarcommerce.service_product.dto.ProductResponse;
import com.zarcommerce.service_product.dto.UpdateProductRequest;
import com.zarcommerce.service_product.entity.Category;
import com.zarcommerce.service_product.entity.Product;
import com.zarcommerce.service_product.repository.CategoryRepository;
import com.zarcommerce.service_product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]+");
    private static final Pattern DASHES = Pattern.compile("[-]+");

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Product not found"));
        return toResponse(product);
    }

    @Transactional
    public ProductResponse createProduct(CreateProductRequest request) {
        Category category = findOrCreateCategory(request.category());

        Product product = new Product();
        product.setName(request.name());
        product.setSlug(generateSlug(request.name()));
        product.setBasePrice(BigDecimal.valueOf(request.price()));
        product.setCategory(category);
        product.setCurrency("TRY");
        product.setActive(true);
        product.setStatus("active");

        if (request.description() != null) {
            product.setDescription(request.description());
        }

        Product saved = productRepository.save(product);
        return toResponse(saved);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Product not found"));

        if (request.name() != null) {
            product.setName(request.name());
            product.setSlug(generateSlug(request.name()));
        }
        if (request.price() != null) {
            product.setBasePrice(BigDecimal.valueOf(request.price()));
        }
        if (request.category() != null) {
            Category category = findOrCreateCategory(request.category());
            product.setCategory(category);
        }
        if (request.description() != null) {
            product.setDescription(request.description());
        }

        Product saved = productRepository.save(product);
        return toResponse(saved);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Product not found"));
        productRepository.delete(product);
    }

    private Category findOrCreateCategory(String categoryName) {
        return categoryRepository.findByName(categoryName)
                .orElseGet(() -> {
                    Category cat = new Category();
                    cat.setName(categoryName);
                    cat.setSlug(generateSlug(categoryName));
                    cat.setActive(true);
                    cat.setSortOrder(0);
                    return categoryRepository.save(cat);
                });
    }

    private ProductResponse toResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getBasePrice().doubleValue(),
                product.getCategory() != null ? product.getCategory().getName() : null
        );
    }

    private String generateSlug(String input) {
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        String noAccent = normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        String lower = noAccent.toLowerCase(Locale.ENGLISH);
        String noSpecial = NON_LATIN.matcher(lower).replaceAll("-");
        String noWhitespace = WHITESPACE.matcher(noSpecial).replaceAll("-");
        String noDupDashes = DASHES.matcher(noWhitespace).replaceAll("-");
        String trimmed = noDupDashes.replaceAll("^-|-$", "");
        return trimmed.isEmpty() ? "product" : trimmed;
    }
}
