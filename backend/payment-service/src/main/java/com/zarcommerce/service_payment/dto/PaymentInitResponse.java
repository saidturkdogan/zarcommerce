package com.zarcommerce.service_payment.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentInitResponse {

    private String status;
    private String token;
    private String checkoutFormContent;
    private String conversationId;
    private Long paymentId;
    private String errorMessage;
}
