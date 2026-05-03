package com.zarcommerce.service_order.config;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleRuntimeExceptionReturns500() {
        ResponseEntity<Map<String, Object>> response = handler.handleRuntimeException(
                new RuntimeException("boom")
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).containsEntry("status", "error");
        assertThat(response.getBody()).containsEntry("message", "boom");
        assertThat(response.getBody()).containsKey("timestamp");
    }

    @Test
    void handleGenericExceptionReturns500WithGenericMessage() {
        ResponseEntity<Map<String, Object>> response = handler.handleGenericException(
                new Exception("hidden")
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).containsEntry("message", "An unexpected error occurred");
    }

    @Test
    @SuppressWarnings("unchecked")
    void handleValidationExceptionReturns400WithFieldErrors() {
        Object target = new Object();
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(target, "target");
        bindingResult.addError(new FieldError("target", "name", "must not be blank"));
        bindingResult.addError(new FieldError("target", "email", "must be a valid email"));

        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        when(ex.getBindingResult()).thenReturn(bindingResult);

        ResponseEntity<Map<String, Object>> response = handler.handleValidationException(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        Map<String, Object> body = response.getBody();
        assertThat(body).containsEntry("message", "Validation failed");
        Map<String, String> errors = (Map<String, String>) body.get("errors");
        assertThat(errors)
                .containsEntry("name", "must not be blank")
                .containsEntry("email", "must be a valid email");
    }
}
