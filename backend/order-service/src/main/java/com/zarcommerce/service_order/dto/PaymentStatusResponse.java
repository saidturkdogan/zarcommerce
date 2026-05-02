package com.zarcommerce.service_order.dto;

import com.zarcommerce.service_order.enums.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Response DTO for querying payment status.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentStatusResponse {

    private Long id;
    private String conversationId;
    private String token;
    private BigDecimal price;
    private BigDecimal paidPrice;
    private String currency;
    private Integer installment;
    private PaymentStatus status;
    private String iyzicoPaymentId;
    private Integer fraudStatus;
    private String buyerEmail;
    private String buyerName;
    private String errorMessage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
