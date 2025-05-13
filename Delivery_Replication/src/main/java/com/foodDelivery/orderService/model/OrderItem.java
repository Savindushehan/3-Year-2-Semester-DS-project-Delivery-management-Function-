package com.foodDelivery.orderService.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {
    private String itemId;
    private String name;
    private double price;
    private int quantity;
    private double itemTotal;
    @Builder.Default
    private List<OrderItemAddOn> addOns = new ArrayList<>();
}