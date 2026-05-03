package com.zarcommerce.service_order.config;

import com.zarcommerce.service_order.messaging.ZarcommerceEvents;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqConfig {

	@Bean
	public TopicExchange zarcommerceEventsExchange() {
		return new TopicExchange(ZarcommerceEvents.EXCHANGE, true, false);
	}

	@Bean
	public Queue paymentCompletedQueue() {
		return new Queue(ZarcommerceEvents.PAYMENT_COMPLETED_QUEUE, true);
	}

	@Bean
	public Binding paymentCompletedBinding(Queue paymentCompletedQueue, TopicExchange zarcommerceEventsExchange) {
		return BindingBuilder.bind(paymentCompletedQueue)
				.to(zarcommerceEventsExchange)
				.with(ZarcommerceEvents.PAYMENT_COMPLETED_ROUTING_KEY);
	}
}
