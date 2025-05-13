//package Delivery_driverService.controller;
//
//import Delivery_driverService.dto.DeliveryDriverRequest;
//import Delivery_driverService.dto.DeliveryDriverResponse;
//import Delivery_driverService.service.DeliveryDriverService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/deliveryDriver")
//@CrossOrigin(origins = "*")
//
//public class DeliveryDriverController {
//
//    private final DeliveryDriverService deliveryDriverService;
//
//    @Autowired
//    public DeliveryDriverController(DeliveryDriverService deliveryDriverService) {
//        this.deliveryDriverService = deliveryDriverService;
//    }
//
//    // CREATE: Add a new delivery driver
//    @PostMapping
//    public ResponseEntity<DeliveryDriverResponse> createDeliveryDriver(@RequestBody DeliveryDriverRequest driverRequest) {
//        try {
//            // Create the driver and return a ResponseEntity with the response
//            DeliveryDriverResponse driverResponse = deliveryDriverService.createDeliveryDriver(driverRequest);
//            return new ResponseEntity<>(driverResponse, HttpStatus.CREATED);
//        } catch (Exception e) {
//            // Handle errors and return an appropriate response
//            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
//        }
//    }
//
//    // READ: View all delivery drivers
//    @GetMapping
//    public ResponseEntity<List<DeliveryDriverResponse>> getAllDeliveryDrivers() {
//        try {
//            // Retrieve all drivers and return as a ResponseEntity
//            List<DeliveryDriverResponse> drivers = deliveryDriverService.getAllDeliveryDrivers();
//            return new ResponseEntity<>(drivers, HttpStatus.OK);
//        } catch (Exception e) {
//            // Handle errors and return an appropriate response
//            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
//        }
//    }
//
//    // READ: Get details of a specific driver by ID
////    @GetMapping("/{driverId}")
////    public ResponseEntity<DeliveryDriverResponse> getDeliveryDriverById(@PathVariable String driverId) {
////        try {
////            // Fetch the driver and return the response
////            DeliveryDriverResponse driverResponse = deliveryDriverService.getDeliveryDriverById(driverId);
////            return new ResponseEntity<>(driverResponse, HttpStatus.OK);
////        } catch (Exception e) {
////            // Handle errors if driver not found
////            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
////        }
////    }
//
//    // UPDATE: Update a driver's details
//    @PutMapping("/{driverId}")
//    public ResponseEntity<DeliveryDriverResponse> updateDeliveryDriver(
//            @PathVariable String driverId,
//            @RequestBody DeliveryDriverRequest driverRequest) {
//        try {
//            // Update the driver and return the response
//            DeliveryDriverResponse driverResponse = deliveryDriverService.updateDeliveryDriver(driverId, driverRequest);
//            return new ResponseEntity<>(driverResponse, HttpStatus.OK);
//        } catch (Exception e) {
//            // Handle errors if driver not found
//            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
//        }
//    }
//
//    // DELETE: Delete a driver by ID
//    @DeleteMapping("/{driverId}")
//    public ResponseEntity<Void> deleteDeliveryDriver(@PathVariable String driverId) {
//        try {
//            // Delete the driver and return a response
//            deliveryDriverService.deleteDeliveryDriver(driverId);
//            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
//        } catch (Exception e) {
//            // Handle errors if driver not found
//            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
//        }
//    }
//
//    @GetMapping("/city/{workingCity}")
//    public List<DeliveryDriverResponse> getDriversByWorkingCity(@PathVariable String workingCity) {
//        return deliveryDriverService.getDriversByWorkingCity(workingCity);
//    }
//}


package Delivery_driverService.controller;

import Delivery_driverService.dto.DeliveryDriverRequest;
import Delivery_driverService.dto.DeliveryDriverResponse;
import Delivery_driverService.service.IDeliveryDriverService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deliveryDriver")
@CrossOrigin(origins = "*")
public class DeliveryDriverController {

    private final IDeliveryDriverService deliveryDriverService;

    @Autowired
    public DeliveryDriverController(IDeliveryDriverService deliveryDriverService) {
        this.deliveryDriverService = deliveryDriverService;
    }

    @PostMapping
    public ResponseEntity<DeliveryDriverResponse> createDeliveryDriver(@RequestBody DeliveryDriverRequest driverRequest) {
        try {
            DeliveryDriverResponse driverResponse = deliveryDriverService.createDeliveryDriver(driverRequest);
            return new ResponseEntity<>(driverResponse, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping
    public ResponseEntity<List<DeliveryDriverResponse>> getAllDeliveryDrivers() {
        try {
            List<DeliveryDriverResponse> drivers = deliveryDriverService.getAllDeliveryDrivers();
            return new ResponseEntity<>(drivers, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{driverId}")
    public ResponseEntity<DeliveryDriverResponse> updateDeliveryDriver(
            @PathVariable String driverId,
            @RequestBody DeliveryDriverRequest driverRequest) {
        try {
            DeliveryDriverResponse driverResponse = deliveryDriverService.updateDeliveryDriver(driverId, driverRequest);
            return new ResponseEntity<>(driverResponse, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{driverId}")
    public ResponseEntity<Void> deleteDeliveryDriver(@PathVariable String driverId) {
        try {
            deliveryDriverService.deleteDeliveryDriver(driverId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/city/{workingCity}")
    public List<DeliveryDriverResponse> getDriversByWorkingCity(@PathVariable String workingCity) {
        return deliveryDriverService.getDriversByWorkingCity(workingCity);
    }
}

