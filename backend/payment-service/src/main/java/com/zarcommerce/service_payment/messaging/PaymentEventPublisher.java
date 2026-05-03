package com.zarcommerce.service_payment.messaging;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zarcommerce.service_payment.entity.Payment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.io.UncheckedIOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventPublisher {

	private final RabbitTemplate rabbitTemplate;
	private final ObjectMapper objectMapper;

	public void publishPaymentCompleted(Payment payment) {
		PaymentCompletedEvent event = new PaymentCompletedEvent(
				payment.getId(),
				payment.getConversationId(),
				payment.getBuyerEmail(),
				payment.getBuyerName(),
				payment.getPaidPrice(),
				payment.getCurrency(),
				payment.getIyzicoPaymentId()
		);
		final String json;
		try {
			json = objectMapper.writeValueAsString(event);
		} catch (JsonProcessingException e) {
			throw new UncheckedIOException("payment.completed serialization failed", e);
		}
		rabbitTemplate.convertAndSend(
				ZarcommerceEvents.EXCHANGE,
				ZarcommerceEvents.PAYMENT_COMPLETED_ROUTING_KEY,
				json
		);
		log.info("Published payment.completed to RabbitMQ paymentId={}", payment.getId());
	}
}
