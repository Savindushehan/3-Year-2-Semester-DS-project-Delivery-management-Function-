//package Delivery_Replication.Delivery_Replication.controller;
//
//import Delivery_Replication.Delivery_Replication.dto.DeliveryReplicationRequest;
//import Delivery_Replication.Delivery_Replication.dto.DeliveryReplicationResponse;
//import Delivery_Replication.Delivery_Replication.models.DeliveryReplication;
//import Delivery_Replication.Delivery_Replication.service.DeliveryReplicationService;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/deliveryReplication")
//@CrossOrigin(origins = "*") // Allow any origin to access this API
//public class DeliveryReplicationController {
//
//    DeliveryReplication delivery = new DeliveryReplication();
//    private final DeliveryReplicationService deliveryReplicationService;
//
//    public DeliveryReplicationController(DeliveryReplicationService deliveryReplicationService) {
//        this.deliveryReplicationService = deliveryReplicationService;
//    }
//
//    @GetMapping
//    public List<DeliveryReplicationResponse> getAllDeliveries() {
//        return deliveryReplicationService.getAllDeliveryReplicationResponses();
//    }
//
//
//
//    @PostMapping
//    @ResponseStatus(HttpStatus.CREATED)
//    public DeliveryReplicationResponse createDelivery(@RequestBody DeliveryReplicationRequest request) {
//        return deliveryReplicationService.createDeliveryReplication(request);
//    }
//
//    @DeleteMapping("/{id}")
//    @ResponseStatus(HttpStatus.NO_CONTENT)
//    public void deleteDelivery(@PathVariable String id) {
//        deliveryReplicationService.deleteDeliveryReplication(id);
//    }
//
//    // Updated method to return a list of responses based on isAssignDriver
//    @GetMapping("/by-assign-driver")
//    public List<DeliveryReplicationResponse> getDeliveriesByAssignDriver() {
//        return deliveryReplicationService.getDeliveriesByAssignDriver(false);
//    }
//
//    @PutMapping("/{orderId}")
//    public ResponseEntity<DeliveryReplicationResponse> updateDelivery(
//            @PathVariable String orderId,
//            @RequestBody DeliveryReplicationRequest request) {
//        DeliveryReplicationResponse updated = deliveryReplicationService.updateDeliveryReplication(orderId,delivery );
//        return ResponseEntity.ok(updated);
//    }
//
//
//}


package Delivery_Replication.Delivery_Replication.controller;

import Delivery_Replication.Delivery_Replication.dto.DeliveryReplicationRequest;
import Delivery_Replication.Delivery_Replication.dto.DeliveryReplicationResponse;
import Delivery_Replication.Delivery_Replication.models.DeliveryReplication;
import Delivery_Replication.Delivery_Replication.service.DeliveryReplicationService;
import Delivery_Replication.Delivery_Replication.service.IDeliveryReplicationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deliveryReplication")
public class DeliveryReplicationController {

    DeliveryReplication delivery = new DeliveryReplication();
    private final IDeliveryReplicationService deliveryReplicationService;

    public DeliveryReplicationController(DeliveryReplicationService deliveryReplicationService) {
        this.deliveryReplicationService = deliveryReplicationService;
    }

    @GetMapping
    public List<DeliveryReplicationResponse> getAllDeliveries() {
        return deliveryReplicationService.getAllDeliveryReplicationResponses();
    }


    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DeliveryReplicationResponse createDelivery(DeliveryReplication deliveryReplication) {
        return deliveryReplicationService.createDeliveryReplication(deliveryReplication);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDelivery(@PathVariable String id) {
        deliveryReplicationService.deleteDeliveryReplication(id);
    }

    // Updated method to return a list of responses based on isAssignDriver
    @GetMapping("/by-assign-driver")
    public List<DeliveryReplicationResponse> getDeliveriesByAssignDriver() {
        return deliveryReplicationService.getDeliveriesByAssignDriver();
    }

    @PutMapping("/{orderId}")
    public ResponseEntity<DeliveryReplicationResponse> updateDelivery(
            @PathVariable String orderId,
            @RequestBody DeliveryReplicationRequest request) {
        DeliveryReplicationResponse updated = deliveryReplicationService.updateDeliveryReplication(orderId,delivery );
        return ResponseEntity.ok(updated);
    }


    @PutMapping("driver/{orderId}")
    public ResponseEntity<DeliveryReplicationResponse> updateDeliveryDriver(
            @PathVariable String orderId,
            @RequestBody DeliveryReplication request) {  // Make sure this is the correct model (not DTO)
        DeliveryReplicationResponse updated = deliveryReplicationService.updateDeliveryReplicationDriver(orderId, request);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<DeliveryReplicationResponse> getDeliveryByOrderId(@PathVariable String orderId) {
        DeliveryReplicationResponse response = deliveryReplicationService.getDeliveryReplicationByOrderId(orderId);
        return ResponseEntity.ok(response);
    }


}

