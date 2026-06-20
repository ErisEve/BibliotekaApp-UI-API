package com.example.seatmanagementservice.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "seats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String seat_number;

    @Column(nullable = true)
    private String reserved_by;

}
