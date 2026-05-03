package com.zarcommerce.service_payment.messaging;

import com.zarcommerce.service_payment.entity.Payment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventPublisher {

	private final RabbitTemplate rabbitTemplate;

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
		rabbitTemplate.convertAndSend(
				ZarcommerceEvents.EXCHANGE,
				ZarcommerceEvents.PAYMENT_COMPLETED_ROUTING_KEY,
				event
		);
		log.info("Published payment.completed to RabbitMQ paymentId={}", payment.getId());
	}
}
