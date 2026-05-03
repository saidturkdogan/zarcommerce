package com.zarcommerce.service_product.service;

import com.zarcommerce.service_product.dto.CreateProductRequest;
import com.zarcommerce.service_product.dto.ProductPageResponse;
import com.zarcommerce.service_product.dto.ProductResponse;
import com.zarcommerce.service_product.dto.UpdateProductRequest;
import com.zarcommerce.service_product.entity.Brand;
import com.zarcommerce.service_product.entity.Category;
import com.zarcommerce.service_product.entity.Product;
import com.zarcommerce.service_product.entity.ProductImage;
import com.zarcommerce.service_product.repository.BrandRepository;
import com.zarcommerce.service_product.repository.CategoryRepository;
import com.zarcommerce.service_product.repository.ProductImageRepository;
import com.zarcommerce.service_product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductImageRepository productImageRepository;

    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]+");
    private static final Pattern DASHES = Pattern.compile("[-]+");

    private static final List<String> ALLOWED_STATUS = List.of("active", "draft", "archived");

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ProductPageResponse getProductsPage(Pageable pageable, String search, String category) {
        String normalizedSearch = search != null ? search.trim() : "";
        String normalizedCategory = category != null ? category.trim() : "";

        Page<Product> page;
        if (!normalizedSearch.isEmpty() && !normalizedCategory.isEmpty()) {
            page = productRepository.findByNameContainingIgnoreCaseAndCategory_NameIgnoreCase(
                    normalizedSearch,
                    normalizedCategory,
                    pageable
            );
        } else if (!normalizedSearch.isEmpty()) {
            page = productRepository.findByNameContainingIgnoreCase(normalizedSearch, pageable);
        } else if (!normalizedCategory.isEmpty()) {
            page = productRepository.findByCategory_NameIgnoreCase(normalizedCategory, pageable);
        } else {
            page = productRepository.findAll(pageable);
        }

        List<ProductResponse> content = page.getContent().stream()
                .map(this::toResponse)
                .toList();
        return new ProductPageResponse(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Product not found"));
        return toResponse(product);
    }

    @Transactional
    public ProductResponse createProduct(CreateProductRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Name is required");
        }
        if (request.price() == null || request.price() < 0) {
            throw new ResponseStatusException(BAD_REQUEST, "Valid price is required");
        }
        if (request.category() == null || request.category().isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Category is required");
        }

        Category category = findOrCreateCategory(request.category().trim());

        Product product = new Product();
        product.setName(request.name().trim());
        String slugBase = (request.slug() != null && !request.slug().isBlank())
                ? generateSlug(request.slug().trim())
                : generateSlug(request.name().trim());
        product.setSlug(ensureUniqueProductSlug(slugBase.isEmpty() ? "product" : slugBase, null));
        product.setBasePrice(BigDecimal.valueOf(request.price()));
        product.setCategory(category);
        product.setCurrency(normalizeCurrency(request.currency()));
        product.setActive(request.active() != null ? request.active() : true);
        product.setStatus(normalizeStatus(request.status(), "active"));
        product.setTaxClass(normalizeTaxClass(request.taxClass()));

        if (request.description() != null && !request.description().isBlank()) {
            product.setDescription(request.description().trim());
        }

        if (request.brand() != null && !request.brand().isBlank()) {
            product.setBrand(findOrCreateBrand(request.brand().trim()));
        }

        Product saved = productRepository.save(product);
        upsertPrimaryImage(saved, request.imageUrl());
        return toResponse(saved);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Product not found"));

        if (request.name() != null) {
            if (request.name().isBlank()) {
                throw new ResponseStatusException(BAD_REQUEST, "Name cannot be empty");
            }
            product.setName(request.name().trim());
        }

        if (request.slug() != null) {
            String source = request.slug().isBlank()
                    ? product.getName()
                    : request.slug().trim();
            String newSlug = ensureUniqueProductSlug(generateSlug(source), product.getId());
            product.setSlug(newSlug);
        } else if (request.name() != null) {
            product.setSlug(ensureUniqueProductSlug(generateSlug(product.getName()), product.getId()));
        }

        if (request.price() != null) {
            if (request.price() < 0) {
                throw new ResponseStatusException(BAD_REQUEST, "Invalid price");
            }
            product.setBasePrice(BigDecimal.valueOf(request.price()));
        }

        if (request.category() != null) {
            if (request.category().isBlank()) {
                throw new ResponseStatusException(BAD_REQUEST, "Category cannot be empty");
            }
            product.setCategory(findOrCreateCategory(request.category().trim()));
        }

        if (request.description() != null) {
            product.setDescription(request.description().isBlank() ? null : request.description().trim());
        }

        if (request.imageUrl() != null) {
            upsertPrimaryImage(product, request.imageUrl());
        }

        if (request.brand() != null) {
            if (request.brand().isBlank()) {
                product.setBrand(null);
            } else {
                product.setBrand(findOrCreateBrand(request.brand().trim()));
            }
        }

        if (request.status() != null) {
            product.setStatus(normalizeStatus(request.status(), product.getStatus()));
        }

        if (request.taxClass() != null) {
            product.setTaxClass(normalizeTaxClass(request.taxClass()));
        }

        if (request.currency() != null) {
            product.setCurrency(normalizeCurrency(request.currency()));
        }

        if (request.active() != null) {
            product.setActive(request.active());
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
                    cat.setSlug(ensureUniqueCategorySlug(generateSlug(categoryName)));
                    cat.setActive(true);
                    cat.setSortOrder(0);
                    return categoryRepository.save(cat);
                });
    }

    private String ensureUniqueCategorySlug(String base) {
        String candidate = base.isEmpty() ? "category" : base;
        int i = 0;
        while (categoryRepository.existsBySlug(candidate)) {
            candidate = base + "-" + (++i);
        }
        return candidate;
    }

    private Brand findOrCreateBrand(String brandName) {
        return brandRepository.findByName(brandName)
                .orElseGet(() -> {
                    Brand b = new Brand();
                    b.setName(brandName);
                    String base = generateSlug(brandName);
                    b.setSlug(ensureUniqueBrandSlug(base.isEmpty() ? "brand" : base));
                    return brandRepository.save(b);
                });
    }

    private String ensureUniqueBrandSlug(String base) {
        String candidate = base;
        int i = 0;
        while (brandRepository.existsBySlug(candidate)) {
            candidate = base + "-" + (++i);
        }
        return candidate;
    }

    private String ensureUniqueProductSlug(String base, Long excludeId) {
        String candidate = base.isEmpty() ? "product" : base;
        int i = 0;
        while (true) {
            boolean taken = excludeId == null
                    ? productRepository.existsBySlug(candidate)
                    : productRepository.existsBySlugAndIdNot(candidate, excludeId);
            if (!taken) {
                return candidate;
            }
            candidate = base + "-" + (++i);
        }
    }

    private String normalizeStatus(String status, String fallback) {
        String s = (status != null ? status : fallback).trim().toLowerCase(Locale.ENGLISH);
        if (!ALLOWED_STATUS.contains(s)) {
            throw new ResponseStatusException(BAD_REQUEST, "status must be one of: active, draft, archived");
        }
        return s;
    }

    private String normalizeTaxClass(String taxClass) {
        if (taxClass == null || taxClass.isBlank()) {
            return "standard";
        }
        return taxClass.trim();
    }

    private String normalizeCurrency(String currency) {
        if (currency == null || currency.isBlank()) {
            return "TRY";
        }
        String c = currency.trim().toUpperCase(Locale.ENGLISH);
        if (c.length() != 3) {
            throw new ResponseStatusException(BAD_REQUEST, "currency must be a 3-letter code");
        }
        return c;
    }

    private ProductResponse toResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getSlug(),
                getPrimaryImageUrl(product.getId()),
                product.getDescription(),
                product.getBasePrice().doubleValue(),
                product.getCategory() != null ? product.getCategory().getName() : null,
                product.getCategory() != null ? product.getCategory().getId() : null,
                product.getBrand() != null ? product.getBrand().getName() : null,
                product.getBrand() != null ? product.getBrand().getId() : null,
                product.getStatus(),
                product.getTaxClass(),
                product.getCurrency(),
                product.isActive()
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

    private String getPrimaryImageUrl(Long productId) {
        return productImageRepository.findFirstByProduct_IdAndPrimaryTrueOrderBySortOrderAscIdAsc(productId)
                .map(ProductImage::getImageUrl)
                .orElse(null);
    }

    private void upsertPrimaryImage(Product product, String imageUrlValue) {
        String url = imageUrlValue != null ? imageUrlValue.trim() : "";
        if (url.isEmpty()) {
            return;
        }

        ProductImage image = productImageRepository
                .findFirstByProduct_IdAndPrimaryTrueOrderBySortOrderAscIdAsc(product.getId())
                .orElseGet(() -> {
                    ProductImage created = new ProductImage();
                    created.setProduct(product);
                    created.setPrimary(true);
                    created.setSortOrder(0);
                    return created;
                });

        image.setImageUrl(url);
        productImageRepository.save(image);
    }
}
