package com.foodDelivery.apiGateway.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI apiInfo() {
        return new OpenAPI()
                .info(new Info()
                        .title("Food Delivery API Gateway")
                        .description("API Gateway for Food Delivery Microservices")
                        .version("1.0.0"))
                .servers(List.of(
                        new Server().url("http://localhost:8081").description("Local Development")
                ));
    }

    @Bean
    public GroupedOpenApi authApis() {
        return GroupedOpenApi.builder()
                .group("auth-service")
                .pathsToMatch("/api/auth/**", "/api/password/**")
                .build();
    }

    @Bean
    public GroupedOpenApi userApis() {
        return GroupedOpenApi.builder()
                .group("user-service")
                .pathsToMatch("/api/users/**")
                .build();
    }

    @Bean
    public GroupedOpenApi restaurantApis() {
        return GroupedOpenApi.builder()
                .group("restaurant-service")
                .pathsToMatch("/api/restaurants/**")
                .build();
    }

    @Bean
    public GroupedOpenApi orderApis() {
        return GroupedOpenApi.builder()
                .group("order-service")
                .pathsToMatch("/api/orders/**")
                .build();
    }

    @Bean
    public GroupedOpenApi paymentApis() {
        return GroupedOpenApi.builder()
                .group("payment-service")
                .pathsToMatch("/api/payments/**")
                .build();
    }

    @Bean
    public GroupedOpenApi deliveryApis() {
        return GroupedOpenApi.builder()
                .group("delivery-service")
                .pathsToMatch("/api/delivery/**")
                .build();
    }
}