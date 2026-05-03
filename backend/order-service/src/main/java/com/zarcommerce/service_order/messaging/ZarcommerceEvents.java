package com.zarcommerce.service_order.messaging;

public final class ZarcommerceEvents {

	public static final String EXCHANGE = "zarcommerce.events";

	public static final String PAYMENT_COMPLETED_ROUTING_KEY = "payment.completed";

	public static final String PAYMENT_COMPLETED_QUEUE = "order-service.payment-completed";

	private ZarcommerceEvents() {
	}
}
