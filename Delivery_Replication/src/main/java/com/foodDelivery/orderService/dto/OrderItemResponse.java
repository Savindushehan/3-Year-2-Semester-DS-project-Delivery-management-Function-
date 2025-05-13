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
public class OrderItemResponse {
    private String itemId;
    private String name;
    private double price;
    private int quantity;
    private double itemTotal;
    private List<OrderItemAddOnResponse> addOns;
}
