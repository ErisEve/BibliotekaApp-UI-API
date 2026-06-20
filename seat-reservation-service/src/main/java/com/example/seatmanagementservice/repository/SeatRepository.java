package com.example.seatmanagementservice.repository;

import com.example.seatmanagementservice.model.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {

//    @Query(value = """
//    SELECT fetched_by AS userEmail, COUNT(*) AS booksFetched
//    FROM books
//    WHERE fetched_by IS NOT NULL
//    GROUP BY fetched_by
//    ORDER BY booksFetched DESC
//    """, nativeQuery = true)
//    List<Object[]> findTopActiveUsers();

    @Query(value = """
    SELECT *
    FROM seats
    """, nativeQuery = true)
    List<Seat> fetchAllSeats();

}
