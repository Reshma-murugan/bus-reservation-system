package com.busreservation.entity;

import lombok.Data;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String message;
    
    @Column(nullable = false)
    private boolean isRead = false;
    
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column
    private LocalDateTime readAt;
    
    @Enumerated(EnumType.STRING)
    private NotificationType type;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;
    
    @Column
    private Double refundAmount;
    
    @Enumerated(EnumType.STRING)
    private NotificationStatus status = NotificationStatus.PENDING;
    
    public enum NotificationType {
        BOOKING_CONFIRMATION,
        BOOKING_CANCELLATION,
        REFUND_REQUEST,
        REFUND_APPROVED,
        REFUND_REJECTED,
        PAYMENT_FAILED,
        PAYMENT_REFUNDED,
        PAYMENT_DECLINED,
        SEAT_UPDATED,
        TRIP_CANCELLED,
        TRIP_DELAYED,
        SYSTEM_ALERT,
        ADMIN_NOTIFICATION
    }
    
    public enum NotificationStatus {
        PENDING,
        PROCESSED,
        REJECTED
    }
}
