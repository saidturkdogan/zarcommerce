package com.zarcommerce.service_payment.controller;

import com.zarcommerce.service_payment.dto.PaymentInitResponse;
import com.zarcommerce.service_payment.dto.PaymentStatusResponse;
import com.zarcommerce.service_payment.enums.PaymentStatus;
import com.zarcommerce.service_payment.service.PaymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class PaymentControllerTest {

    @Mock
    private PaymentService paymentService;

    @InjectMocks
    private PaymentController controller;

    private MockMvc mockMvc;

    private static final String VALID_REQUEST_JSON = "{" +
            "\"price\":10," +
            "\"paidPrice\":10," +
            "\"currency\":\"TRY\"," +
            "\"installment\":1," +
            "\"buyer\":{" +
            "\"id\":\"BY-1\",\"name\":\"Ada\",\"surname\":\"Lovelace\"," +
            "\"email\":\"ada@example.com\",\"identityNumber\":\"11111111111\"," +
            "\"city\":\"Istanbul\",\"country\":\"Turkey\"}," +
            "\"shippingAddress\":{\"contactName\":\"Ada\",\"city\":\"Istanbul\"," +
            "\"country\":\"Turkey\",\"address\":\"Some addr\"}," +
            "\"billingAddress\":{\"contactName\":\"Ada\",\"city\":\"Istanbul\"," +
            "\"country\":\"Turkey\",\"address\":\"Some addr\"}," +
            "\"basketItems\":[{\"id\":\"ITEM-1\",\"name\":\"X\",\"category1\":\"Cat\"," +
            "\"itemType\":\"PHYSICAL\",\"price\":10}]}";

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void initializeReturns200OnSuccess() throws Exception {
        PaymentInitResponse resp = PaymentInitResponse.builder()
                .status("success").token("tk").paymentId(1L).build();
        when(paymentService.initializeCheckoutForm(any())).thenReturn(resp);

        mockMvc.perform(post("/api/v1/payments/checkout-form/initialize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_REQUEST_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.paymentId").value(1));
    }

    @Test
    void initializeReturns400OnFailure() throws Exception {
        PaymentInitResponse resp = PaymentInitResponse.builder()
                .status("failure").errorMessage("invalid").build();
        when(paymentService.initializeCheckoutForm(any())).thenReturn(resp);

        mockMvc.perform(post("/api/v1/payments/checkout-form/initialize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_REQUEST_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value("failure"));
    }

    @Test
    void callbackReturns302WithLocationHeader() throws Exception {
        when(paymentService.handleCallback("tk")).thenReturn("http://localhost:3000/payment/result?status=success&paymentId=5");

        mockMvc.perform(post("/api/v1/payments/callback").param("token", "tk"))
                .andExpect(status().isFound())
                .andExpect(header().string("Location",
                        "http://localhost:3000/payment/result?status=success&paymentId=5"));
    }

    @Test
    void getPaymentStatusReturnsResponse() throws Exception {
        PaymentStatusResponse resp = PaymentStatusResponse.builder()
                .id(3L).status(PaymentStatus.SUCCESS).build();
        when(paymentService.getPaymentStatus(3L)).thenReturn(resp);

        mockMvc.perform(get("/api/v1/payments/3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(3))
                .andExpect(jsonPath("$.status").value("SUCCESS"));
    }

    @Test
    void getPaymentStatusByTokenReturnsResponse() throws Exception {
        PaymentStatusResponse resp = PaymentStatusResponse.builder()
                .id(4L).token("tk").status(PaymentStatus.INITIALIZED).build();
        when(paymentService.getPaymentStatusByToken("tk")).thenReturn(resp);

        mockMvc.perform(get("/api/v1/payments/status/tk"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("tk"));
    }

    @Test
    void getPaymentsByEmailReturnsList() throws Exception {
        PaymentStatusResponse a = PaymentStatusResponse.builder().id(1L).build();
        PaymentStatusResponse b = PaymentStatusResponse.builder().id(2L).build();
        when(paymentService.getPaymentsByEmail("a@a")).thenReturn(List.of(a, b));

        mockMvc.perform(get("/api/v1/payments/by-email").param("email", "a@a"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[1].id").value(2));
    }

    @Test
    void getAllPaymentsReturnsList() throws Exception {
        PaymentStatusResponse a = PaymentStatusResponse.builder().id(7L).build();
        when(paymentService.getAllPayments()).thenReturn(List.of(a));

        mockMvc.perform(get("/api/v1/payments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(7));
    }

    @Test
    void healthReturnsServiceMetadata() throws Exception {
        mockMvc.perform(get("/api/v1/payments/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.service").value("payment-service"));
    }
}
