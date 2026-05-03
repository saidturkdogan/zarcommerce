package com.zarcommerce.service_order.messaging;

import java.math.BigDecimal;

public record PaymentCompletedEvent(
		Long paymentId,
		String conversationId,
		String buyerEmail,
		String buyerName,
		BigDecimal paidPrice,
		String currency,
		String iyzicoPaymentId
) {
}
