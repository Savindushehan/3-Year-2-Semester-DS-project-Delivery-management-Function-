package com.foodDelivery.orderService.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemRequest {
    private String itemId;
    private String name;
    private double price;
    private int quantity;
    private double itemTotal;
    @Builder.Default
    private List<OrderItemAddOnRequest> addOns = new ArrayList<>();
}