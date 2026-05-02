package com.zarcommerce.service_order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Request DTO for initializing a checkout form payment.
 * Contains buyer information, addresses, and basket items.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRequest {

    /** Total price of all basket items */
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal price;

    /** Actual amount to be charged (may differ from price with discounts) */
    @NotNull(message = "Paid price is required")
    @DecimalMin(value = "0.01", message = "Paid price must be greater than 0")
    private BigDecimal paidPrice;

    /** Currency code: TRY, USD, EUR, GBP */
    @NotBlank(message = "Currency is required")
    private String currency;

    /** Number of installments (1 = no installment) */
    @Builder.Default
    private Integer installment = 1;

    /** Basket/cart identifier */
    private String basketId;

    /** Buyer details */
    @NotNull(message = "Buyer information is required")
    @Valid
    private BuyerDto buyer;

    /** Shipping address */
    @NotNull(message = "Shipping address is required")
    @Valid
    private AddressDto shippingAddress;

    /** Billing address */
    @NotNull(message = "Billing address is required")
    @Valid
    private AddressDto billingAddress;

    /** List of items in the basket */
    @NotEmpty(message = "At least one basket item is required")
    @Valid
    private List<BasketItemDto> basketItems;

    // ===== Inner DTOs =====

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BuyerDto {
        @NotBlank private String id;
        @NotBlank private String name;
        @NotBlank private String surname;
        @NotBlank @Email private String email;
        @NotBlank private String identityNumber;
        private String phoneNumber;
        private String registrationAddress;
        @NotBlank private String city;
        @NotBlank private String country;
        private String zipCode;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AddressDto {
        @NotBlank private String contactName;
        @NotBlank private String city;
        @NotBlank private String country;
        @NotBlank private String address;
        private String zipCode;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BasketItemDto {
        @NotBlank private String id;
        @NotBlank private String name;
        @NotBlank private String category1;
        private String category2;
        /** PHYSICAL or VIRTUAL */
        @NotBlank private String itemType;
        @NotNull @DecimalMin("0.01") private BigDecimal price;
    }
}
