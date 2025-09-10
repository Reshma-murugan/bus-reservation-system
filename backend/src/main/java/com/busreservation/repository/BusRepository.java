package com.busreservation.repository;

import com.busreservation.entity.Bus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BusRepository extends JpaRepository<Bus, Long> {
    @Query("SELECT DISTINCT b FROM Bus b " +
           "LEFT JOIN FETCH b.busStops bs " +
           "LEFT JOIN FETCH bs.stop " +
           "ORDER BY b.id, bs.sequenceOrder")
    List<Bus> findAllWithStops();
    List<Bus> findByActiveTrue();
    
    @Query("SELECT DISTINCT b FROM Bus b JOIN b.busStops bs1 JOIN b.busStops bs2 " +
           "WHERE UPPER(TRIM(bs1.stop.name)) = UPPER(TRIM(:fromStop)) AND UPPER(TRIM(bs2.stop.name)) = UPPER(TRIM(:toStop)) " +
           "AND bs1.sequenceOrder < bs2.sequenceOrder AND b.active = true")
    List<Bus> findBusesForRoute(@Param("fromStop") String fromStop, 
                               @Param("toStop") String toStop);
}