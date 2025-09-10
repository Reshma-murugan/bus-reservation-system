package com.busreservation.repository;

import com.busreservation.entity.Stop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StopRepository extends JpaRepository<Stop, Long> {
    Optional<Stop> findByName(String name);
    boolean existsByName(String name);
}