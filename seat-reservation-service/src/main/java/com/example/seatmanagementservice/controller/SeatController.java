package com.example.seatmanagementservice.controller;

import com.example.seatmanagementservice.model.Seat;
import com.example.seatmanagementservice.service.SeatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.jpa.repository.Query;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Tag(name = "Seats", description = "Operations related to seats")
@RestController
@SecurityRequirement(name = "bearerAuth")
@RequestMapping("/api/seats")
public class SeatController {

    private final SeatService seatService;

    public SeatController(SeatService seatService) {
        this.seatService = seatService;
    }

    @Operation(summary = "Get all seats",
            description = "Returns a list of seats")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of seats retrieved successfully")
    })
    @GetMapping("")
    public List<Seat> getAllSeats() {
        List<Seat> seats = seatService.findAll();
        Collections.reverse(seats);
        return seats;
    }

    @PutMapping("/{seatId}/reserve")
    public ResponseEntity<Map<String, Object>> reserveSeatByPath(
            @PathVariable Long seatId,
            @RequestParam Long userId) {

        Map<String, Object> response = new HashMap<>();

        try {
            Seat reservedSeat = seatService.reserveSeat(seatId, userId);

            response.put("success", true);
            response.put("message", "Seat " + reservedSeat.getSeat_number() + " reserved successfully");
            response.put("seat", reservedSeat);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to reserve seat: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}

