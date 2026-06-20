package org.example.bibliotekaui.feign_client;

import org.example.bibliotekaui.models.User;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

//@FeignClient(name = "user-service", url = "http://localhost:8081")
//@FeignClient(name = "user-service", url = "${user.service.url}")
@FeignClient(
        name = "gateway-service",
        url = "http://localhost:8080",
        contextId = "userClient"
)
public interface UserClient {
    @GetMapping("/users/{id}")
    User getUser(@PathVariable Long id);
}
