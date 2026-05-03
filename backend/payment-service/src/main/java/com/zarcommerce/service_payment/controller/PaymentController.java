package com.zarcommerce.service_payment.controller;

import com.zarcommerce.service_payment.dto.PaymentInitResponse;
import com.zarcommerce.service_payment.dto.PaymentRequest;
import com.zarcommerce.service_payment.dto.PaymentStatusResponse;
import com.zarcommerce.service_payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/checkout-form/initialize")
    public ResponseEntity<PaymentInitResponse> initializeCheckoutForm(@Valid @RequestBody PaymentRequest request) {
        PaymentInitResponse response = paymentService.initializeCheckoutForm(request);
        if ("success".equals(response.getStatus())) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }

    @PostMapping("/callback")
    public ResponseEntity<Void> handleCallback(@RequestParam("token") String token) {
        String redirectUrl = paymentService.handleCallback(token);
        return ResponseEntity.status(302).header("Location", redirectUrl).build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentStatusResponse> getPaymentStatus(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentStatus(id));
    }

    @GetMapping("/status/{token}")
    public ResponseEntity<PaymentStatusResponse> getPaymentStatusByToken(@PathVariable String token) {
        return ResponseEntity.ok(paymentService.getPaymentStatusByToken(token));
    }

    @GetMapping("/by-email")
    public ResponseEntity<List<PaymentStatusResponse>> getPaymentsByEmail(@RequestParam String email) {
        return ResponseEntity.ok(paymentService.getPaymentsByEmail(email));
    }

    @GetMapping
    public ResponseEntity<List<PaymentStatusResponse>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "payment-service",
                "provider", "iyzico-sandbox"
        ));
    }
}
