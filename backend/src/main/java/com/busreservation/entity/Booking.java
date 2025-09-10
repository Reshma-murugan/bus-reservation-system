package com.busreservation.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.Version;
import jakarta.persistence.Column;

@Entity
@Table(
    name = "bookings",
    uniqueConstraints = @UniqueConstraint(columnNames = {"bus_id", "seat_id", "journey_date"})
)
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "bus_id")
    private Bus bus;

    @ManyToOne
    @JoinColumn(name = "seat_id")
    private Seat seat;

        @Version
        private Integer version;

    private Integer fromSeq;
    private Integer toSeq;
    private String fromStopName;
    private String toStopName;
    private LocalDate journeyDate;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
    private BigDecimal amount;
    
    @Column(name = "payment_reference")
    private String paymentReference;
    
    @Column(name = "is_refund_processed")
    private Boolean isRefundProcessed = false;
    
    @Column(name = "refund_amount")
    private BigDecimal refundAmount;
    
    @Enumerated(EnumType.STRING)
    private BookingStatus status = BookingStatus.CONFIRMED;

    public Booking() {}

    public Booking(Long id, User user, Bus bus, Seat seat, Integer fromSeq, Integer toSeq, String fromStopName, String toStopName, LocalDate journeyDate, LocalDateTime createdAt, BigDecimal amount, BookingStatus status) {
        this.id = id;
        this.user = user;
        this.bus = bus;
        this.seat = seat;
        this.fromSeq = fromSeq;
        this.toSeq = toSeq;
        this.fromStopName = fromStopName;
        this.toStopName = toStopName;
        this.journeyDate = journeyDate;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
        this.amount = amount;
        this.status = status != null ? status : BookingStatus.CONFIRMED;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Bus getBus() { return bus; }
    public void setBus(Bus bus) { this.bus = bus; }
    public Seat getSeat() { return seat; }
    public void setSeat(Seat seat) { this.seat = seat; }
    public Integer getFromSeq() { return fromSeq; }
    public void setFromSeq(Integer fromSeq) { this.fromSeq = fromSeq; }
    public Integer getToSeq() { return toSeq; }
    public void setToSeq(Integer toSeq) { this.toSeq = toSeq; }
    public String getFromStopName() { return fromStopName; }
    public void setFromStopName(String fromStopName) { this.fromStopName = fromStopName; }
    public String getToStopName() { return toStopName; }
    public void setToStopName(String toStopName) { this.toStopName = toStopName; }
    public LocalDate getJourneyDate() { return journeyDate; }
    public void setJourneyDate(LocalDate journeyDate) { this.journeyDate = journeyDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { 
        if (status == null) {
            throw new IllegalArgumentException("Invalid status: " + status + ". Must be one of: " + 
                java.util.Arrays.toString(BookingStatus.values()));
        }
        this.status = status;
    }
    
    public String getPaymentReference() { return paymentReference; }
    public void setPaymentReference(String paymentReference) { this.paymentReference = paymentReference; }
    
    public boolean isRefundProcessed() { return isRefundProcessed; }
    public void setRefundProcessed(boolean refundProcessed) { isRefundProcessed = refundProcessed; }
    
    public BigDecimal getRefundAmount() { return refundAmount; }
    public void setRefundAmount(BigDecimal refundAmount) { this.refundAmount = refundAmount; }

    // Builder pattern
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id;
        private User user;
        private Bus bus;
        private Seat seat;
        private Integer fromSeq;
        private Integer toSeq;
        private String fromStopName;
        private String toStopName;
        private LocalDate journeyDate;
        private LocalDateTime createdAt;
        private BigDecimal amount;
        private BookingStatus status;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder user(User user) { this.user = user; return this; }
        public Builder bus(Bus bus) { this.bus = bus; return this; }
        public Builder seat(Seat seat) { this.seat = seat; return this; }
        public Builder fromSeq(Integer fromSeq) { this.fromSeq = fromSeq; return this; }
        public Builder toSeq(Integer toSeq) { this.toSeq = toSeq; return this; }
        public Builder fromStopName(String fromStopName) {
            this.fromStopName = fromStopName;
            return this;
        }
        
        public Builder toStopName(String toStopName) {
            this.toStopName = toStopName;
            return this;
        }
        
        public Builder journeyDate(LocalDate journeyDate) {
            this.journeyDate = journeyDate;
            return this;
        }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder amount(BigDecimal amount) { this.amount = amount; return this; }
        public Builder status(BookingStatus status) { this.status = status; return this; }
        public Booking build() {
            return new Booking(id, user, bus, seat, fromSeq, toSeq, fromStopName, toStopName, journeyDate, createdAt, amount, status);
        }
    }
}