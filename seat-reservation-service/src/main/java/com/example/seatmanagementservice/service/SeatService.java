package com.example.seatmanagementservice.service;

import com.example.seatmanagementservice.model.Seat;
import com.example.seatmanagementservice.repository.SeatRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SeatService {

    private final SeatRepository seatRepository;

    public SeatService(SeatRepository seatRepository) {
        this.seatRepository = seatRepository;
    }

    public List<Seat> findAll() {
        return seatRepository.fetchAllSeats();
    }

    public Seat reserveSeat(Long seatId,Long  userId){ return seatRepository.reserveSeat(seatId, userId);}

}
