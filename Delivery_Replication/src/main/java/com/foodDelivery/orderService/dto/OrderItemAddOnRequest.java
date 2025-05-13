package com.foodDelivery.orderService.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemAddOnRequest {
    private String addOnId;
    private String name;
    private double price;
}
