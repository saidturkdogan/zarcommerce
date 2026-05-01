package com.zarcommerce.service_product.config;

import com.zarcommerce.service_product.entity.Category;
import com.zarcommerce.service_product.entity.Product;
import com.zarcommerce.service_product.repository.CategoryRepository;
import com.zarcommerce.service_product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) {
        if (productRepository.count() > 0) {
            log.info("Products already exist, skipping seed.");
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
        log.info("Seeded {} products.", products.size());
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
