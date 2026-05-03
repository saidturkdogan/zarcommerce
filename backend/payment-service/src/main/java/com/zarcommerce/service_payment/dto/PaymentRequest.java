package com.zarcommerce.service_payment.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRequest {

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal price;

    @NotNull(message = "Paid price is required")
    @DecimalMin(value = "0.01", message = "Paid price must be greater than 0")
    private BigDecimal paidPrice;

    @NotBlank(message = "Currency is required")
    private String currency;

    @Builder.Default
    private Integer installment = 1;

    private String basketId;

    @NotNull(message = "Buyer information is required")
    @Valid
    private BuyerDto buyer;

    @NotNull(message = "Shipping address is required")
    @Valid
    private AddressDto shippingAddress;

    @NotNull(message = "Billing address is required")
    @Valid
    private AddressDto billingAddress;

    @NotEmpty(message = "At least one basket item is required")
    @Valid
    private List<BasketItemDto> basketItems;

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
        /** Required by iyzico (Buyer.gsmNumber). */
        @NotBlank(message = "GSM number is required")
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
        @NotBlank private String itemType;
        @NotNull @DecimalMin("0.01") private BigDecimal price;
    }
}
