package com.zarcommerce.service_order.messaging;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

/**
 * Payload is JSON {@link String} so the default {@link org.springframework.amqp.support.converter.SimpleMessageConverter}
 * applies; Java records are not Java-serializable for that converter.
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class PaymentCompletedListener {

	private final ObjectMapper objectMapper;

	@RabbitListener(queues = ZarcommerceEvents.PAYMENT_COMPLETED_QUEUE)
	public void onPaymentCompleted(String json) throws JsonProcessingException {
		PaymentCompletedEvent event = objectMapper.readValue(json, PaymentCompletedEvent.class);
		log.info(
				"Order service consumed payment.completed: paymentId={} conversationId={} buyerEmail={} paidPrice={} {}",
				event.paymentId(),
				event.conversationId(),
				event.buyerEmail(),
				event.paidPrice(),
				event.currency()
		);
	}
}
