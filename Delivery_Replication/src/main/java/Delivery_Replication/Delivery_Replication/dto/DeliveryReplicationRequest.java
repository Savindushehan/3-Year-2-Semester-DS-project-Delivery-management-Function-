package Delivery_Replication.Delivery_Replication.dto;

import java.sql.Time;
import java.util.Date;

public record DeliveryReplicationRequest(
        String orderId,
        String userId,
        String userName,
        String userPhoneNo,
        String restaurantId,
        String deliveryAddress,
        String[] orderItems,
        Double price,
        String orderDate,
        String orderTime,
        Boolean isAssignDriver,
        String driverId,
        String driverName,
        String driverPhoneNo,
        Boolean isOrderDeliveredComplete,
        String driverRemark,
        String userRemark
) {}
