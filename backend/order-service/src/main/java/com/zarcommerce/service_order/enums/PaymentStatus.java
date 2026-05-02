package com.zarcommerce.service_order.enums;

/**
 * Payment lifecycle states.
 */
public enum PaymentStatus {
    /** Checkout form initialized, waiting for user to complete payment */
    INITIALIZED,
    /** Payment completed successfully */
    SUCCESS,
    /** Payment failed */
    FAILURE,
    /** Payment was cancelled by user */
    CANCELLED
}
