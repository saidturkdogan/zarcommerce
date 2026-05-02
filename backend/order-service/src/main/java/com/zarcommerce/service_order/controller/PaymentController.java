package com.zarcommerce.service_order.controller;

import com.zarcommerce.service_order.dto.PaymentInitResponse;
import com.zarcommerce.service_order.dto.PaymentRequest;
import com.zarcommerce.service_order.dto.PaymentStatusResponse;
import com.zarcommerce.service_order.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for iyzico payment operations.
 * Provides endpoints for checkout form initialization, callbacks, and payment queries.
 */
@RestController
@RequestMapping("/api/v1/payments")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * Initialize an iyzico Checkout Form session.
     * Returns the checkout form HTML content that should be rendered on the frontend.
     *
     * POST /api/v1/payments/checkout-form/initialize
     */
    @PostMapping("/checkout-form/initialize")
    public ResponseEntity<PaymentInitResponse> initializeCheckoutForm(
            @Valid @RequestBody PaymentRequest request) {
        log.info("POST /checkout-form/initialize | price={} | buyer={}",
                request.getPrice(), request.getBuyer().getEmail());

        PaymentInitResponse response = paymentService.initializeCheckoutForm(request);

        if ("success".equals(response.getStatus())) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Callback endpoint called by iyzico after user completes payment.
     * iyzico sends a POST request with the token as form parameter.
     * Redirects user to the success or failure page.
     *
     * POST /api/v1/payments/callback
     */
    @PostMapping("/callback")
    public ResponseEntity<Void> handleCallback(@RequestParam("token") String token) {
        log.info("POST /callback | token={}", token);

        String redirectUrl = paymentService.handleCallback(token);

        return ResponseEntity
                .status(302)
                .header("Location", redirectUrl)
                .build();
    }

    /**
     * Get payment status by payment ID.
     *
     * GET /api/v1/payments/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<PaymentStatusResponse> getPaymentStatus(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentStatus(id));
    }

    /**
     * Get payment status by iyzico checkout token.
     *
     * GET /api/v1/payments/status/{token}
     */
    @GetMapping("/status/{token}")
    public ResponseEntity<PaymentStatusResponse> getPaymentStatusByToken(@PathVariable String token) {
        return ResponseEntity.ok(paymentService.getPaymentStatusByToken(token));
    }

    /**
     * Get all payments for a specific buyer email.
     *
     * GET /api/v1/payments/by-email?email=user@example.com
     */
    @GetMapping("/by-email")
    public ResponseEntity<List<PaymentStatusResponse>> getPaymentsByEmail(
            @RequestParam String email) {
        return ResponseEntity.ok(paymentService.getPaymentsByEmail(email));
    }

    /**
     * Health check endpoint for the payment service.
     *
     * GET /api/v1/payments/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "payment-service",
                "provider", "iyzico-sandbox"
        ));
    }
}
