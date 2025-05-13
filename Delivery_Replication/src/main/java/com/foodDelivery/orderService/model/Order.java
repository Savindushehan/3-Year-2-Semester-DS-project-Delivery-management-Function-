package com.foodDelivery.orderService.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "orders")
public class Order {
    @Id
    private String id;
    private Long userId;
    private String restaurantId;
    private List<OrderItem> items;
    private ContactInfo contactInfo;
    private DeliveryAddress deliveryAddress;
    private String deliveryInstructions;
    private String paymentMethod;
    private OrderStatus status;
    private double subtotal;
    private double taxAmount;
    private double deliveryFee;
    private double discount;
    private double total;
    private Location deliveryLocation;
    private Location restaurantLocation;
    private PromotionDetails promotion;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    public static class Location {
        private double latitude;
        private double longitude;
        private String address;
        private String name; // Optional, used for restaurant location
    }

    @Data
    @Builder
    public static class PromotionDetails {
        private String code;
        private double discountAmount;
    }
}