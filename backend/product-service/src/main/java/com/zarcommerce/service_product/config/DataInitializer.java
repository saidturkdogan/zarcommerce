package com.zarcommerce.service_product.config;

import com.zarcommerce.service_product.entity.Category;
import com.zarcommerce.service_product.entity.Product;
import com.zarcommerce.service_product.entity.ProductImage;
import com.zarcommerce.service_product.repository.CategoryRepository;
import com.zarcommerce.service_product.repository.ProductImageRepository;
import com.zarcommerce.service_product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductImageRepository productImageRepository;

    @Override
    public void run(String... args) {
        if (productRepository.count() > 0) {
            ensureStockPhotosForExistingProducts();
            return;
        }

        log.info("Seeding initial products...");

        Category electronics = createCategory("Elektronik");
        Category sports = createCategory("Spor");
        Category cosmetics = createCategory("Kozmetik");

        List<Product> products = List.of(
                createProduct("Premium Kablosuz Kulaklik", "premium-kablosuz-kulaklik", 1499.00, electronics),
                createProduct("Smartwatch Pro", "smartwatch-pro", 2299.00, electronics),
                createProduct("Spor Ayakkabi", "spor-ayakkabi", 1799.00, sports),
                createProduct("Cilt Bakim Seti", "cilt-bakim-seti", 899.00, cosmetics)
        );

        productRepository.saveAll(products);
        ensureStockPhotosForExistingProducts();
        log.info("Seeded {} products.", products.size());
    }

    private void ensureStockPhotosForExistingProducts() {
        Map<String, String> stockPhotos = new HashMap<>();
        stockPhotos.put("premium-kablosuz-kulaklik", "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=1200");
        stockPhotos.put("smartwatch-pro", "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=1200");
        stockPhotos.put("spor-ayakkabi", "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1200");
        stockPhotos.put("cilt-bakim-seti", "https://images.pexels.com/photos/6621337/pexels-photo-6621337.jpeg?auto=compress&cs=tinysrgb&w=1200");

        for (Product product : productRepository.findAll()) {
            boolean hasPrimary = productImageRepository
                    .findFirstByProduct_IdAndPrimaryTrueOrderBySortOrderAscIdAsc(product.getId())
                    .isPresent();
            if (hasPrimary) {
                continue;
            }

            String imageUrl = stockPhotos.getOrDefault(
                    product.getSlug(),
                    "https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=1200"
            );

            ProductImage image = new ProductImage();
            image.setProduct(product);
            image.setImageUrl(imageUrl);
            image.setPrimary(true);
            image.setSortOrder(0);
            productImageRepository.save(image);
        }
        log.info("Stock photos ensured for products.");
    }

    private Category createCategory(String name) {
        Category cat = new Category();
        cat.setName(name);
        cat.setSlug(name.toLowerCase().replace(" ", "-"));
        cat.setActive(true);
        cat.setSortOrder(0);
        return categoryRepository.save(cat);
    }

    private Product createProduct(String name, String slug, double price, Category category) {
        Product product = new Product();
        product.setName(name);
        product.setSlug(slug);
        product.setBasePrice(BigDecimal.valueOf(price));
        product.setCategory(category);
        product.setCurrency("TRY");
        product.setActive(true);
        product.setStatus("active");
        return product;
    }
}
