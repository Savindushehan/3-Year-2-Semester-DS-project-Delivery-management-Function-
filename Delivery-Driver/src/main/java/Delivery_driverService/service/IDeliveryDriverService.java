package Delivery_driverService.service;

import Delivery_driverService.dto.DeliveryDriverRequest;
import Delivery_driverService.dto.DeliveryDriverResponse;

import java.util.List;

public interface IDeliveryDriverService {
    DeliveryDriverResponse createDeliveryDriver(DeliveryDriverRequest driverRequest);

    List<DeliveryDriverResponse> getAllDeliveryDrivers();

    DeliveryDriverResponse updateDeliveryDriver(String driverId, DeliveryDriverRequest driverRequest);

    void deleteDeliveryDriver(String driverId);

    List<DeliveryDriverResponse> getDriversByWorkingCity(String workingCity);

    // Uncomment if you want to include this later
    // DeliveryDriverResponse getDeliveryDriverById(String driverId);
}
