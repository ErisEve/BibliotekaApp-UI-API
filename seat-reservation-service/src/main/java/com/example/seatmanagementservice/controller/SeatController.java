package com.example.librarymanagementservice.controller;

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
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Tag(name = "Books", description = "Operations related to books")
@RestController
@SecurityRequirement(name = "bearerAuth")
@RequestMapping("/api/seats")
@CrossOrigin(origins = {"http://localhost:8080", "http://localhost:8082", "http://localhost:8083"})
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
    public List<Seat> getAllBooks() {
        List<Seat> books = seatService.findAll();
        Collections.reverse(books);
        return books;
    }

}
