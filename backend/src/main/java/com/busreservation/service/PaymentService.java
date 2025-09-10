package com.busreservation.service;

import com.busreservation.entity.Booking;
import com.busreservation.exception.PaymentException;

import java.math.BigDecimal;

public interface PaymentService {
    /**
     * Process a refund for a booking
     * @param booking The booking to process refund for
     * @param amount The amount to refund (should be <= booking amount)
     * @return The transaction/reference ID for the refund
     * @throws PaymentException If the refund fails
     */
    String processRefund(Booking booking, BigDecimal amount) throws PaymentException;
    
    /**
     * Check if a payment is refundable
     * @param booking The booking to check
     * @return true if the payment can be refunded
     */
    boolean isRefundable(Booking booking);
}
