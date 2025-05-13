package com.foodDelivery.apiGateway.routes;

import com.foodDelivery.apiGateway.filters.JwtAuthFilter;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.server.mvc.filter.CircuitBreakerFilterFunctions;
import org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions;
import org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.function.*;

import java.net.URI;

import static org.springframework.cloud.gateway.server.mvc.filter.FilterFunctions.setPath;

@Configuration
@RequiredArgsConstructor
@CrossOrigin(origins = "http://127.0.0.1:3001/")
public class Routes {

    @Value("${user.service.url}")
    private String userServiceUrl;


    @Value("${restaurant.service.url}")
    private String restaurantServiceUrl;

    @Value("${order.service.url}")
    private String orderServiceUrl;

    @Value("${payment.service.url}")
    private String paymentServiceUrl;

    @Value("${delivery.service.url}")
    private String deliveryServiceUrl;

    @Value("${delivery.replication.service.url}")
    private String deliveryReplicationServiceUrl;

    @Value("${delivery.DeliveryLocationService.service.url}")
    private String DeliveryLocationServiceServiceUrl;

    @Value("${delivery.DeliveryDriverService.service.url}")
    private String DeliveryDriverServiceServiceUrl;

    @Value("${delivery.DeliveryDriverOrderService.service.url}")
    private String DeliveryDriverOrderServiceServiceUrl;


    private final JwtAuthFilter jwtAuthFilter;

    // Public auth routes - no authentication required
    @Bean
    public RouterFunction<ServerResponse> authServiceRoutes() {
        return GatewayRouterFunctions.route("auth_service")
                .route(RequestPredicates.path("/api/auth/**"),
                        HandlerFunctions.http(userServiceUrl))
                .filter(CircuitBreakerFilterFunctions.circuitBreaker("authServiceCircuitBreaker",
                        URI.create("forward:/fallbackRoute")))
                .build();
    }

    // Protected user routes - require authentication
    @Bean
    public RouterFunction<ServerResponse> userServiceRoutes() {
        return GatewayRouterFunctions.route("user_service")
                .route(RequestPredicates.path("/api/users/**"), HandlerFunctions.http(userServiceUrl))
                .filter((request, next) -> {
                    HttpServletRequest httpRequest = request.servletRequest();
                    boolean authenticated = jwtAuthFilter.isAuthenticated(httpRequest);
                    if (!authenticated) {
                        return ServerResponse.status(HttpStatus.UNAUTHORIZED)
                                .body("Access denied: Authentication required");
                    }
                    return next.handle(request);
                })
                .filter(CircuitBreakerFilterFunctions.circuitBreaker("userServiceCircuitBreaker",
                        URI.create("forward:/fallbackRoute")))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> userServiceReport() {
        return GatewayRouterFunctions.route("user_service_report")
                .route(RequestPredicates.path("/api/reports/**"), HandlerFunctions.http(userServiceUrl))
                .filter((request, next) -> {
                    HttpServletRequest httpRequest = request.servletRequest();
                    boolean authenticated = jwtAuthFilter.isAuthenticated(httpRequest);
                    if (!authenticated) {
                        return ServerResponse.status(HttpStatus.UNAUTHORIZED)
                                .body("Access denied: Authentication required");
                    }
                    return next.handle(request);
                })
                .filter(CircuitBreakerFilterFunctions.circuitBreaker("userServiceCircuitBreaker",
                        URI.create("forward:/fallbackRoute")))
                .build();
    }

    // Restaurant service routes
    @Bean
    public RouterFunction<ServerResponse> restaurantServiceRoutes() {
        return GatewayRouterFunctions.route("restaurant_service")
                // Put more specific route first
                .route(RequestPredicates.path("/api/restaurant/public/**"),
                        HandlerFunctions.http(restaurantServiceUrl))
                // Then the more general route
                .route(RequestPredicates.path("/api/restaurants/**"),
                        request -> {
                            HttpServletRequest httpRequest = request.servletRequest();
                            if (!jwtAuthFilter.isAuthenticated(httpRequest)) {
                                return ServerResponse.status(HttpStatus.UNAUTHORIZED)
                                        .body("Access denied: Authentication required");
                            }
                            return HandlerFunctions.http(restaurantServiceUrl).handle(request);
                        })
                .filter(CircuitBreakerFilterFunctions.circuitBreaker("restaurantServiceCircuitBreaker",
                        URI.create("forward:/fallbackRoute")))
                .build();
    }

    // DeliveryReplication service routes (no authentication required)
    @Bean
    public RouterFunction<ServerResponse> deliveryReplicationServiceRoutes() {
        return GatewayRouterFunctions.route("delivery_replication_service")
                .route(RequestPredicates.path("/api/deliveryReplication/**"),
                        HandlerFunctions.http(deliveryReplicationServiceUrl))
                .filter(CircuitBreakerFilterFunctions.circuitBreaker("deliveryReplicationServiceCircuitBreaker",
                        URI.create("forward:/fallbackRoute")))
                .build();
    }


    // DeliveryLocationService service routes (no authentication required)
    @Bean
    public RouterFunction<ServerResponse> DeliveryLocationServiceServiceRoutes() {
        return GatewayRouterFunctions.route("delivery_location_service")
                .route(RequestPredicates.path("/api/location/**"), HandlerFunctions.http(DeliveryLocationServiceServiceUrl))
                .filter(CircuitBreakerFilterFunctions.circuitBreaker("deliveryReplicationServiceCircuitBreaker",
                        URI.create("forward:/fallbackRoute")))
                .build();
    }

    // DeliveryDriverService service routes (no authentication required)
    @Bean
    public RouterFunction<ServerResponse> DeliveryDriverServiceServiceRoutes() {
        return GatewayRouterFunctions.route("delivery_driver_service")
                .route(RequestPredicates.path("/api/deliveryDriver/**"), HandlerFunctions.http(DeliveryDriverServiceServiceUrl))
                .filter(CircuitBreakerFilterFunctions.circuitBreaker("deliveryDriverServiceCircuitBreaker",
                        URI.create("forward:/fallbackRoute")))
                .build();
    }

    // DeliveryDriverOrderService service routes (no authentication required)
    @Bean
    public RouterFunction<ServerResponse> DeliveryDriverOrderServiceServiceRoutes() {
        return GatewayRouterFunctions.route("delivery_driver_order_service")
                .route(RequestPredicates.path("/api/driver-orders/**"), HandlerFunctions.http(DeliveryDriverOrderServiceServiceUrl))
                .filter(CircuitBreakerFilterFunctions.circuitBreaker("deliveryDriverOrderServiceCircuitBreaker",
                        URI.create("forward:/fallbackRoute")))
                .build();
    }



    // Order service routes - require authentication
    @Bean
    public RouterFunction<ServerResponse> orderServiceRoutes() {
        return GatewayRouterFunctions.route("order_service")
                // Public routes (no authentication required)
                .route(RequestPredicates.path("/api/orders/public/**"),
                        HandlerFunctions.http(orderServiceUrl))
                // Protected routes (authentication required)
                .route(RequestPredicates.path("/api/orders/**"),
                        request -> {
                            HttpServletRequest httpRequest = request.servletRequest();
                            if (!jwtAuthFilter.isAuthenticated(httpRequest)) {
                                return ServerResponse.status(HttpStatus.UNAUTHORIZED)
                                        .body("Access denied: Authentication required");
                            }
                            return HandlerFunctions.http(orderServiceUrl).handle(request);
                        })
                .filter(CircuitBreakerFilterFunctions.circuitBreaker("orderServiceCircuitBreaker",
                        URI.create("forward:/fallbackRoute")))
                .build();
    }

    // Payment service routes - require authentication
    @Bean
    public RouterFunction<ServerResponse> paymentServiceRoutes() {
        return GatewayRouterFunctions.route("payment_service")
                .route(RequestPredicates.path("/api/payments/**"), HandlerFunctions.http(paymentServiceUrl))
                .filter((request, next) -> {
                    HttpServletRequest httpRequest = request.servletRequest();
                    boolean authenticated = jwtAuthFilter.isAuthenticated(httpRequest);
                    if (!authenticated) {
                        return ServerResponse.status(HttpStatus.UNAUTHORIZED)
                                .body("Access denied: Authentication required");
                    }
                    return next.handle(request);
                })
                .filter(CircuitBreakerFilterFunctions.circuitBreaker("paymentServiceCircuitBreaker",
                        URI.create("forward:/fallbackRoute")))
                .build();
    }

    // Delivery service routes - require authentication
    @Bean
    public RouterFunction<ServerResponse> deliveryServiceRoutes() {
        return GatewayRouterFunctions.route("delivery_service")
                .route(RequestPredicates.path("/api/delivery/**"), HandlerFunctions.http(deliveryServiceUrl))
                .filter((request, next) -> {
                    HttpServletRequest httpRequest = request.servletRequest();
                    boolean authenticated = jwtAuthFilter.isAuthenticated(httpRequest);
                    if (!authenticated) {
                        return ServerResponse.status(HttpStatus.UNAUTHORIZED)
                                .body("Access denied: Authentication required");
                    }
                    return next.handle(request);
                })
                .filter(CircuitBreakerFilterFunctions.circuitBreaker("deliveryServiceCircuitBreaker",
                        URI.create("forward:/fallbackRoute")))
                .build();
    }

    // Swagger API Documentation Routes
    @Bean
    public RouterFunction<ServerResponse> userSwaggerRoute() {
        return GatewayRouterFunctions.route("user_service_swagger")
                .route(RequestPredicates.path("/aggregate/user-service/v3/api-docs"),
                        HandlerFunctions.http(userServiceUrl))
                .filter(setPath("/v3/api-docs"))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> restaurantSwaggerRoute() {
        return GatewayRouterFunctions.route("restaurant_service_swagger")
                .route(RequestPredicates.path("/aggregate/restaurant-service/v3/api-docs"),
                        HandlerFunctions.http(restaurantServiceUrl))
                .filter(setPath("/v3/api-docs"))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> orderSwaggerRoute() {
        return GatewayRouterFunctions.route("order_service_swagger")
                .route(RequestPredicates.path("/aggregate/order-service/v3/api-docs"),
                        HandlerFunctions.http(orderServiceUrl))
                .filter(setPath("/v3/api-docs"))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> paymentSwaggerRoute() {
        return GatewayRouterFunctions.route("payment_service_swagger")
                .route(RequestPredicates.path("/aggregate/payment-service/v3/api-docs"),
                        HandlerFunctions.http(paymentServiceUrl))
                .filter(setPath("/v3/api-docs"))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> deliverySwaggerRoute() {
        return GatewayRouterFunctions.route("delivery_service_swagger")
                .route(RequestPredicates.path("/aggregate/delivery-service/v3/api-docs"),
                        HandlerFunctions.http(deliveryServiceUrl))
                .filter(setPath("/v3/api-docs"))
                .build();
    }

    // Fallback route for circuit breaker
    @Bean
    public RouterFunction<ServerResponse> fallbackRoute() {
        return GatewayRouterFunctions.route("fallback_route")
                .GET("/fallbackRoute", request -> ServerResponse.status(HttpStatus.SERVICE_UNAVAILABLE)
                        .body("Service unavailable. Please try again later."))
                .build();
    }
}