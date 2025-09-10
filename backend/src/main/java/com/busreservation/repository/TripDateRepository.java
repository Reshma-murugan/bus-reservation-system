package com.busreservation.repository;

import com.busreservation.entity.TripDate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TripDateRepository extends JpaRepository<TripDate, Long> {
	// Add custom query methods if needed
}
