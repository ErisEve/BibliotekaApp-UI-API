package com.example.librarymanagementservice.config;

import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.netflix.eureka.EurekaClientConfigBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableDiscoveryClient
public class EurekaDebugConfig {

    @Bean
    public EurekaClientConfigBean eurekaClientConfig() {
        EurekaClientConfigBean config = new EurekaClientConfigBean();
        config.setRegistryFetchIntervalSeconds(5);
        config.setInstanceInfoReplicationIntervalSeconds(5);
        config.setInitialInstanceInfoReplicationIntervalSeconds(5);

        // FIX: Use a Map instead of direct string
        Map<String, String> serviceUrl = new HashMap<>();
        serviceUrl.put("defaultZone", "http://localhost:8761/eureka/");
        config.setServiceUrl(serviceUrl);

        return config;
    }
}