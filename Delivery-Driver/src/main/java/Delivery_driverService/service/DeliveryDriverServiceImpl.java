//package Delivery_driverService.service;
//
//import Delivery_driverService.dto.DeliveryDriverRequest;
//import Delivery_driverService.dto.DeliveryDriverResponse;
//import Delivery_driverService.models.DeliveryDriver;
//import Delivery_driverService.repository.DeliveryDriverRepository;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.util.List;
//import java.util.Optional;
//
//@Service
//public class DeliveryDriverService {
//    private static final Logger logger = LoggerFactory.getLogger(DeliveryDriverService.class);
//
//    private final DeliveryDriverRepository deliveryDriverRepository;
//
//    @Autowired
//    public DeliveryDriverService(DeliveryDriverRepository deliveryDriverRepository) {
//        this.deliveryDriverRepository = deliveryDriverRepository;
//    }
//
//    // CREATE: Add a new driver
//    public DeliveryDriverResponse createDeliveryDriver(DeliveryDriverRequest driverRequest) {
//        // Map the DeliveryDriverRequest to DeliveryDriver entity
//        DeliveryDriver driver = new DeliveryDriver(
//                driverRequest.driverId(),
//                driverRequest.driverName(),
//                driverRequest.driverAddress(),
//                driverRequest.driverPhone(),
//                driverRequest.vehicleType(),
//                driverRequest.vehicleNumber(),
//                driverRequest.workingCity()
//
//        );
//
//        // Save the driver to the database
//        DeliveryDriver savedDriver = deliveryDriverRepository.save(driver);
//
//        logger.info("Created new delivery driver with ID: {}", savedDriver.getDriverId());
//
//        // Return the response DTO
//        return new DeliveryDriverResponse(
//                savedDriver.getDriverId(),
//                savedDriver.getDriverName(),
//                savedDriver.getDriverAddress(),
//                savedDriver.getDriverPhone(),
//                savedDriver.getVehicleType(),
//                savedDriver.getVehicleNumber(),
//                savedDriver.getWorkingCity()
//
//
//        );
//    }
//
//    // READ: View all drivers
//    public List<DeliveryDriverResponse> getAllDeliveryDrivers() {
//        List<DeliveryDriver> drivers = deliveryDriverRepository.findAll();
//
//        logger.info("Fetched {} delivery drivers", drivers.size());
//
//        // Map each driver to the response DTO
//        return drivers.stream().map(driver -> new DeliveryDriverResponse(
//                driver.getDriverId(),
//                driver.getDriverName(),
//                driver.getDriverAddress(),
//                driver.getDriverPhone(),
//                driver.getVehicleType(),
//                driver.getVehicleNumber(),
//                driver.getWorkingCity()
//
//        )).toList();
//    }
//
//    // UPDATE: Update a driver's information
//    public DeliveryDriverResponse updateDeliveryDriver(String driverId, DeliveryDriverRequest driverRequest) {
//        Optional<DeliveryDriver> optionalDriver = deliveryDriverRepository.findByDriverId(driverId);
//
//        if (optionalDriver.isPresent()) {
//            DeliveryDriver existingDriver = optionalDriver.get();
//
//            // Update the existing driver's details
//            existingDriver.setDriverName(driverRequest.driverName());
//            existingDriver.setDriverAddress(driverRequest.driverAddress());
//            existingDriver.setDriverPhone(driverRequest.driverPhone());
//            existingDriver.setVehicleType(driverRequest.vehicleType());
//            existingDriver.setVehicleNumber(driverRequest.vehicleNumber());
//            existingDriver.setWorkingCity(driverRequest.workingCity());
//
//
//            // Save the updated driver
//            DeliveryDriver updatedDriver = deliveryDriverRepository.save(existingDriver);
//
//            logger.info("Updated delivery driver with ID: {}", updatedDriver.getDriverId());
//
//            // Return the updated driver response
//            return new DeliveryDriverResponse(
//                    updatedDriver.getDriverId(),
//                    updatedDriver.getDriverName(),
//                    updatedDriver.getDriverAddress(),
//                    updatedDriver.getDriverPhone(),
//                    updatedDriver.getVehicleType(),
//                    updatedDriver.getVehicleNumber(),
//                    updatedDriver.getWorkingCity()
//
//            );
//        } else {
//            logger.error("Driver with ID: {} not found for update", driverId);
//            throw new IllegalArgumentException("Driver not found");
//        }
//    }
//
//    // DELETE: Delete a driver
//    @Transactional
//    public void deleteDeliveryDriver(String driverId) {
//        Optional<DeliveryDriver> optionalDriver = deliveryDriverRepository.findByDriverId(driverId);
//
//        if (optionalDriver.isPresent()) {
//            logger.info("Deleting delivery driver with ID: {}", driverId);
//
//            deliveryDriverRepository.deleteByDriverId(driverId); // use this instead
//
//            logger.info("Deleted delivery driver with ID: {}", driverId);
//        } else {
//            logger.error("Driver with ID: {} not found for deletion", driverId);
//            throw new IllegalArgumentException("Driver not found");
//        }
//    }
//
//
//
//
//    public List<DeliveryDriverResponse> getDriversByWorkingCity(String workingCity) {
//        List<DeliveryDriver> drivers = deliveryDriverRepository.findByWorkingCity(workingCity);
//        logger.info("Fetched {} delivery drivers in city: {}", drivers.size(), workingCity);
//
//        return drivers.stream().map(driver -> new DeliveryDriverResponse(
//                driver.getDriverId(),
//                driver.getDriverName(),
//                driver.getDriverAddress(),
//                driver.getDriverPhone(),
//                driver.getVehicleType(),
//                driver.getVehicleNumber(),
//                driver.getWorkingCity()
//        )).toList();
//    }
//
//
//    // Get delivery driver by ID
////    public DeliveryDriverResponse getDeliveryDriverById(String driverId) {
////        Optional<DeliveryDriver> driverOptional = deliveryDriverRepository.findById(driverId);
////        if (driverOptional.isPresent()) {
////            return new DeliveryDriverResponse(driverOptional.get());
////        } else {
////            throw new RuntimeException("Driver not found with id: " + driverId); // Handle it more gracefully if needed
////        }
////    }
//}


package Delivery_driverService.service;

import Delivery_driverService.dto.DeliveryDriverRequest;
import Delivery_driverService.dto.DeliveryDriverResponse;
import Delivery_driverService.models.DeliveryDriver;
import Delivery_driverService.repository.DeliveryDriverRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class DeliveryDriverServiceImpl implements IDeliveryDriverService {

    private static final Logger logger = LoggerFactory.getLogger(DeliveryDriverServiceImpl.class);

    private final DeliveryDriverRepository deliveryDriverRepository;

    @Autowired
    public DeliveryDriverServiceImpl(DeliveryDriverRepository deliveryDriverRepository) {
        this.deliveryDriverRepository = deliveryDriverRepository;
    }

    @Override
    public DeliveryDriverResponse createDeliveryDriver(DeliveryDriverRequest driverRequest) {
        DeliveryDriver driver = new DeliveryDriver(
                driverRequest.driverId(),
                driverRequest.driverName(),
                driverRequest.driverAddress(),
                driverRequest.driverPhone(),
                driverRequest.vehicleType(),
                driverRequest.vehicleNumber(),
                driverRequest.workingCity()
        );

        DeliveryDriver savedDriver = deliveryDriverRepository.save(driver);

        logger.info("Created new delivery driver with ID: {}", savedDriver.getDriverId());

        return new DeliveryDriverResponse(
                savedDriver.getDriverId(),
                savedDriver.getDriverName(),
                savedDriver.getDriverAddress(),
                savedDriver.getDriverPhone(),
                savedDriver.getVehicleType(),
                savedDriver.getVehicleNumber(),
                savedDriver.getWorkingCity()
        );
    }

    @Override
    public List<DeliveryDriverResponse> getAllDeliveryDrivers() {
        List<DeliveryDriver> drivers = deliveryDriverRepository.findAll();

        logger.info("Fetched {} delivery drivers", drivers.size());

        return drivers.stream().map(driver -> new DeliveryDriverResponse(
                driver.getDriverId(),
                driver.getDriverName(),
                driver.getDriverAddress(),
                driver.getDriverPhone(),
                driver.getVehicleType(),
                driver.getVehicleNumber(),
                driver.getWorkingCity()
        )).toList();
    }

    @Override
    public DeliveryDriverResponse updateDeliveryDriver(String driverId, DeliveryDriverRequest driverRequest) {
        Optional<DeliveryDriver> optionalDriver = deliveryDriverRepository.findByDriverId(driverId);

        if (optionalDriver.isPresent()) {
            DeliveryDriver existingDriver = optionalDriver.get();

            existingDriver.setDriverName(driverRequest.driverName());
            existingDriver.setDriverAddress(driverRequest.driverAddress());
            existingDriver.setDriverPhone(driverRequest.driverPhone());
            existingDriver.setVehicleType(driverRequest.vehicleType());
            existingDriver.setVehicleNumber(driverRequest.vehicleNumber());
            existingDriver.setWorkingCity(driverRequest.workingCity());

            DeliveryDriver updatedDriver = deliveryDriverRepository.save(existingDriver);

            logger.info("Updated delivery driver with ID: {}", updatedDriver.getDriverId());

            return new DeliveryDriverResponse(
                    updatedDriver.getDriverId(),
                    updatedDriver.getDriverName(),
                    updatedDriver.getDriverAddress(),
                    updatedDriver.getDriverPhone(),
                    updatedDriver.getVehicleType(),
                    updatedDriver.getVehicleNumber(),
                    updatedDriver.getWorkingCity()
            );
        } else {
            logger.error("Driver with ID: {} not found for update", driverId);
            throw new IllegalArgumentException("Driver not found");
        }
    }

    @Override
    @Transactional
    public void deleteDeliveryDriver(String driverId) {
        Optional<DeliveryDriver> optionalDriver = deliveryDriverRepository.findByDriverId(driverId);

        if (optionalDriver.isPresent()) {
            logger.info("Deleting delivery driver with ID: {}", driverId);
            deliveryDriverRepository.deleteByDriverId(driverId);
            logger.info("Deleted delivery driver with ID: {}", driverId);
        } else {
            logger.error("Driver with ID: {} not found for deletion", driverId);
            throw new IllegalArgumentException("Driver not found");
        }
    }

    @Override
    public List<DeliveryDriverResponse> getDriversByWorkingCity(String workingCity) {
        List<DeliveryDriver> drivers = deliveryDriverRepository.findByWorkingCity(workingCity);
        logger.info("Fetched {} delivery drivers in city: {}", drivers.size(), workingCity);

        return drivers.stream().map(driver -> new DeliveryDriverResponse(
                driver.getDriverId(),
                driver.getDriverName(),
                driver.getDriverAddress(),
                driver.getDriverPhone(),
                driver.getVehicleType(),
                driver.getVehicleNumber(),
                driver.getWorkingCity()
        )).toList();
    }
}
