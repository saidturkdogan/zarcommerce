package com.zarcommerce.service_order.entity;

import com.zarcommerce.service_order.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * JPA entity for persisting payment records.
 * Stores iyzico transaction data including token, status, and payment IDs.
 */
@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Unique conversation ID for tracking across iyzico calls */
    @Column(nullable = false, unique = true)
    private String conversationId;

    /** Checkout form token returned by iyzico */
    @Column(unique = true)
    private String token;

    /** Basket ID linking to the cart */
    private String basketId;

    /** Total price of items in the basket */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    /** Actual paid amount (may differ due to installments) */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal paidPrice;

    /** Currency code (TRY, USD, EUR, etc.) */
    @Column(nullable = false, length = 5)
    private String currency;

    /** Number of installments (1 = single payment) */
    private Integer installment;

    /** Current payment status */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status;

    /** iyzico's internal payment ID (returned after successful payment) */
    private String iyzicoPaymentId;

    /** iyzico's fraud status result */
    private Integer fraudStatus;

    /** Buyer email for reference */
    private String buyerEmail;

    /** Buyer name for reference */
    private String buyerName;

    /** Error message if payment failed */
    @Column(length = 500)
    private String errorMessage;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
