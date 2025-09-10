package com.busreservation.repository;

import com.busreservation.entity.BusStop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BusStopRepository extends JpaRepository<BusStop, Long> {
    List<BusStop> findByBusIdOrderBySequenceOrder(Long busId);
    
    @Query("SELECT bs FROM BusStop bs WHERE bs.bus.id = :busId " +
           "AND bs.stop.name = :stopName")
    Optional<BusStop> findByBusIdAndStopName(@Param("busId") Long busId, 
                                           @Param("stopName") String stopName);
}