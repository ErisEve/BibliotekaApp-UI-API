package org.example.libgateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayRoutesConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // User Service
                .route("user-service", r -> r
                        .path("/api/users/**", "/api/auth/**", "api/users/findByEmail/**")
                        .filters(f -> f
                                .circuitBreaker(config -> config
                                        .setName("userServiceCB")
                                        .setFallbackUri("forward:/fallback/users"))
                                .stripPrefix(0))
                        .uri("lb://user-service"))

                // Library Service
                .route("library-management-service", r -> r
                        .path("/api/books/**")
                        .filters(f -> f
                                .circuitBreaker(config -> config
                                        .setName("libraryServiceCB")
                                        .setFallbackUri("forward:/fallback/books"))
                                .stripPrefix(0))
                        .uri("lb://library-service"))

                // Loan Service
                .route("loan-management-service", r -> r
                        .path("/api/loans/**")
                        .filters(f -> f
                                .circuitBreaker(config -> config
                                        .setName("loanServiceCB")
                                        .setFallbackUri("forward:/fallback/loans"))
                                .stripPrefix(0))
                        .uri("lb://loan-service"))

                // Seat Service
                .route("seat-management-service", r -> r
                        .path("/api/seats/**")
                        .filters(f -> f
                                .circuitBreaker(config -> config
                                        .setName("seatServiceCB")
                                        .setFallbackUri("forward:/fallback/seats"))
                                .stripPrefix(0))
                        .uri("lb://seat-service"))

                // Ui Service (Default)
                .route("ui-service", r -> r
                        .path("/**")
                        .filters(f -> f.stripPrefix(0))
                        .uri("http://localhost:8017"))

                .build();
    }
}