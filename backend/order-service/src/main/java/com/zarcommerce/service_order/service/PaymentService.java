package com.zarcommerce.service_order.service;

import com.iyzipay.Options;
import com.iyzipay.model.*;
import com.iyzipay.request.CreateCheckoutFormInitializeRequest;
import com.iyzipay.request.RetrieveCheckoutFormRequest;
import com.zarcommerce.service_order.dto.PaymentInitResponse;
import com.zarcommerce.service_order.dto.PaymentRequest;
import com.zarcommerce.service_order.dto.PaymentStatusResponse;
import com.zarcommerce.service_order.entity.Payment;
import com.zarcommerce.service_order.enums.PaymentStatus;
import com.zarcommerce.service_order.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Core payment service that orchestrates iyzico Checkout Form flow.
 *
 * Flow:
 * 1. Frontend calls initializeCheckoutForm() → creates iyzico checkout session
 * 2. User fills in card details on iyzico's embedded form
 * 3. iyzico calls our callback URL → handleCallback() verifies and finalizes payment
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final Options iyzicoOptions;
    private final PaymentRepository paymentRepository;

    @Value("${iyzico.callback-url}")
    private String callbackUrl;

    /**
     * Initialize an iyzico Checkout Form session.
     * Creates the payment request, sends it to iyzico, and stores the initial record in DB.
     *
     * @param request payment details from the frontend
     * @return response containing token and embeddable checkout form HTML
     */
    @Transactional
    public PaymentInitResponse initializeCheckoutForm(PaymentRequest request) {
        String conversationId = UUID.randomUUID().toString().replace("-", "").substring(0, 20);

        log.info("Initializing checkout form | conversationId={} | price={} {}",
                conversationId, request.getPrice(), request.getCurrency());

        // Build iyzico request
        CreateCheckoutFormInitializeRequest iyzicoRequest = new CreateCheckoutFormInitializeRequest();
        iyzicoRequest.setLocale(Locale.TR.getValue());
        iyzicoRequest.setConversationId(conversationId);
        iyzicoRequest.setPrice(request.getPrice());
        iyzicoRequest.setPaidPrice(request.getPaidPrice());
        iyzicoRequest.setCurrency(Currency.TRY.name());
        iyzicoRequest.setBasketId(request.getBasketId() != null ? request.getBasketId() : "B-" + conversationId);
        iyzicoRequest.setPaymentGroup(PaymentGroup.PRODUCT.name());
        iyzicoRequest.setCallbackUrl(callbackUrl);

        if (request.getInstallment() != null && request.getInstallment() > 1) {
            iyzicoRequest.setEnabledInstallments(List.of(2, 3, 6, 9));
        }

        // Set buyer
        iyzicoRequest.setBuyer(buildBuyer(request.getBuyer()));

        // Set addresses
        iyzicoRequest.setShippingAddress(buildAddress(request.getShippingAddress()));
        iyzicoRequest.setBillingAddress(buildAddress(request.getBillingAddress()));

        // Set basket items
        iyzicoRequest.setBasketItems(buildBasketItems(request.getBasketItems()));

        // Call iyzico API
        CheckoutFormInitialize checkoutForm = CheckoutFormInitialize.create(iyzicoRequest, iyzicoOptions);

        log.info("Iyzico response | conversationId={} | status={} | errorCode={} | errorMessage={}",
                conversationId, checkoutForm.getStatus(),
                checkoutForm.getErrorCode(), checkoutForm.getErrorMessage());

        // Persist payment record
        Payment payment = Payment.builder()
                .conversationId(conversationId)
                .basketId(iyzicoRequest.getBasketId())
                .price(request.getPrice())
                .paidPrice(request.getPaidPrice())
                .currency(request.getCurrency())
                .installment(request.getInstallment() != null ? request.getInstallment() : 1)
                .buyerEmail(request.getBuyer().getEmail())
                .buyerName(request.getBuyer().getName() + " " + request.getBuyer().getSurname())
                .build();

        if ("success".equals(checkoutForm.getStatus())) {
            payment.setToken(checkoutForm.getToken());
            payment.setStatus(PaymentStatus.INITIALIZED);
        } else {
            payment.setStatus(PaymentStatus.FAILURE);
            payment.setErrorMessage(checkoutForm.getErrorMessage());
        }

        payment = paymentRepository.save(payment);

        return PaymentInitResponse.builder()
                .status(checkoutForm.getStatus())
                .token(checkoutForm.getToken())
                .checkoutFormContent(checkoutForm.getCheckoutFormContent())
                .conversationId(conversationId)
                .paymentId(payment.getId())
                .errorMessage(checkoutForm.getErrorMessage())
                .build();
    }

    /**
     * Handle the callback from iyzico after user completes payment on the checkout form.
     * Retrieves the payment result from iyzico and updates the DB record.
     *
     * @param token the checkout form token sent by iyzico
     * @return the redirect URL (success or failure page)
     */
    @Transactional
    public String handleCallback(String token) {
        log.info("Payment callback received | token={}", token);

        // Retrieve payment result from iyzico
        RetrieveCheckoutFormRequest retrieveRequest = new RetrieveCheckoutFormRequest();
        retrieveRequest.setLocale(Locale.TR.getValue());
        retrieveRequest.setToken(token);

        CheckoutForm checkoutForm = CheckoutForm.retrieve(retrieveRequest, iyzicoOptions);

        log.info("Iyzico retrieve result | token={} | status={} | paymentStatus={} | paymentId={}",
                token, checkoutForm.getStatus(), checkoutForm.getPaymentStatus(),
                checkoutForm.getPaymentId());

        // Find and update our payment record
        Payment payment = paymentRepository.findByToken(token)
                .orElseThrow(() -> {
                    log.error("Payment not found for token: {}", token);
                    return new RuntimeException("Payment not found for token: " + token);
                });

        if ("success".equals(checkoutForm.getStatus()) && checkoutForm.getPaymentStatus() != null
                && checkoutForm.getPaymentStatus().equals("SUCCESS")) {
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setIyzicoPaymentId(checkoutForm.getPaymentId());
            payment.setFraudStatus(checkoutForm.getFraudStatus());
            log.info("Payment SUCCESS | conversationId={} | iyzicoPaymentId={}",
                    payment.getConversationId(), checkoutForm.getPaymentId());
        } else {
            payment.setStatus(PaymentStatus.FAILURE);
            payment.setErrorMessage(checkoutForm.getErrorMessage());
            log.warn("Payment FAILURE | conversationId={} | error={}",
                    payment.getConversationId(), checkoutForm.getErrorMessage());
        }

        paymentRepository.save(payment);

        // Return redirect URL based on result
        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            return "http://localhost:3000/payment/result?status=success&paymentId=" + payment.getId();
        } else {
            return "http://localhost:3000/payment/result?status=failure&paymentId=" + payment.getId();
        }
    }

    /**
     * Get payment status by database ID.
     */
    public PaymentStatusResponse getPaymentStatus(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
        return mapToStatusResponse(payment);
    }

    /**
     * Get payment status by iyzico token.
     */
    public PaymentStatusResponse getPaymentStatusByToken(String token) {
        Payment payment = paymentRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Payment not found for token: " + token));
        return mapToStatusResponse(payment);
    }

    /**
     * Get all payments for a buyer email.
     */
    public List<PaymentStatusResponse> getPaymentsByEmail(String email) {
        return paymentRepository.findByBuyerEmailOrderByCreatedAtDesc(email)
                .stream()
                .map(this::mapToStatusResponse)
                .toList();
    }

    // ===== Private Helpers =====

    private Buyer buildBuyer(PaymentRequest.BuyerDto dto) {
        Buyer buyer = new Buyer();
        buyer.setId(dto.getId());
        buyer.setName(dto.getName());
        buyer.setSurname(dto.getSurname());
        buyer.setEmail(dto.getEmail());
        buyer.setIdentityNumber(dto.getIdentityNumber());
        buyer.setRegistrationAddress(dto.getRegistrationAddress() != null
                ? dto.getRegistrationAddress() : dto.getCity() + ", " + dto.getCountry());
        buyer.setCity(dto.getCity());
        buyer.setCountry(dto.getCountry());
        if (dto.getPhoneNumber() != null) {
            buyer.setGsmNumber(dto.getPhoneNumber());
        }
        if (dto.getZipCode() != null) {
            buyer.setZipCode(dto.getZipCode());
        }
        return buyer;
    }

    private Address buildAddress(PaymentRequest.AddressDto dto) {
        Address address = new Address();
        address.setContactName(dto.getContactName());
        address.setCity(dto.getCity());
        address.setCountry(dto.getCountry());
        address.setAddress(dto.getAddress());
        if (dto.getZipCode() != null) {
            address.setZipCode(dto.getZipCode());
        }
        return address;
    }

    private List<BasketItem> buildBasketItems(List<PaymentRequest.BasketItemDto> items) {
        List<BasketItem> basketItems = new ArrayList<>();
        for (PaymentRequest.BasketItemDto dto : items) {
            BasketItem item = new BasketItem();
            item.setId(dto.getId());
            item.setName(dto.getName());
            item.setCategory1(dto.getCategory1());
            if (dto.getCategory2() != null) {
                item.setCategory2(dto.getCategory2());
            }
            item.setItemType(dto.getItemType());
            item.setPrice(dto.getPrice());
            basketItems.add(item);
        }
        return basketItems;
    }

    private PaymentStatusResponse mapToStatusResponse(Payment payment) {
        return PaymentStatusResponse.builder()
                .id(payment.getId())
                .conversationId(payment.getConversationId())
                .token(payment.getToken())
                .price(payment.getPrice())
                .paidPrice(payment.getPaidPrice())
                .currency(payment.getCurrency())
                .installment(payment.getInstallment())
                .status(payment.getStatus())
                .iyzicoPaymentId(payment.getIyzicoPaymentId())
                .fraudStatus(payment.getFraudStatus())
                .buyerEmail(payment.getBuyerEmail())
                .buyerName(payment.getBuyerName())
                .errorMessage(payment.getErrorMessage())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .build();
    }
}
