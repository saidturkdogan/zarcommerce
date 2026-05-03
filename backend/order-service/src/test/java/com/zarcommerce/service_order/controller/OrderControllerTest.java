package com.zarcommerce.service_order.controller;

import com.zarcommerce.service_order.dto.PaymentStatusResponse;
import com.zarcommerce.service_order.enums.PaymentStatus;
import com.zarcommerce.service_order.service.PaymentQueryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class OrderControllerTest {

    @Mock
    private PaymentQueryService paymentQueryService;

    @InjectMocks
    private OrderController controller;

    private MockMvc mockMvc;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void getOrdersMapsSuccessFailureAndPendingStatuses() throws Exception {
        PaymentStatusResponse success = PaymentStatusResponse.builder()
                .id(1L)
                .status(PaymentStatus.SUCCESS)
                .buyerName("Ada Lovelace")
                .buyerEmail("ada@example.com")
                .paidPrice(new BigDecimal("125.50"))
                .createdAt(LocalDateTime.of(2026, 1, 2, 10, 0))
                .build();
        PaymentStatusResponse failure = PaymentStatusResponse.builder()
                .id(2L)
                .status(PaymentStatus.FAILURE)
                .build();
        PaymentStatusResponse pending = PaymentStatusResponse.builder()
                .id(3L)
                .status(PaymentStatus.INITIALIZED)
                .build();

        when(paymentQueryService.getAllPayments()).thenReturn(List.of(success, failure, pending));

        mockMvc.perform(get("/api/v1/orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].orderNumber").value("ORD-0001"))
                .andExpect(jsonPath("$[0].customer").value("Ada Lovelace"))
                .andExpect(jsonPath("$[0].email").value("ada@example.com"))
                .andExpect(jsonPath("$[0].total").value(125.50))
                .andExpect(jsonPath("$[0].status").value("completed"))
                .andExpect(jsonPath("$[0].items").value(1))
                .andExpect(jsonPath("$[1].status").value("cancelled"))
                .andExpect(jsonPath("$[1].customer").value("Bilinmeyen Müşteri"))
                .andExpect(jsonPath("$[1].email").value("email@yok.com"))
                .andExpect(jsonPath("$[1].total").value(0.0))
                .andExpect(jsonPath("$[2].status").value("pending"));
    }
}
