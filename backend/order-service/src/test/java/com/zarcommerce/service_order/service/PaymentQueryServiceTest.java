package com.zarcommerce.service_order.service;

import com.zarcommerce.service_order.dto.PaymentStatusResponse;
import com.zarcommerce.service_order.enums.PaymentStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentQueryServiceTest {

    @Mock
    private RestClient.Builder restClientBuilder;
    @Mock
    private RestClient restClient;
    @Mock
    private RestClient.RequestHeadersUriSpec<?> requestHeadersUriSpec;
    @Mock
    private RestClient.RequestHeadersSpec<?> requestHeadersSpec;
    @Mock
    private RestClient.ResponseSpec responseSpec;

    private PaymentQueryService service;

    @BeforeEach
    void setup() {
        service = new PaymentQueryService(restClientBuilder);
        ReflectionTestUtils.setField(service, "paymentServiceBaseUrl", "http://payment");
    }

    @SuppressWarnings({"rawtypes", "unchecked"})
    private void wireRestClient(List<PaymentStatusResponse> body) {
        when(restClientBuilder.baseUrl("http://payment")).thenReturn(restClientBuilder);
        when(restClientBuilder.build()).thenReturn(restClient);
        RestClient.RequestHeadersUriSpec uriSpec = requestHeadersUriSpec;
        when(restClient.get()).thenReturn(uriSpec);
        when(uriSpec.uri(anyString())).thenReturn((RestClient.RequestHeadersSpec) requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.body(any(org.springframework.core.ParameterizedTypeReference.class)))
                .thenReturn(body);
    }

    @Test
    void getAllPaymentsReturnsListWhenBodyPresent() {
        PaymentStatusResponse payment = PaymentStatusResponse.builder()
                .id(1L)
                .status(PaymentStatus.SUCCESS)
                .paidPrice(BigDecimal.TEN)
                .build();
        wireRestClient(List.of(payment));

        List<PaymentStatusResponse> result = service.getAllPayments();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1L);
        verify(restClientBuilder).baseUrl("http://payment");
    }

    @Test
    void getAllPaymentsReturnsEmptyListWhenBodyIsNull() {
        wireRestClient(null);

        List<PaymentStatusResponse> result = service.getAllPayments();

        assertThat(result).isEmpty();
    }
}
