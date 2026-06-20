package com.example.usermanagementservice.controller;

import com.example.usermanagementservice.config.FeignConfig;
import com.example.usermanagementservice.dto.UserActivityDTO;
import com.example.usermanagementservice.model.User;
import com.example.usermanagementservice.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:8080", "http://localhost:8081", "http://localhost:8083", "http://localhost:8084"})
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @Operation(summary = "Get user activity - role and book count",
            description = "Returns a list of users along with their roles and the number of books they have fetched.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User activity data retrieved successfully")
    })
    // GET /api/users/activity-role
    @GetMapping("/activity-role")
    public List<UserActivityDTO> getUserRoleAndBookCount() {
        return userService.getUserRoleAndBookCount();
    }

    @Operation(summary = "Get user by email",
            description = "Returns a user that goes by that email.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User retrieved successfully")
    })
    @GetMapping("/findByEmail/{email}")
    public Optional<User> findByEmail(@PathVariable String email){
        return userService.findByEmail(email);
    }
}
