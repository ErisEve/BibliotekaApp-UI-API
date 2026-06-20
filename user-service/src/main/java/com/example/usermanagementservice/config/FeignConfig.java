package com.example.usermanagementservice.config;

import feign.Logger;
import feign.Request;
import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FeignConfig {

    @Bean
    public Logger.Level feignLoggerLevel() {
        return Logger.Level.FULL;
    }

    @Bean
    public Request.Options options() {
        return new Request.Options(5000, 10000);  // Connection timeout, Read timeout
    }
    @Bean
    public RequestInterceptor internalServiceInterceptor() {
        return new RequestInterceptor() {
            @Override
            public void apply(RequestTemplate template) {
                template.header("X-Internal-Service", "true");
                // Or use a static token for internal communication
                template.header("Authorization", "Bearer internal-service-token");
            }
        };
    }


}