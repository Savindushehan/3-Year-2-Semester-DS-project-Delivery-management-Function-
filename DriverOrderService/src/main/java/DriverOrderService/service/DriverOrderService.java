package DriverOrderService.service;

import DriverOrderService.dto.DriverOrderRequest;
import DriverOrderService.models.DriverOrder;
import DriverOrderService.repository.DriverOrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DriverOrderService {

    private static final Logger logger = LoggerFactory.getLogger(DriverOrderService.class);

    private final DriverOrderRepository driverOrderRepository;

    public DriverOrderService(DriverOrderRepository driverOrderRepository) {
        this.driverOrderRepository = driverOrderRepository;
    }

    public void createOrderForDriver(DriverOrderRequest driverOrderRequest) {
        try {
            DriverOrder driverOrder = new DriverOrder();
            driverOrder.setDriverId(driverOrderRequest.driverId());
            driverOrder.setOrderId(driverOrderRequest.orderId());
            driverOrder.setUserId(driverOrderRequest.userId());
            driverOrder.setUserName(driverOrderRequest.userName());
            driverOrder.setRestaurantId(driverOrderRequest.restaurantId());
            driverOrder.setDeliveryAddress(driverOrderRequest.deliveryAddress());
            driverOrder.setOrderItems(driverOrderRequest.orderItems());
            driverOrder.setPrice(driverOrderRequest.price());
            driverOrder.setOrderDate(driverOrderRequest.orderDate());
            driverOrder.setOrderTime(driverOrderRequest.orderTime());
            driverOrder.setOrderComplete(driverOrderRequest.isOrderComplete());
            driverOrder.setRemarks(driverOrderRequest.remarks());

            driverOrderRepository.save(driverOrder); // ✅ Save it
        } catch (Exception e) {
            logger.error("Create Order for Driver has Error: {}", driverOrderRequest.orderId(), e); // Include error object
            throw e;
        }
    }

    public List<DriverOrder> getDriverOrder() {
        return driverOrderRepository.findAll();
    }

    @Transactional
    public void UpdateDriverOrder(String orderId, DriverOrderRequest driverOrderRequest) {
        DriverOrder driverOrder = driverOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order Not found with Driver: " + orderId));
        driverOrder.setDriverId(driverOrderRequest.driverId());
        driverOrder.setOrderId(driverOrderRequest.orderId());
        driverOrder.setUserId(driverOrderRequest.userId());
        driverOrder.setUserName(driverOrderRequest.userName());
        driverOrder.setRestaurantId(driverOrderRequest.restaurantId());
        driverOrder.setDeliveryAddress(driverOrderRequest.deliveryAddress());
        driverOrder.setOrderItems(driverOrderRequest.orderItems());
        driverOrder.setPrice(driverOrderRequest.price());
        driverOrder.setOrderDate(driverOrderRequest.orderDate());
        driverOrder.setOrderTime(driverOrderRequest.orderTime());
        driverOrder.setOrderComplete(driverOrderRequest.isOrderComplete());
        driverOrder.setRemarks(driverOrderRequest.remarks());

        driverOrderRepository.save(driverOrder);
    }

    public List<DriverOrder> getIncompleteOrdersByDriver(String driverId) {
        return driverOrderRepository.findByDriverIdAndIsOrderComplete(driverId, false);
    }

    public List<DriverOrder> getOrdersByDriver(String driverId){
        return driverOrderRepository.findByDriverId(driverId);
    }

    public List<DriverOrder> getOrderbyOrderId(String OrderId){
        return driverOrderRepository.findByOrderId(OrderId);
    }

}
