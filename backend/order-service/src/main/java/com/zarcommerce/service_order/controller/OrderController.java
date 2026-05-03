package com.zarcommerce.service_order.controller;

import com.zarcommerce.service_order.dto.PaymentStatusResponse;
import com.zarcommerce.service_order.enums.PaymentStatus;
import com.zarcommerce.service_order.service.PaymentQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/orders")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class OrderController {

    private final PaymentQueryService paymentQueryService;

    @GetMapping
    public List<OrderResponse> getOrders() {
        return paymentQueryService.getAllPayments().stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    private OrderResponse mapToOrderResponse(PaymentStatusResponse payment) {
        String status = "pending";
        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            status = "completed";
        } else if (payment.getStatus() == PaymentStatus.FAILURE) {
            status = "cancelled";
        }

        return new OrderResponse(
                payment.getId(),
                "ORD-" + String.format("%04d", payment.getId()),
                payment.getBuyerName() != null ? payment.getBuyerName() : "Bilinmeyen Müşteri",
                payment.getBuyerEmail() != null ? payment.getBuyerEmail() : "email@yok.com",
                payment.getCreatedAt() != null ? payment.getCreatedAt().toLocalDate() : LocalDate.now(),
                payment.getPaidPrice() != null ? payment.getPaidPrice().doubleValue() : 0.0,
                status,
                1 // we don't store items count per order cleanly yet, defaulting to 1
        );
    }

    public record OrderResponse(Long id, String orderNumber, String customer, String email,
                                LocalDate date, Double total, String status, int items) {}
}
