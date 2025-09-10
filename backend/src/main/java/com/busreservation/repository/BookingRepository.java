package com.busreservation.repository;

import com.busreservation.entity.Booking;
import com.busreservation.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(Long userId);
    
    @Modifying
    @Transactional
    @Query("UPDATE Booking b SET b.status = :status, b.updatedAt = :updatedAt WHERE b.id = :bookingId")
    int updateBookingStatus(@Param("bookingId") Long bookingId, 
                          @Param("status") BookingStatus status,
                          @Param("updatedAt") java.time.LocalDateTime updatedAt);
                          
    @Query("SELECT b FROM Booking b WHERE b.seat.id = :seatId " +
           "AND b.journeyDate = :journeyDate " +
           "AND b.status != 'CANCELLED' " +
           "AND NOT (b.toSeq <= :fromSeq OR b.fromSeq >= :toSeq)")
    List<Booking> findConflictingBookings(@Param("seatId") Long seatId,
                                         @Param("journeyDate") LocalDate journeyDate,
                                         @Param("fromSeq") Integer fromSeq,
                                         @Param("toSeq") Integer toSeq);
                                         
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.bus.id = :busId AND b.createdAt BETWEEN :startDate AND :endDate")
    int countByBusIdAndCreatedAtBetween(@Param("busId") Long busId,
                                       @Param("startDate") LocalDateTime startDate,
                                       @Param("endDate") LocalDateTime endDate);
    
    List<Booking> findByJourneyDateBetweenAndStatus(LocalDate startDate, LocalDate endDate, BookingStatus status);
}