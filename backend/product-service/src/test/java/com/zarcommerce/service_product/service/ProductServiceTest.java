package com.zarcommerce.service_product.service;

import com.zarcommerce.service_product.dto.CreateProductRequest;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private BrandRepository brandRepository;
    @Mock
    private ProductImageRepository productImageRepository;

    @InjectMocks
    private ProductService service;

    private CreateProductRequest validCreate(String name) {
        return new CreateProductRequest(
                name,
                100.0,
                "Elektronik",
                "https://example.com/img.png",
                "Açıklama",
                null,
                "Apple",
                "active",
                "standard",
                "TRY",
                true
        );
    }

    @BeforeEach
    void resetCommonStubs() {
        // No-op; lenient stubbing is configured per test
    }

    @Test
    void createProductPersistsTrimmedFieldsAndUsesGeneratedSlug() {
        when(categoryRepository.findByName("Elektronik")).thenReturn(Optional.empty());
        when(categoryRepository.existsBySlug(anyString())).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenAnswer(inv -> {
            Category c = inv.getArgument(0);
            c.setId(10L);
            return c;
        });
        when(brandRepository.findByName("Apple")).thenReturn(Optional.empty());
        when(brandRepository.existsBySlug(anyString())).thenReturn(false);
        when(brandRepository.save(any(Brand.class))).thenAnswer(inv -> {
            Brand b = inv.getArgument(0);
            b.setId(20L);
            return b;
        });
        when(productRepository.existsBySlug(anyString())).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> {
            Product p = inv.getArgument(0);
            p.setId(1L);
            return p;
        });
        ProductImage primaryImage = new ProductImage();
        primaryImage.setImageUrl("https://example.com/img.png");
        primaryImage.setPrimary(true);
        when(productImageRepository.findFirstByProduct_IdAndPrimaryTrueOrderBySortOrderAscIdAsc(1L))
                .thenReturn(Optional.empty(), Optional.of(primaryImage));

        CreateProductRequest req = validCreate("  iPhone 15 Pro  ");

        ProductResponse response = service.createProduct(req);

        ArgumentCaptor<Product> productCaptor = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(productCaptor.capture());
        Product saved = productCaptor.getValue();
        assertThat(saved.getName()).isEqualTo("iPhone 15 Pro");
        assertThat(saved.getSlug()).isEqualTo("iphone-15-pro");
        assertThat(saved.getBasePrice()).isEqualByComparingTo(BigDecimal.valueOf(100.0));
        assertThat(saved.getCurrency()).isEqualTo("TRY");
        assertThat(saved.getStatus()).isEqualTo("active");
        assertThat(saved.getTaxClass()).isEqualTo("standard");
        assertThat(saved.isActive()).isTrue();
        assertThat(saved.getCategory().getName()).isEqualTo("Elektronik");
        assertThat(saved.getBrand().getName()).isEqualTo("Apple");

        ArgumentCaptor<ProductImage> imageCaptor = ArgumentCaptor.forClass(ProductImage.class);
        verify(productImageRepository).save(imageCaptor.capture());
        assertThat(imageCaptor.getValue().getImageUrl()).isEqualTo("https://example.com/img.png");
        assertThat(imageCaptor.getValue().isPrimary()).isTrue();

        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.name()).isEqualTo("iPhone 15 Pro");
        assertThat(response.slug()).isEqualTo("iphone-15-pro");
        assertThat(response.imageUrl()).isEqualTo("https://example.com/img.png");
    }

    @Test
    void createProductReusesExistingCategoryAndBrand() {
        Category category = new Category();
        category.setId(5L);
        category.setName("Elektronik");
        category.setSlug("elektronik");
        Brand brand = new Brand();
        brand.setId(6L);
        brand.setName("Apple");
        brand.setSlug("apple");

        when(categoryRepository.findByName("Elektronik")).thenReturn(Optional.of(category));
        when(brandRepository.findByName("Apple")).thenReturn(Optional.of(brand));
        when(productRepository.existsBySlug(anyString())).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> {
            Product p = inv.getArgument(0);
            p.setId(2L);
            return p;
        });
        when(productImageRepository.findFirstByProduct_IdAndPrimaryTrueOrderBySortOrderAscIdAsc(2L))
                .thenReturn(Optional.empty());

        service.createProduct(validCreate("Mac Mini"));

        verify(categoryRepository, never()).save(any());
        verify(brandRepository, never()).save(any());
    }

    @Test
    void createProductAppendsSuffixWhenSlugExists() {
        when(categoryRepository.findByName("Elektronik")).thenReturn(Optional.of(buildCategory()));
        when(brandRepository.findByName("Apple")).thenReturn(Optional.of(buildBrand()));
        when(productRepository.existsBySlug("iphone")).thenReturn(true);
        when(productRepository.existsBySlug("iphone-1")).thenReturn(true);
        when(productRepository.existsBySlug("iphone-2")).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> {
            Product p = inv.getArgument(0);
            p.setId(99L);
            return p;
        });
        when(productImageRepository.findFirstByProduct_IdAndPrimaryTrueOrderBySortOrderAscIdAsc(99L))
                .thenReturn(Optional.empty());

        CreateProductRequest req = new CreateProductRequest(
                "iPhone", 50.0, "Elektronik",
                "https://x", null, null, "Apple",
                "active", "standard", "TRY", true
        );

        ProductResponse response = service.createProduct(req);

        assertThat(response.slug()).isEqualTo("iphone-2");
    }

    @Test
    void createProductSlugFallsBackToProductWhenInputCannotBeNormalised() {
        when(categoryRepository.findByName("Elektronik")).thenReturn(Optional.of(buildCategory()));
        when(productRepository.existsBySlug("product")).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> {
            Product p = inv.getArgument(0);
            p.setId(1L);
            return p;
        });
        when(productImageRepository.findFirstByProduct_IdAndPrimaryTrueOrderBySortOrderAscIdAsc(1L))
                .thenReturn(Optional.empty());

        CreateProductRequest req = new CreateProductRequest(
                "###",
                10.0,
                "Elektronik",
                null, null, null, null,
                "active", "standard", "TRY", true
        );

        ProductResponse response = service.createProduct(req);

        assertThat(response.slug()).isEqualTo("product");
    }

    @Test
    void createProductDoesNotPersistImageWhenUrlIsBlank() {
        when(categoryRepository.findByName("Elektronik")).thenReturn(Optional.of(buildCategory()));
        when(productRepository.existsBySlug(anyString())).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> {
            Product p = inv.getArgument(0);
            p.setId(1L);
            return p;
        });

        CreateProductRequest req = new CreateProductRequest(
                "Item", 10.0, "Elektronik",
                "   ", null, null, null,
                "active", "standard", "TRY", true
        );

        service.createProduct(req);

        verify(productImageRepository, never()).save(any());
    }

    @Test
    void createProductRejectsBlankName() {
        assertThatThrownBy(() -> service.createProduct(
                new CreateProductRequest(" ", 10.0, "C", null, null, null, null, "active", "standard", "TRY", true)
        )).isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Name is required");
    }

    @Test
    void createProductRejectsNegativePrice() {
        assertThatThrownBy(() -> service.createProduct(
                new CreateProductRequest("X", -1.0, "C", null, null, null, null, "active", "standard", "TRY", true)
        )).isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Valid price is required");
    }

    @Test
    void createProductRejectsBlankCategory() {
        assertThatThrownBy(() -> service.createProduct(
                new CreateProductRequest("X", 1.0, "  ", null, null, null, null, "active", "standard", "TRY", true)
        )).isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Category is required");
    }

    @Test
    void createProductRejectsInvalidStatus() {
        when(categoryRepository.findByName("Elektronik")).thenReturn(Optional.of(buildCategory()));

        CreateProductRequest req = new CreateProductRequest(
                "X", 1.0, "Elektronik", null, null, null, null,
                "weird-status", "standard", "TRY", true
        );

        assertThatThrownBy(() -> service.createProduct(req))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("status must be one of");
    }

    @Test
    void createProductRejectsInvalidCurrency() {
        when(categoryRepository.findByName("Elektronik")).thenReturn(Optional.of(buildCategory()));

        CreateProductRequest req = new CreateProductRequest(
                "X", 1.0, "Elektronik", null, null, null, null,
                "active", "standard", "Euro", true
        );

        assertThatThrownBy(() -> service.createProduct(req))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("currency must be a 3-letter code");
    }

    @Test
    void createProductDefaultsCurrencyAndTaxClassWhenBlank() {
        when(categoryRepository.findByName("Elektronik")).thenReturn(Optional.of(buildCategory()));
        when(productRepository.existsBySlug(anyString())).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> {
            Product p = inv.getArgument(0);
            p.setId(1L);
            return p;
        });

        CreateProductRequest req = new CreateProductRequest(
                "X", 1.0, "Elektronik", null, null, null, null,
                "active", "  ", "  ", null
        );

        service.createProduct(req);

        ArgumentCaptor<Product> captor = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(captor.capture());
        assertThat(captor.getValue().getCurrency()).isEqualTo("TRY");
        assertThat(captor.getValue().getTaxClass()).isEqualTo("standard");
        assertThat(captor.getValue().isActive()).isTrue();
    }

    @Test
    void getProductByIdMapsResponse() {
        Product product = new Product();
        product.setId(3L);
        product.setName("X");
        product.setSlug("x");
        product.setBasePrice(BigDecimal.valueOf(12.5));
        product.setStatus("active");
        product.setTaxClass("standard");
        product.setCurrency("TRY");
        product.setActive(true);

        when(productRepository.findById(3L)).thenReturn(Optional.of(product));
        when(productImageRepository.findFirstByProduct_IdAndPrimaryTrueOrderBySortOrderAscIdAsc(3L))
                .thenReturn(Optional.empty());

        ProductResponse response = service.getProductById(3L);

        assertThat(response.id()).isEqualTo(3L);
        assertThat(response.name()).isEqualTo("X");
        assertThat(response.imageUrl()).isNull();
    }

    @Test
    void getProductByIdThrowsNotFound() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getProductById(999L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Product not found");
    }

    @Test
    void updateProductBlankBrandRemovesBrand() {
        Product product = existingProduct();
        product.setBrand(buildBrand());
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));
        when(productImageRepository.findFirstByProduct_IdAndPrimaryTrueOrderBySortOrderAscIdAsc(1L))
                .thenReturn(Optional.empty());

        UpdateProductRequest req = new UpdateProductRequest(
                null, null, null, null, null, null, "  ", null, null, null, null
        );

        ProductResponse response = service.updateProduct(1L, req);

        assertThat(response.brand()).isNull();
        assertThat(product.getBrand()).isNull();
    }

    @Test
    void updateProductRejectsBlankNameWhenProvided() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(existingProduct()));

        UpdateProductRequest req = new UpdateProductRequest(
                "  ", null, null, null, null, null, null, null, null, null, null
        );

        assertThatThrownBy(() -> service.updateProduct(1L, req))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Name cannot be empty");
    }

    @Test
    void updateProductRejectsNegativePrice() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(existingProduct()));

        UpdateProductRequest req = new UpdateProductRequest(
                null, -1.0, null, null, null, null, null, null, null, null, null
        );

        assertThatThrownBy(() -> service.updateProduct(1L, req))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Invalid price");
    }

    @Test
    void updateProductRegeneratesSlugWhenNameChanges() {
        Product product = existingProduct();
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.existsBySlugAndIdNot(anyString(), eq(1L))).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));
        when(productImageRepository.findFirstByProduct_IdAndPrimaryTrueOrderBySortOrderAscIdAsc(1L))
                .thenReturn(Optional.empty());

        UpdateProductRequest req = new UpdateProductRequest(
                "Yeni Ürün İsmi", null, null, null, null, null, null, null, null, null, null
        );

        service.updateProduct(1L, req);

        assertThat(product.getName()).isEqualTo("Yeni Ürün İsmi");
        assertThat(product.getSlug()).isEqualTo("yeni-urun-ismi");
    }

    @Test
    void updateProductBlankSlugFallsBackToName() {
        Product product = existingProduct();
        product.setName("Hello World");
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.existsBySlugAndIdNot(anyString(), eq(1L))).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));
        when(productImageRepository.findFirstByProduct_IdAndPrimaryTrueOrderBySortOrderAscIdAsc(1L))
                .thenReturn(Optional.empty());

        UpdateProductRequest req = new UpdateProductRequest(
                null, null, null, null, null, "  ", null, null, null, null, null
        );

        service.updateProduct(1L, req);

        assertThat(product.getSlug()).isEqualTo("hello-world");
    }

    @Test
    void updateProductBlankDescriptionClearsField() {
        Product product = existingProduct();
        product.setDescription("eski");
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));
        when(productImageRepository.findFirstByProduct_IdAndPrimaryTrueOrderBySortOrderAscIdAsc(1L))
                .thenReturn(Optional.empty());

        UpdateProductRequest req = new UpdateProductRequest(
                null, null, null, null, "  ", null, null, null, null, null, null
        );

        service.updateProduct(1L, req);

        assertThat(product.getDescription()).isNull();
    }

    @Test
    void updateProductImageReusesExistingPrimary() {
        Product product = existingProduct();
        ProductImage existingImage = new ProductImage();
        existingImage.setId(50L);
        existingImage.setPrimary(true);
        existingImage.setImageUrl("old");
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));
        when(productImageRepository.findFirstByProduct_IdAndPrimaryTrueOrderBySortOrderAscIdAsc(1L))
                .thenReturn(Optional.of(existingImage));

        UpdateProductRequest req = new UpdateProductRequest(
                null, null, null, "https://new", null, null, null, null, null, null, null
        );

        service.updateProduct(1L, req);

        ArgumentCaptor<ProductImage> captor = ArgumentCaptor.forClass(ProductImage.class);
        verify(productImageRepository).save(captor.capture());
        assertThat(captor.getValue().getId()).isEqualTo(50L);
        assertThat(captor.getValue().getImageUrl()).isEqualTo("https://new");
    }

    @Test
    void deleteProductDeletesWhenFound() {
        Product product = existingProduct();
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        service.deleteProduct(1L);

        verify(productRepository).delete(product);
    }

    @Test
    void deleteProductThrowsNotFound() {
        when(productRepository.findById(2L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.deleteProduct(2L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Product not found");
    }

    private Category buildCategory() {
        Category c = new Category();
        c.setId(10L);
        c.setName("Elektronik");
        c.setSlug("elektronik");
        return c;
    }

    private Brand buildBrand() {
        Brand b = new Brand();
        b.setId(20L);
        b.setName("Apple");
        b.setSlug("apple");
        return b;
    }

    private Product existingProduct() {
        Product p = new Product();
        p.setId(1L);
        p.setName("Mevcut");
        p.setSlug("mevcut");
        p.setBasePrice(BigDecimal.valueOf(50));
        p.setStatus("active");
        p.setTaxClass("standard");
        p.setCurrency("TRY");
        p.setActive(true);
        p.setCategory(buildCategory());
        return p;
    }

}
