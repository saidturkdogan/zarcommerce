package com.zarcommerce.service_product.controller;

import com.zarcommerce.service_product.dto.CreateProductRequest;
import com.zarcommerce.service_product.dto.ProductResponse;
import com.zarcommerce.service_product.dto.UpdateProductRequest;
import com.zarcommerce.service_product.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ProductControllerTest {

    @Mock
    private ProductService productService;

    @InjectMocks
    private ProductController controller;

    private MockMvc mockMvc;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void getProductsReturnsListFromService() throws Exception {
        ProductResponse a = new ProductResponse(1L, "A", "a", null, null, 5.0,
                "Cat", 1L, null, null, "active", "standard", "TRY", true);
        ProductResponse b = new ProductResponse(2L, "B", "b", null, null, 9.0,
                "Cat", 1L, null, null, "active", "standard", "TRY", true);
        when(productService.getAllProducts()).thenReturn(List.of(a, b));

        mockMvc.perform(get("/api/v1/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[1].name").value("B"));
    }

    @Test
    void getProductByIdReturnsResponse() throws Exception {
        ProductResponse response = new ProductResponse(7L, "X", "x", null, null, 12.0,
                "C", 2L, null, null, "active", "standard", "TRY", true);
        when(productService.getProductById(7L)).thenReturn(response);

        mockMvc.perform(get("/api/v1/products/7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(7))
                .andExpect(jsonPath("$.name").value("X"));
    }

    @Test
    void createProductDelegatesToService() throws Exception {
        ProductResponse response = new ProductResponse(1L, "iPhone", "iphone", null, null,
                100.0, "Cat", 1L, "Apple", 2L, "active", "standard", "TRY", true);
        when(productService.createProduct(any(CreateProductRequest.class))).thenReturn(response);

        String json = "{\"name\":\"iPhone\",\"price\":100.0,\"category\":\"Cat\",\"brand\":\"Apple\"," +
                "\"status\":\"active\",\"taxClass\":\"standard\",\"currency\":\"TRY\",\"active\":true}";

        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.slug").value("iphone"));
    }

    @Test
    void updateProductDelegatesToService() throws Exception {
        ProductResponse response = new ProductResponse(3L, "Yeni", "yeni", null, null,
                10.0, "Cat", 1L, null, null, "active", "standard", "TRY", true);
        when(productService.updateProduct(eq(3L), any(UpdateProductRequest.class))).thenReturn(response);

        String json = "{\"name\":\"Yeni\"}";

        mockMvc.perform(put("/api/v1/products/3")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Yeni"));
    }

    @Test
    void deleteProductReturnsOk() throws Exception {
        mockMvc.perform(delete("/api/v1/products/4"))
                .andExpect(status().isOk());

        verify(productService).deleteProduct(4L);
    }
}
