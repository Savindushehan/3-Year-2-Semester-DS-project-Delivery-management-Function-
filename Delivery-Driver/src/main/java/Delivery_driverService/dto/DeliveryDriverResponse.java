package Delivery_driverService.dto;

public record DeliveryDriverResponse(
        String driverId,
        String driverName,
        String driverAddress,
        String driverPhone,
        String vehicleType,
        String vehicleNumber,
        String workingCity

) {}
