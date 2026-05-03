package com.zarcommerce.service_order.service;

import com.zarcommerce.service_order.dto.PaymentStatusResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentQueryService {

    private final RestClient.Builder restClientBuilder;

    @Value("${payment.service.base-url:http://localhost:8085}")
    private String paymentServiceBaseUrl;

    public List<PaymentStatusResponse> getAllPayments() {
        RestClient restClient = restClientBuilder.baseUrl(paymentServiceBaseUrl).build();
        List<PaymentStatusResponse> response = restClient.get()
                .uri("/api/v1/payments")
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});
        return response != null ? response : List.of();
    }
}
