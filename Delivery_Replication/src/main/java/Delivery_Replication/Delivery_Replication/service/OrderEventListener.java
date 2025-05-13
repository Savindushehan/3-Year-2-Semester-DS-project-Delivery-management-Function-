package Delivery_Replication.Delivery_Replication.service;

import Delivery_Replication.Delivery_Replication.models.DeliveryReplication;
import Delivery_Replication.Delivery_Replication.service.DeliveryReplicationService;
import com.foodDelivery.orderService.dto.DeliveryAddressRequest;
import com.foodDelivery.orderService.event.OrderEvent;
import com.foodDelivery.orderService.model.DeliveryAddress;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventListener {

    private final DeliveryReplicationService deliveryReplicationService;

    public OrderEventListener(DeliveryReplicationService deliveryReplicationService){
        this.deliveryReplicationService = deliveryReplicationService;
    }

    @KafkaListener(topics = "order-notifications", groupId = "delivery-replication-service")
    public void handleOrderEvent(OrderEvent event) {
      //  log.info("Received order event: {}, type: {}", event.getOrderId(), event.getEventType());

        if ("ORDER_OUT_FOR_DELIVERY".equals(event.getEventType())) {
      //      log.info("Processing out for delivery order: {}", event.getOrderId());
            processOutForDeliveryOrder(event);
        }
    }

    private void processOutForDeliveryOrder(OrderEvent event) {
        try {
            // Build full address string from delivery address components
            String fullAddress = buildFullAddress(event.getDeliveryAddress());

            // Convert order items to string array
            String[] orderItems = event.getItems().stream()
                    .map(item -> item.getName() + " x" + item.getQuantity())
                    .toArray(String[]::new);

            // Create DeliveryReplication object
            DeliveryReplication deliveryReplication = new DeliveryReplication();
            deliveryReplication.setOrderId(event.getOrderId());
            deliveryReplication.setUserId(event.getUserId().toString());
            deliveryReplication.setUserName(event.getContactInfo().getName());
            deliveryReplication.setUserPhoneNo(event.getContactInfo().getPhone());
            deliveryReplication.setRestaurantId(event.getRestaurantId());
            deliveryReplication.setDeliveryAddress(fullAddress);
            deliveryReplication.setOrderItems(orderItems);
            deliveryReplication.setPrice(event.getTotal());

            // Set current date and time
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm:ss");
            deliveryReplication.setOrderDate(LocalDate.now().format(dateFormatter));
            deliveryReplication.setOrderTime(LocalTime.now().format(timeFormatter));

            // Initialize driver fields as null/false
            deliveryReplication.setAssignDriver(false);
            deliveryReplication.setOrderDeliveredComplete(false);

            // Save the delivery replication
            deliveryReplicationService.createDeliveryReplication(deliveryReplication);

            //log.info("Created delivery replication for order: {}", event.getOrderId());
        } catch (Exception e) {
          //  log.error("Error processing out for delivery order: {}", e.getMessage(), e);
        }
    }

    private String buildFullAddress(DeliveryAddressRequest address) {
        return String.format("%s, %s, %s, %s",
                address.getStreet(),
                address.getCity(),
                address.getState(),
                address.getZipCode());
    }
}