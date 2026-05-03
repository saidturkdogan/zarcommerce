package com.zarcommerce.service_payment.service;

import com.iyzipay.Options;
import com.iyzipay.model.*;
import com.iyzipay.request.CreateCheckoutFormInitializeRequest;
import com.iyzipay.request.RetrieveCheckoutFormRequest;
import com.zarcommerce.service_payment.dto.PaymentInitResponse;
import com.zarcommerce.service_payment.dto.PaymentRequest;
import com.zarcommerce.service_payment.dto.PaymentStatusResponse;
import com.zarcommerce.service_payment.entity.Payment;
import com.zarcommerce.service_payment.enums.PaymentStatus;
import com.zarcommerce.service_payment.messaging.PaymentEventPublisher;
import com.zarcommerce.service_payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final Options iyzicoOptions;
    private final PaymentRepository paymentRepository;
    private final PaymentEventPublisher paymentEventPublisher;

    @Value("${iyzico.callback-url}")
    private String callbackUrl;

    @Value("${iyzico.frontend-base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    @Transactional
    public PaymentInitResponse initializeCheckoutForm(PaymentRequest request) {
        String conversationId = UUID.randomUUID().toString().replace("-", "").substring(0, 20);

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

        iyzicoRequest.setBuyer(buildBuyer(request.getBuyer()));
        iyzicoRequest.setShippingAddress(buildAddress(request.getShippingAddress()));
        iyzicoRequest.setBillingAddress(buildAddress(request.getBillingAddress()));
        iyzicoRequest.setBasketItems(buildBasketItems(request.getBasketItems()));

        CheckoutFormInitialize checkoutForm = CheckoutFormInitialize.create(iyzicoRequest, iyzicoOptions);

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
            log.warn("Iyzico checkout init failed conversationId={} status={} error={}",
                    conversationId, checkoutForm.getStatus(), checkoutForm.getErrorMessage());
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

    @Transactional
    public String handleCallback(String token) {
        RetrieveCheckoutFormRequest retrieveRequest = new RetrieveCheckoutFormRequest();
        retrieveRequest.setLocale(Locale.TR.getValue());
        retrieveRequest.setToken(token);

        CheckoutForm checkoutForm = CheckoutForm.retrieve(retrieveRequest, iyzicoOptions);

        Payment payment = paymentRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Payment not found for token: " + token));

        if ("success".equals(checkoutForm.getStatus()) && "SUCCESS".equals(checkoutForm.getPaymentStatus())) {
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setIyzicoPaymentId(checkoutForm.getPaymentId());
            payment.setFraudStatus(checkoutForm.getFraudStatus());
        } else {
            payment.setStatus(PaymentStatus.FAILURE);
            payment.setErrorMessage(checkoutForm.getErrorMessage());
            log.warn("Iyzico callback unsuccessful paymentId={} token={} status={} paymentStatus={} error={}",
                    payment.getId(), token, checkoutForm.getStatus(), checkoutForm.getPaymentStatus(),
                    checkoutForm.getErrorMessage());
        }

        paymentRepository.save(payment);

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            paymentEventPublisher.publishPaymentCompleted(payment);
            return frontendBaseUrl + "/payment/result?status=success&paymentId=" + payment.getId();
        }
        return frontendBaseUrl + "/payment/result?status=failure&paymentId=" + payment.getId();
    }

    public PaymentStatusResponse getPaymentStatus(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
        return mapToStatusResponse(payment);
    }

    public PaymentStatusResponse getPaymentStatusByToken(String token) {
        Payment payment = paymentRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Payment not found for token: " + token));
        return mapToStatusResponse(payment);
    }

    public List<PaymentStatusResponse> getPaymentsByEmail(String email) {
        return paymentRepository.findByBuyerEmailOrderByCreatedAtDesc(email)
                .stream().map(this::mapToStatusResponse).toList();
    }

    public List<PaymentStatusResponse> getAllPayments() {
        return paymentRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::mapToStatusResponse).toList();
    }

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
        String gsm = dto.getPhoneNumber();
        if (!StringUtils.hasText(gsm)) {
            gsm = "+905555555555";
        } else {
            gsm = gsm.trim();
        }
        buyer.setGsmNumber(gsm);
        if (dto.getZipCode() != null) buyer.setZipCode(dto.getZipCode());
        return buyer;
    }

    private Address buildAddress(PaymentRequest.AddressDto dto) {
        Address address = new Address();
        address.setContactName(dto.getContactName());
        address.setCity(dto.getCity());
        address.setCountry(dto.getCountry());
        address.setAddress(dto.getAddress());
        if (dto.getZipCode() != null) address.setZipCode(dto.getZipCode());
        return address;
    }

    private List<BasketItem> buildBasketItems(List<PaymentRequest.BasketItemDto> items) {
        List<BasketItem> basketItems = new ArrayList<>();
        for (PaymentRequest.BasketItemDto dto : items) {
            BasketItem item = new BasketItem();
            item.setId(dto.getId());
            item.setName(dto.getName());
            item.setCategory1(dto.getCategory1());
            if (dto.getCategory2() != null) item.setCategory2(dto.getCategory2());
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
