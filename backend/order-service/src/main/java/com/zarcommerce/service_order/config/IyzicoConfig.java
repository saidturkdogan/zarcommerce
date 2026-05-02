package com.zarcommerce.service_order.config;

import com.iyzipay.Options;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Iyzico SDK configuration.
 * Reads API credentials from application.properties / environment variables.
 * Sandbox base URL: https://sandbox-api.iyzipay.com
 * Production base URL: https://api.iyzipay.com
 */
@Configuration
public class IyzicoConfig {

    @Value("${iyzico.api-key}")
    private String apiKey;

    @Value("${iyzico.secret-key}")
    private String secretKey;

    @Value("${iyzico.base-url}")
    private String baseUrl;

    @Bean
    public Options iyzicoOptions() {
        Options options = new Options();
        options.setApiKey(apiKey);
        options.setSecretKey(secretKey);
        options.setBaseUrl(baseUrl);
        return options;
    }
}
