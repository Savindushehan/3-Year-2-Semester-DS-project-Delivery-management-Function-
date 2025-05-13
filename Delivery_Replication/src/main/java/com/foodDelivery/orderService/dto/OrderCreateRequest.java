package com.foodDelivery.orderService.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderCreateRequest {
    private Long userId;
    private String restaurantId;
    private List<OrderItemRequest> items;
    private ContactInfoRequest contactInfo;
    private DeliveryAddressRequest deliveryAddress;
    private String deliveryInstructions;
    private String paymentMethod;
    private double subtotal;
    private double taxAmount;
    private double deliveryFee;
    private double discount;
    private double total;
    private LocationRequest deliveryLocation;
    private LocationRequest restaurantLocation;
    private PromotionDetailsRequest promotion;
}


