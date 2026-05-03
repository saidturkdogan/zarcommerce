package com.zarcommerce.service_payment.service;

import com.iyzipay.Options;
import com.iyzipay.model.CheckoutForm;
import com.iyzipay.model.CheckoutFormInitialize;
import com.iyzipay.request.CreateCheckoutFormInitializeRequest;
import com.iyzipay.request.RetrieveCheckoutFormRequest;
import com.zarcommerce.service_payment.dto.PaymentInitResponse;
import com.zarcommerce.service_payment.dto.PaymentRequest;
import com.zarcommerce.service_payment.dto.PaymentStatusResponse;
import com.zarcommerce.service_payment.entity.Payment;
import com.zarcommerce.service_payment.enums.PaymentStatus;
import com.zarcommerce.service_payment.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.MockedStatic;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private Options iyzicoOptions;

    private PaymentService service;

    @BeforeEach
    void setup() {
        service = new PaymentService(iyzicoOptions, paymentRepository);
        ReflectionTestUtils.setField(service, "callbackUrl", "http://localhost:8085/callback");
        ReflectionTestUtils.setField(service, "frontendBaseUrl", "http://localhost:3000");
    }

    private PaymentRequest validRequest() {
        PaymentRequest.BuyerDto buyer = PaymentRequest.BuyerDto.builder()
                .id("BY-1").name("Ada").surname("Lovelace").email("ada@example.com")
                .identityNumber("11111111111").city("Istanbul").country("Turkey")
                .registrationAddress("Reg addr").build();
        PaymentRequest.AddressDto addr = PaymentRequest.AddressDto.builder()
                .contactName("Ada").city("Istanbul").country("Turkey").address("Some addr").build();
        PaymentRequest.BasketItemDto item = PaymentRequest.BasketItemDto.builder()
                .id("ITEM-1").name("X").category1("Cat").itemType("PHYSICAL").price(BigDecimal.TEN).build();
        return PaymentRequest.builder()
                .price(BigDecimal.TEN)
                .paidPrice(BigDecimal.TEN)
                .currency("TRY")
                .installment(1)
                .buyer(buyer)
                .shippingAddress(addr)
                .billingAddress(addr)
                .basketItems(List.of(item))
                .build();
    }

    @Test
    void initializeCheckoutFormPersistsInitializedPaymentOnSuccess() {
        CheckoutFormInitialize formInit = new CheckoutFormInitialize();
        formInit.setStatus("success");
        formInit.setToken("tk-1");
        formInit.setCheckoutFormContent("<html/>");

        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> {
            Payment p = inv.getArgument(0);
            p.setId(101L);
            return p;
        });

        PaymentInitResponse response;
        try (MockedStatic<CheckoutFormInitialize> mocked = mockStatic(CheckoutFormInitialize.class)) {
            mocked.when(() -> CheckoutFormInitialize.create(any(CreateCheckoutFormInitializeRequest.class), any(Options.class)))
                    .thenReturn(formInit);
            response = service.initializeCheckoutForm(validRequest());
        }

        ArgumentCaptor<Payment> captor = ArgumentCaptor.forClass(Payment.class);
        verify(paymentRepository).save(captor.capture());
        Payment saved = captor.getValue();
        assertThat(saved.getStatus()).isEqualTo(PaymentStatus.INITIALIZED);
        assertThat(saved.getToken()).isEqualTo("tk-1");
        assertThat(saved.getBuyerEmail()).isEqualTo("ada@example.com");
        assertThat(saved.getBuyerName()).isEqualTo("Ada Lovelace");
        assertThat(saved.getBasketId()).startsWith("B-");

        assertThat(response.getStatus()).isEqualTo("success");
        assertThat(response.getToken()).isEqualTo("tk-1");
        assertThat(response.getCheckoutFormContent()).isEqualTo("<html/>");
        assertThat(response.getPaymentId()).isEqualTo(101L);
        assertThat(response.getConversationId()).isNotBlank();
    }

    @Test
    void initializeCheckoutFormPersistsFailureOnIyzicoError() {
        CheckoutFormInitialize formInit = new CheckoutFormInitialize();
        formInit.setStatus("failure");
        formInit.setErrorMessage("invalid");

        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> {
            Payment p = inv.getArgument(0);
            p.setId(202L);
            return p;
        });

        PaymentInitResponse response;
        try (MockedStatic<CheckoutFormInitialize> mocked = mockStatic(CheckoutFormInitialize.class)) {
            mocked.when(() -> CheckoutFormInitialize.create(any(CreateCheckoutFormInitializeRequest.class), any(Options.class)))
                    .thenReturn(formInit);
            response = service.initializeCheckoutForm(validRequest());
        }

        ArgumentCaptor<Payment> captor = ArgumentCaptor.forClass(Payment.class);
        verify(paymentRepository).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(PaymentStatus.FAILURE);
        assertThat(captor.getValue().getErrorMessage()).isEqualTo("invalid");
        assertThat(response.getStatus()).isEqualTo("failure");
        assertThat(response.getPaymentId()).isEqualTo(202L);
    }

    @Test
    void handleCallbackUpdatesPaymentToSuccessAndReturnsRedirect() {
        Payment payment = Payment.builder()
                .id(7L).token("tk").status(PaymentStatus.INITIALIZED).build();
        when(paymentRepository.findByToken("tk")).thenReturn(Optional.of(payment));

        CheckoutForm form = new CheckoutForm();
        form.setStatus("success");
        form.setPaymentStatus("SUCCESS");
        form.setPaymentId("iyz-99");
        form.setFraudStatus(1);

        String redirect;
        try (MockedStatic<CheckoutForm> mocked = mockStatic(CheckoutForm.class)) {
            mocked.when(() -> CheckoutForm.retrieve(any(RetrieveCheckoutFormRequest.class), any(Options.class)))
                    .thenReturn(form);
            redirect = service.handleCallback("tk");
        }

        verify(paymentRepository).save(payment);
        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.SUCCESS);
        assertThat(payment.getIyzicoPaymentId()).isEqualTo("iyz-99");
        assertThat(payment.getFraudStatus()).isEqualTo(1);
        assertThat(redirect).isEqualTo("http://localhost:3000/payment/result?status=success&paymentId=7");
    }

    @Test
    void handleCallbackUpdatesPaymentToFailureAndReturnsFailureRedirect() {
        Payment payment = Payment.builder()
                .id(8L).token("tk").status(PaymentStatus.INITIALIZED).build();
        when(paymentRepository.findByToken("tk")).thenReturn(Optional.of(payment));

        CheckoutForm form = new CheckoutForm();
        form.setStatus("failure");
        form.setErrorMessage("declined");

        String redirect;
        try (MockedStatic<CheckoutForm> mocked = mockStatic(CheckoutForm.class)) {
            mocked.when(() -> CheckoutForm.retrieve(any(RetrieveCheckoutFormRequest.class), any(Options.class)))
                    .thenReturn(form);
            redirect = service.handleCallback("tk");
        }

        verify(paymentRepository).save(payment);
        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.FAILURE);
        assertThat(payment.getErrorMessage()).isEqualTo("declined");
        assertThat(redirect).isEqualTo("http://localhost:3000/payment/result?status=failure&paymentId=8");
    }

    @Test
    void handleCallbackThrowsWhenPaymentNotFound() {
        when(paymentRepository.findByToken("missing")).thenReturn(Optional.empty());

        CheckoutForm form = new CheckoutForm();
        form.setStatus("success");

        try (MockedStatic<CheckoutForm> mocked = mockStatic(CheckoutForm.class)) {
            mocked.when(() -> CheckoutForm.retrieve(any(RetrieveCheckoutFormRequest.class), any(Options.class)))
                    .thenReturn(form);

            assertThatThrownBy(() -> service.handleCallback("missing"))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Payment not found");
        }
    }

    @Test
    void getPaymentStatusReturnsMappedResponse() {
        Payment payment = Payment.builder()
                .id(1L).status(PaymentStatus.SUCCESS).buyerEmail("a@a").build();
        when(paymentRepository.findById(1L)).thenReturn(Optional.of(payment));

        PaymentStatusResponse response = service.getPaymentStatus(1L);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getStatus()).isEqualTo(PaymentStatus.SUCCESS);
        assertThat(response.getBuyerEmail()).isEqualTo("a@a");
    }

    @Test
    void getPaymentStatusThrowsWhenMissing() {
        when(paymentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getPaymentStatus(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Payment not found");
    }

    @Test
    void getPaymentStatusByTokenReturnsMappedResponse() {
        Payment payment = Payment.builder().id(2L).token("tk").status(PaymentStatus.INITIALIZED).build();
        when(paymentRepository.findByToken("tk")).thenReturn(Optional.of(payment));

        PaymentStatusResponse response = service.getPaymentStatusByToken("tk");

        assertThat(response.getId()).isEqualTo(2L);
        assertThat(response.getStatus()).isEqualTo(PaymentStatus.INITIALIZED);
    }

    @Test
    void getPaymentsByEmailReturnsMappedList() {
        Payment a = Payment.builder().id(1L).status(PaymentStatus.SUCCESS).buyerEmail("a@a").build();
        Payment b = Payment.builder().id(2L).status(PaymentStatus.FAILURE).buyerEmail("a@a").build();
        when(paymentRepository.findByBuyerEmailOrderByCreatedAtDesc("a@a")).thenReturn(List.of(a, b));

        List<PaymentStatusResponse> responses = service.getPaymentsByEmail("a@a");

        assertThat(responses).hasSize(2);
        assertThat(responses.get(0).getId()).isEqualTo(1L);
        assertThat(responses.get(1).getStatus()).isEqualTo(PaymentStatus.FAILURE);
    }

    @Test
    void getAllPaymentsReturnsMappedList() {
        Payment a = Payment.builder().id(10L).status(PaymentStatus.SUCCESS).build();
        when(paymentRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(a));

        List<PaymentStatusResponse> responses = service.getAllPayments();

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getId()).isEqualTo(10L);
    }
}
