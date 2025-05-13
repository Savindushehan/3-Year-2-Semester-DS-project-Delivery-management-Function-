package com.foodDelivery.orderService.dto;

import com.foodDelivery.orderService.model.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private String id;
    private Long userId;
    private String restaurantId;
    private List<OrderItemResponse> items;
    private ContactInfoResponse contactInfo;
    private DeliveryAddressResponse deliveryAddress;
    private String deliveryInstructions;
    private String paymentMethod;
    private OrderStatus status;
    private double subtotal;
    private double taxAmount;
    private double deliveryFee;
    private double discount;
    private double total;
    private LocationResponse deliveryLocation;
    private LocationResponse restaurantLocation;
    private PromotionDetailsResponse promotion;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

