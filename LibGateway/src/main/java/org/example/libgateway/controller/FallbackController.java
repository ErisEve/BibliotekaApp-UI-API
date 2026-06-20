package org.example.libgateway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/fallback")
public class FallbackController {

    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> userServiceFallback() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "error");
        response.put("message", "User service is temporarily unavailable. Please try again later.");
        response.put("service", "user-service");
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }

    @GetMapping("/books")
    public ResponseEntity<Map<String, Object>> libraryServiceFallback() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "error");
        response.put("message", "Library service is temporarily unavailable. Please try again later.");
        response.put("service", "library-service");
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }

    @GetMapping("/loans")
    public ResponseEntity<Map<String, Object>> loanServiceFallback() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "error");
        response.put("message", "Loan service is temporarily unavailable. Please try again later.");
        response.put("service", "loan-service");
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }

    @GetMapping("/seats")
    public ResponseEntity<Map<String, Object>> seatServiceFallback() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "error");
        response.put("message", "Seat service is temporarily unavailable. Please try again later.");
        response.put("service", "seat-service");
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }


}