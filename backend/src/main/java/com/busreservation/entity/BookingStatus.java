package com.busreservation.entity;

/**
 * Represents the status of a booking in the system.
 * The status flow is as follows:
 * 1. CONFIRMED - The booking is active and confirmed
 * 2. CANCELLED - The booking is cancelled 
 */
public enum BookingStatus {
    /** The booking is active and confirmed */
    CONFIRMED,
    
    /** The booking is cancelled */
    CANCELLED
}
