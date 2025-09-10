package com.busreservation.dto;

import com.busreservation.entity.Booking;
import com.busreservation.entity.Notification.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * DTO for sending notification messages through WebSocket
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationMessage {
    private String type;  // NotificationType as string
    private String title;  // Short title/heading
    private String message;  // Detailed message
    private String action;  // Action type (e.g., "refund-approved", "booking-cancelled")
    private Long bookingId;  // Related booking ID if applicable
    private String userEmail;  // Recipient email
    private LocalDateTime timestamp;  // When the notification was created
    private Object data;  // Additional data as needed

    /**
     * Creates a notification message for refund approval
     */
    public static NotificationMessage refundApproved(Booking booking, Double amount) {
        String message = String.format("Your refund of $%.2f for booking #%d has been approved.", 
            amount, booking.getId());
            
        return new NotificationMessage(
            NotificationType.REFUND_APPROVED.name(),
            "Refund Approved",
            message,
            "refund-approved",
            booking.getId(),
            booking.getUser().getEmail(),
            LocalDateTime.now(),
            Map.of("amount", amount, "bookingId", booking.getId())
        );
    }

    /**
     * Creates a notification message for refund rejection
     */
    public static NotificationMessage refundRejected(Booking booking, String reason) {
        String message = String.format("Your refund request for booking #%d has been rejected. Reason: %s", 
            booking.getId(), reason != null ? reason : "Not specified");
            
        return new NotificationMessage(
            NotificationType.REFUND_REJECTED.name(),
            "Refund Rejected",
            message,
            "refund-rejected",
            booking.getId(),
            booking.getUser().getEmail(),
            LocalDateTime.now(),
            Map.of("reason", reason, "bookingId", booking.getId())
        );
    }

    /**
     * Creates a notification message for booking cancellation
     */
    public static NotificationMessage bookingCancelled(Booking booking, String reason) {
        return new NotificationMessage(
            NotificationType.BOOKING_CANCELLATION.name(),
            "Booking Cancelled",
            String.format("Your booking #%d has been cancelled. %s", 
                booking.getId(), reason != null ? "Reason: " + reason : ""),
            "booking-cancelled",
            booking.getId(),
            booking.getUser().getEmail(),
            LocalDateTime.now(),
            Map.of("reason", reason, "bookingId", booking.getId())
        );
    }
}
