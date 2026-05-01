package com.zarcommerce.service_order.controller;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @GetMapping
    public List<OrderResponse> getOrders() {
        return List.of(
                new OrderResponse(1L, "ORD-001", "Ahmet Yilmaz", "ahmet@mail.com", LocalDate.of(2026, 4, 28), 2499.99, "completed", 3),
                new OrderResponse(2L, "ORD-002", "Ayse Demir", "ayse@mail.com", LocalDate.of(2026, 4, 27), 879.50, "shipped", 1),
                new OrderResponse(3L, "ORD-003", "Mehmet Kaya", "mehmet@mail.com", LocalDate.of(2026, 4, 26), 4590.00, "pending", 5),
                new OrderResponse(4L, "ORD-004", "Zeynep Celik", "zeynep@mail.com", LocalDate.of(2026, 4, 25), 320.75, "completed", 2),
                new OrderResponse(5L, "ORD-005", "Can Ozturk", "can@mail.com", LocalDate.of(2026, 4, 24), 1899.00, "cancelled", 1),
                new OrderResponse(6L, "ORD-006", "Elif Aksoy", "elif@mail.com", LocalDate.of(2026, 4, 23), 6750.25, "completed", 4),
                new OrderResponse(7L, "ORD-007", "Burak Sahin", "burak@mail.com", LocalDate.of(2026, 4, 22), 1450.00, "shipped", 2),
                new OrderResponse(8L, "ORD-008", "Selin Aydin", "selin@mail.com", LocalDate.of(2026, 4, 21), 999.99, "pending", 1)
        );
    }

    public record OrderResponse(Long id, String orderNumber, String customer, String email,
                                LocalDate date, Double total, String status, int items) {}
}
