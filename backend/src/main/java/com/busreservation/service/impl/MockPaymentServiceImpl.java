package com.busreservation.service.impl;

import com.busreservation.entity.Booking;
import com.busreservation.exception.PaymentException;
import com.busreservation.service.PaymentService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

/**
 * Mock implementation of PaymentService for development and testing.
 * This is a simplified version without refund functionality.
 */
@Service
public class MockPaymentServiceImpl implements PaymentService {

    @Override
    public String processRefund(Booking booking, BigDecimal amount) throws PaymentException {
        // Since we're not implementing refunds, we'll throw an exception
        throw new UnsupportedOperationException("Refund functionality is not implemented");
    }

    @Override
    public boolean isRefundable(Booking booking) {
        // Since we don't support refunds, always return false
        return false;
    }
}
