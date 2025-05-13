package DriverOrderService.controller;

import DriverOrderService.dto.DriverOrderRequest;
import DriverOrderService.models.DriverOrder;
import DriverOrderService.service.DriverOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/driver-orders")
public class DriverOrderController {

    @Autowired
    private DriverOrderService driverOrderService;

    // POST - Create new driver order
    @PostMapping
    public ResponseEntity<String> createDriverOrder(@RequestBody DriverOrderRequest driverOrderRequest) {
        driverOrderService.createOrderForDriver(driverOrderRequest);
        return ResponseEntity.ok("Driver order created successfully");
    }

    // GET - Retrieve all driver orders
    @GetMapping
    public ResponseEntity<List<DriverOrder>> getAllDriverOrders() {
        List<DriverOrder> orders = driverOrderService.getDriverOrder();
        return ResponseEntity.ok(orders);
    }

    // PUT - Update driver order by ID
    @PutMapping("/{orderId}")
    public ResponseEntity<String> updateDriverOrder(
            @PathVariable String orderId,
            @RequestBody DriverOrderRequest driverOrderRequest) {

        driverOrderService.UpdateDriverOrder(orderId, driverOrderRequest);
        return ResponseEntity.ok("Driver order updated successfully");
    }

    // Optional: DELETE - Delete driver order by ID (if you need it)
    // Add this method in your service class too
    @DeleteMapping("/{orderId}")
    public ResponseEntity<String> deleteDriverOrder(@PathVariable String orderId) {
        // Implement driverOrderService.deleteDriverOrder(orderId);
        return ResponseEntity.ok("Driver order deleted successfully");
    }

    @GetMapping("/orders/incomplete/{driverId}")
    public List<DriverOrder> getDriverIncompleteOrders(@PathVariable String driverId) {
        return driverOrderService.getIncompleteOrdersByDriver(driverId);
    }

    @GetMapping("/orders/{driverId}")
    public List<DriverOrder> getOrdersByDriver(@PathVariable String driverId){
        return driverOrderService.getOrdersByDriver(driverId);
    }

    @GetMapping("/order-by-id/{orderId}")
    public List<DriverOrder> getOrderByOrderId(@PathVariable String orderId) {
        return driverOrderService.getOrderbyOrderId(orderId);
    }


}
