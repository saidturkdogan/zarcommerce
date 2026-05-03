package com.zarcommerce.service_order.messaging;

import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class PaymentCompletedListener {

	@RabbitListener(queues = ZarcommerceEvents.PAYMENT_COMPLETED_QUEUE)
	public void onPaymentCompleted(PaymentCompletedEvent event) {
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
