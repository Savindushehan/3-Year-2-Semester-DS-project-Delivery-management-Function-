package DriverOrderService.dto;

import java.sql.Time;
import java.util.Date;

public record DriverOrderResponse(
        String driverId,
        String orderId,
        String userId,
        String userName,
        String restaurantId,
        String deliveryAddress,
        String[] orderItems,
        Double price,
        String orderDate,
        String orderTime,
        Boolean isOrderComplete,
        String remarks
) {}
