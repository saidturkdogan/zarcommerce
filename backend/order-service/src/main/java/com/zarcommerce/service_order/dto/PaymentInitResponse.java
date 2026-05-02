package com.zarcommerce.service_order.dto;

import lombok.*;

/**
 * Response DTO returned after successfully initializing an iyzico checkout form.
 * Contains the token for tracking and the HTML/JS content for rendering the form.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentInitResponse {

    /** Status of the initialization: "success" or "failure" */
    private String status;

    /** Unique token for this checkout session */
    private String token;

    /**
     * HTML content containing iyzico's checkout form.
     * This should be injected into the frontend page to render the payment form.
     */
    private String checkoutFormContent;

    /** Conversation ID for tracking */
    private String conversationId;

    /** Payment record ID in our database */
    private Long paymentId;

    /** Error message if initialization failed */
    private String errorMessage;
}
