package com.example.loanmanagementservice.controller;

import com.example.loanmanagementservice.model.Lending;
import com.example.loanmanagementservice.service.LendingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lendings")
@CrossOrigin(origins = {"http://localhost:8080", "http://localhost:8081", "http://localhost:8082"})
public class LendingController {

    @Autowired
    private LendingService lendingService;

    @Operation(summary = "Create a new lending record")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping
    public ResponseEntity<Lending> saveLending(@RequestBody Lending lending) {
        Lending saved = lendingService.saveLending(lending);
        return ResponseEntity.ok(saved);
    }

    @Operation(summary = "Get all the lending records")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping
    public ResponseEntity<List<Lending>> getAllLendings() {
        return ResponseEntity.ok(lendingService.getAllLendings());
    }

    @Operation(summary = "Get lending records by user email")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/user-email")
    public ResponseEntity<List<Lending>> getLendingsByUserEmail(@RequestParam String email) {
        return ResponseEntity.ok(lendingService.getLendingsByUserEmail(email));
    }
}
