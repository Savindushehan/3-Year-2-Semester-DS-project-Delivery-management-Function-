//package Delivery_Replication.Delivery_Replication.service;
//
//import Delivery_Replication.Delivery_Replication.dto.DeliveryReplicationRequest;
//import Delivery_Replication.Delivery_Replication.dto.DeliveryReplicationResponse;
//import Delivery_Replication.Delivery_Replication.dto.DriverInfoDTO;
//import Delivery_Replication.Delivery_Replication.dto.DriverOrderDTO;
//import Delivery_Replication.Delivery_Replication.models.DeliveryReplication;
//import Delivery_Replication.Delivery_Replication.repository.DeliveryReplcationRepository;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.http.ResponseEntity;
//import org.springframework.kafka.annotation.KafkaListener;
//import org.springframework.stereotype.Service;
//import org.springframework.web.client.RestTemplate;
//import java.util.List;
//import java.util.Optional;
//import java.util.stream.Collectors;
//
//@Service
//public class DeliveryReplicationService {
//    private static final Logger logger = LoggerFactory.getLogger(DeliveryReplicationService.class);
//    private final DeliveryReplcationRepository deliveryReplcationRepository;
//    private final RestTemplate restTemplate;
//
//    public DeliveryReplicationService(DeliveryReplcationRepository deliveryReplcationRepository,
//                                      RestTemplate restTemplate) {
//        this.deliveryReplcationRepository = deliveryReplcationRepository;
//        this.restTemplate = restTemplate;
//    }
//
//
//    @KafkaListener(topics = "unassigned-deliveries", groupId = "delivery-group")
//    public void listenUnassignedDelivery(String deliveryAddress ,DeliveryReplication delivery) {
//        logger.info("🟡 Received address from Kafka: {}", deliveryAddress);
//
//        String url = "http://localhost:9002/api/deliveryDriver/city/" + deliveryAddress;
//
//        try {
//            ResponseEntity<DriverInfoDTO[]> response =
//                    restTemplate.getForEntity(url, DriverInfoDTO[].class);
//
//            if (response.getStatusCode().is2xxSuccessful()) {
//                DriverInfoDTO[] drivers = response.getBody();
//
//                if (drivers != null && drivers.length > 0) {
//                    logger.info("✅ Found {} drivers in {}:", drivers.length, deliveryAddress);
//                    for (DriverInfoDTO driver : drivers) {
//                        logger.info("➡️ Driver: {} ({})", driver.getDriverName(), driver.getDriverPhone());
//                        logger.info("➡️ Driver ID: {} ({})", driver.getDriverId(), driver.getDriverPhone());
//
//                        // fetch the order Count using kafka in the DriverOrder Service
//                        FetchDriverOrders(driver.getDriverId(),delivery); // 👈 Manually trigger the logic
//                        // 👉 You could add logic here to assign a driver or notify admin
//                    }
//                } else {
//                    logger.warn("❌ No drivers found in city: {}", deliveryAddress);
//                }
//            } else {
//                logger.warn("⚠️ Received non-success response from driver service: {}", response.getStatusCode());
//            }
//
//        } catch (Exception e) {
//            logger.error("❗ Error calling driver service: {}", e.getMessage(), e);
//        }
//    }
//
//
//
//    //Fetch the Driver Orders
//    @KafkaListener(topics = "unassigned-deliveries", groupId = "delivery-group")
//    public void FetchDriverOrders(String driverId,DeliveryReplication delivery) {
//        logger.info("🟡 Received driverId from Kafka: {}", driverId);
//
//        String url = "http://localhost:8081/api/driver-orders/orders/incomplete/" + driverId;
//
//        try {
//            ResponseEntity<DriverOrderDTO[]> response =
//                    restTemplate.getForEntity(url, DriverOrderDTO[].class);
//
//            if (response.getStatusCode().is2xxSuccessful()) {
//                DriverOrderDTO[] orders = response.getBody();
//
//                if (orders == null || orders.length < 5) {
//                    logger.info("✅ Found {} Orders in {}:", orders.length, driverId);
////                    for (DriverOrderDTO order : orders) {
////                        logger.info("➡️ Orders: {} ({})", order.getOrderId(), order.getOrderDate());
//
//                        // 👉 You could add logic here to assign a driver or notify admin
//
//                        DriverOrderDTO driverOrderDTO = new DriverOrderDTO();
//                        driverOrderDTO.setDriverId(driverId);
//                        driverOrderDTO.setOrderId(delivery.getOrderId());
//                        driverOrderDTO.setUserId(delivery.getUserId());
//                        driverOrderDTO.setUserName(delivery.getUserName());
//                        driverOrderDTO.setRestaurantId(delivery.getRestaurantId());
//                        driverOrderDTO.setDeliveryAddress(delivery.getDeliveryAddress());
//                        driverOrderDTO.setOrderItems(delivery.getOrderItems());
//                        driverOrderDTO.setPrice(delivery.getPrice());
//                        driverOrderDTO.setOrderDate(delivery.getOrderDate());
//                        driverOrderDTO.setOrderTime(delivery.getOrderTime());
//                        driverOrderDTO.setOrderComplete(false);
//                        driverOrderDTO.setRemarks("null");
//                        String url1 = "http://localhost:8081/api/driver-orders";
//                        ResponseEntity<String> postResponse = restTemplate.postForEntity(
//                                url1,
//                                driverOrderDTO,
//                                String.class // or DriverOrderDTO.class depending on what your API returns
//                        );
//                    if (postResponse.getStatusCode().is2xxSuccessful()) {
//                        logger.info("✅ Successfully sent order {} to driver {}", delivery.getOrderId(), driverId);
//                        updateDeliveryReplication(delivery.getOrderId(),delivery);
//                    } else {
//                        logger.warn("⚠️ Failed to send order. Response code: {}", postResponse.getStatusCode());
//                    }
//
//
//                  //  }
//                } else {
//                    logger.warn("❌ No Orders found in Driver: {}", driverId);
//                }
//            } else {
//                logger.warn("⚠️ Received non-success response from driverOrder service: {}", response.getStatusCode());
//            }
//
//        } catch (Exception e) {
//            logger.error("❗ Error calling driver service: {}", e.getMessage(), e);
//        }
//    }
//
//
//
//
//
//
//
//
//    public DeliveryReplicationResponse createDeliveryReplication(DeliveryReplicationRequest request) {
//        DeliveryReplication deliveryReplication = new DeliveryReplication(
//                request.orderId(),
//                request.userId(),
//                request.userName(),
//                request.userPhoneNo(),
//                request.restaurantId(),
//                request.deliveryAddress(),
//                request.orderItems(),
//                request.price(),
//                request.orderDate(),
//                request.orderTime(),
//                request.isAssignDriver(),
//                request.driverId(),
//                request.driverName(),
//                request.driverPhoneNo(),
//                request.isOrderDeliveredComplete(),
//                request.driverRemark(),
//                request.userRemark()
//        );
//
//        deliveryReplcationRepository.save(deliveryReplication);
//        logger.info("Delivery replication created successfully: {}", deliveryReplication);
//
//        // ✅ Convert to DeliveryReplicationResponse and return
//        return new DeliveryReplicationResponse(
//                deliveryReplication.getOrderId(),
//                deliveryReplication.getUserId(),
//                deliveryReplication.getUserName(),
//                deliveryReplication.getUserPhoneNo(),
//                deliveryReplication.getRestaurantId(),
//                deliveryReplication.getDeliveryAddress(),
//                deliveryReplication.getOrderItems(),
//                deliveryReplication.getPrice(),
//                deliveryReplication.getOrderDate(),
//                deliveryReplication.getOrderTime(),
//                deliveryReplication.getAssignDriver(),
//                deliveryReplication.getDriverId(),
//                deliveryReplication.getDriverName(),
//                deliveryReplication.getDriverPhoneNo(),
//                deliveryReplication.getOrderDeliveredComplete(),
//                deliveryReplication.getDriverRemark(),
//                deliveryReplication.getUserRemark()
//        );
//    }
//
//    public List<DeliveryReplicationResponse> getAllDeliveryReplicationResponses() {
//        // Fetch the list of DeliveryReplication objects
//        List<DeliveryReplication> deliveryReplications = deliveryReplcationRepository.findAll();
//
//        // Convert the DeliveryReplication list to DeliveryReplicationResponse list
//        return deliveryReplications.stream()
//                .map(deliveryReplication -> new DeliveryReplicationResponse(
//                        deliveryReplication.getOrderId(),
//                        deliveryReplication.getUserId(),
//                        deliveryReplication.getUserName(),
//                        deliveryReplication.getUserPhoneNo(),
//                        deliveryReplication.getRestaurantId(),
//                        deliveryReplication.getDeliveryAddress(),
//                        deliveryReplication.getOrderItems(),
//                        deliveryReplication.getPrice(),
//                        deliveryReplication.getOrderDate(),
//                        deliveryReplication.getOrderTime(),
//                        deliveryReplication.getAssignDriver(),
//                        deliveryReplication.getDriverId(),
//                        deliveryReplication.getDriverName(),
//                        deliveryReplication.getDriverPhoneNo(),
//                        deliveryReplication.getOrderDeliveredComplete(),
//                        deliveryReplication.getDriverRemark(),
//                        deliveryReplication.getUserRemark()
//                ))
//                .collect(Collectors.toList());
//    }
//
//
//
//    public void deleteDeliveryReplication(String id) {
//        DeliveryReplication existingDelivery = deliveryReplcationRepository.findByOrderId(id)
//                .orElseThrow(() -> new RuntimeException("DeliveryReplication not found with ID: " + id));
//
//        deliveryReplcationRepository.delete(existingDelivery);
//        logger.info("DeliveryReplication deleted successfully: {}", existingDelivery);
//    }
//
//    // Updated method to return List<DeliveryReplicationResponse>
//    public List<DeliveryReplicationResponse> getDeliveriesByAssignDriver(Boolean isAssignDriver) {
//        List<DeliveryReplication> deliveries = deliveryReplcationRepository.findByIsAssignDriver(isAssignDriver);
//
//        // 🔁 Loop through each unassigned delivery and manually call the Kafka logic
//        deliveries.forEach(delivery -> {
//            String address = delivery.getDeliveryAddress();
//            listenUnassignedDelivery(address,delivery); // 👈 Manually trigger the logic
//        });
//
//        return deliveries.stream()
//                .map(deliveryReplication -> new DeliveryReplicationResponse(
//                        deliveryReplication.getOrderId(),
//                        deliveryReplication.getUserId(),
//                        deliveryReplication.getUserName(),
//                        deliveryReplication.getUserPhoneNo(),
//                        deliveryReplication.getRestaurantId(),
//                        deliveryReplication.getDeliveryAddress(),
//                        deliveryReplication.getOrderItems(),
//                        deliveryReplication.getPrice(),
//                        deliveryReplication.getOrderDate(),
//                        deliveryReplication.getOrderTime(),
//                        deliveryReplication.getAssignDriver(),
//                        deliveryReplication.getDriverId(),
//                        deliveryReplication.getDriverName(),
//                        deliveryReplication.getDriverPhoneNo(),
//                        deliveryReplication.getOrderDeliveredComplete(),
//                        deliveryReplication.getDriverRemark(),
//                        deliveryReplication.getUserRemark()
//                ))
//                .collect(Collectors.toList());
//    }
//
//
//    public DeliveryReplicationResponse updateDeliveryReplication(String orderId, DeliveryReplication request) {
//        Optional<DeliveryReplication> optionalDelivery = deliveryReplcationRepository.findByOrderId(orderId);
//
//        if (optionalDelivery.isEmpty()) {
//            throw new RuntimeException("❌ DeliveryReplication not found with Order ID: " + orderId);
//        }
//
//        DeliveryReplication existingDelivery = optionalDelivery.get();
//
//        // 🔄 Update fields
//        existingDelivery.setUserId(request.getUserId());
//        existingDelivery.setUserName(request.getUserName());
//        existingDelivery.setUserPhoneNo(request.getUserPhoneNo());
//        existingDelivery.setRestaurantId(request.getRestaurantId());
//        existingDelivery.setDeliveryAddress(request.getDeliveryAddress());
//        existingDelivery.setOrderItems(request.getOrderItems());
//        existingDelivery.setPrice(request.getPrice());
//        existingDelivery.setOrderDate(request.getOrderDate());
//        existingDelivery.setOrderTime(request.getOrderTime());
//        existingDelivery.setAssignDriver(true);
//        existingDelivery.setDriverId(request.getDriverId());
//        existingDelivery.setDriverName(request.getDriverName());
//        existingDelivery.setDriverPhoneNo(request.getDriverPhoneNo());
//        existingDelivery.setOrderDeliveredComplete(request.getOrderDeliveredComplete());
//        existingDelivery.setDriverRemark(request.getDriverRemark());
//        existingDelivery.setUserRemark(request.getUserRemark());
//
//        // 💾 Save updated record
//        deliveryReplcationRepository.save(existingDelivery);
//        logger.info("✅ DeliveryReplication updated successfully: {}", existingDelivery);
//
//        return new DeliveryReplicationResponse(
//                existingDelivery.getOrderId(),
//                existingDelivery.getUserId(),
//                existingDelivery.getUserName(),
//                existingDelivery.getUserPhoneNo(),
//                existingDelivery.getRestaurantId(),
//                existingDelivery.getDeliveryAddress(),
//                existingDelivery.getOrderItems(),
//                existingDelivery.getPrice(),
//                existingDelivery.getOrderDate(),
//                existingDelivery.getOrderTime(),
//                existingDelivery.getAssignDriver(),
//                existingDelivery.getDriverId(),
//                existingDelivery.getDriverName(),
//                existingDelivery.getDriverPhoneNo(),
//                existingDelivery.getOrderDeliveredComplete(),
//                existingDelivery.getDriverRemark(),
//                existingDelivery.getUserRemark()
//        );
//    }
//
//
//
//}


package Delivery_Replication.Delivery_Replication.service;

import Delivery_Replication.Delivery_Replication.dto.*;
import Delivery_Replication.Delivery_Replication.models.DeliveryReplication;
import Delivery_Replication.Delivery_Replication.repository.DeliveryReplcationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.scheduling.annotation.Scheduled;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DeliveryReplicationService implements IDeliveryReplicationService {

    private static final Logger logger = LoggerFactory.getLogger(DeliveryReplicationService.class);
    private final DeliveryReplcationRepository deliveryReplcationRepository;
    private final RestTemplate restTemplate;

    public DeliveryReplicationService(DeliveryReplcationRepository deliveryReplcationRepository,
                                      RestTemplate restTemplate) {
        this.deliveryReplcationRepository = deliveryReplcationRepository;
        this.restTemplate = restTemplate;
    }




    @KafkaListener(topics = "unassigned-deliveries", groupId = "delivery-group")
    public void listenUnassignedDelivery(String deliveryAddress ,DeliveryReplication delivery) {
        logger.info("🟡 Received address from Kafka: {}", deliveryAddress);

        String url = "http://localhost:9002/api/deliveryDriver/city/" + deliveryAddress;

        try {
            ResponseEntity<DriverInfoDTO[]> response =
                    restTemplate.getForEntity(url, DriverInfoDTO[].class);

            if (response.getStatusCode().is2xxSuccessful()) {
                DriverInfoDTO[] drivers = response.getBody();

                if (drivers != null && drivers.length > 0) {
                    logger.info("✅ Found {} drivers in {}:", drivers.length, deliveryAddress);
                    for (DriverInfoDTO driver : drivers) {
                        logger.info("➡️ Driver: {} ({})", driver.getDriverName(), driver.getDriverPhone());
                        logger.info("➡️ Driver ID: {} ({})", driver.getDriverId(), driver.getDriverPhone());

                        // fetch the order Count using kafka in the DriverOrder Service
                        FetchDriverOrders(driver.getDriverId(),delivery); // 👈 Manually trigger the logic
                        // 👉 You could add logic here to assign a driver or notify admin
                    }
                } else {
                    logger.warn("❌ No drivers found in city: {}", deliveryAddress);
                }
            } else {
                logger.warn("⚠️ Received non-success response from driver service: {}", response.getStatusCode());
            }

        } catch (Exception e) {
            logger.error("❗ Error calling driver service: {}", e.getMessage(), e);
        }
    }



    //Fetch the Driver Orders
    @KafkaListener(topics = "unassigned-deliveries", groupId = "delivery-group")
    public void FetchDriverOrders(String driverId,DeliveryReplication delivery) {
        logger.info("🟡 Received driverId from Kafka topic: {}", driverId);

        String url = "http://localhost:9005/api/driver-orders/orders/incomplete/" + driverId;

        try {
            ResponseEntity<DriverOrderDTO[]> response =
                    restTemplate.getForEntity(url, DriverOrderDTO[].class);

            if (response.getStatusCode().is2xxSuccessful()) {
                DriverOrderDTO[] orders = response.getBody();

                if (orders == null || orders.length < 5) {
                    logger.info("✅ Found {} Orders in {}:", orders.length, driverId);
//                    for (DriverOrderDTO order : orders) {
//                        logger.info("➡️ Orders: {} ({})", order.getOrderId(), order.getOrderDate());

                    // 👉 You could add logic here to assign a driver or notify admin

                    DriverOrderDTO driverOrderDTO = new DriverOrderDTO();
                    driverOrderDTO.setDriverId(driverId);
                    driverOrderDTO.setOrderId(delivery.getOrderId());
                    driverOrderDTO.setUserId(delivery.getUserId());
                    driverOrderDTO.setUserName(delivery.getUserName());
                    driverOrderDTO.setRestaurantId(delivery.getRestaurantId());
                    driverOrderDTO.setDeliveryAddress(delivery.getDeliveryAddress());
                    driverOrderDTO.setOrderItems(delivery.getOrderItems());
                    driverOrderDTO.setPrice(delivery.getPrice());
                    driverOrderDTO.setOrderDate(delivery.getOrderDate());
                    driverOrderDTO.setOrderTime(delivery.getOrderTime());
                    driverOrderDTO.setOrderComplete(false);
                    driverOrderDTO.setRemarks("null");
                    String url1 = "http://localhost:9005/api/driver-orders";
                    ResponseEntity<String> postResponse = restTemplate.postForEntity(
                            url1,
                            driverOrderDTO,
                            String.class // or DriverOrderDTO.class depending on what your API returns
                    );
                    if (postResponse.getStatusCode().is2xxSuccessful()) {
                        logger.info("✅ Successfully sent order {} to driver {}", delivery.getOrderId(), driverId);
                        updateDeliveryReplication(delivery.getOrderId(),delivery);
                    } else {
                        logger.warn("⚠️ Failed to send order. Response code: {}", postResponse.getStatusCode());
                    }


                    //  }
                } else {
                    logger.warn("❌ No Orders found in Driver: {}", driverId);
                }
            } else {
                logger.warn("⚠️ Received non-success response from driverOrder service: {}", response.getStatusCode());
            }

        } catch (Exception e) {
            logger.error("❗ Error calling driver service: {}", e.getMessage(), e);
        }
    }


    public DeliveryReplicationResponse createDeliveryReplication(DeliveryReplication deliveryReplication) {

        deliveryReplcationRepository.save(deliveryReplication);
        logger.info("Delivery replication created successfully: {}", deliveryReplication);

        // ✅ Convert to DeliveryReplicationResponse and return
        return new DeliveryReplicationResponse(
                deliveryReplication.getOrderId(),
                deliveryReplication.getUserId(),
                deliveryReplication.getUserName(),
                deliveryReplication.getUserPhoneNo(),
                deliveryReplication.getRestaurantId(),
                deliveryReplication.getDeliveryAddress(),
                deliveryReplication.getOrderItems(),
                deliveryReplication.getPrice(),
                deliveryReplication.getOrderDate(),
                deliveryReplication.getOrderTime(),
                deliveryReplication.getAssignDriver(),
                deliveryReplication.getDriverId(),
                deliveryReplication.getDriverName(),
                deliveryReplication.getDriverPhoneNo(),
                deliveryReplication.getOrderDeliveredComplete(),
                deliveryReplication.getDriverRemark(),
                deliveryReplication.getUserRemark()
        );

    }

    public List<DeliveryReplicationResponse> getAllDeliveryReplicationResponses() {
        // Fetch the list of DeliveryReplication objects
        List<DeliveryReplication> deliveryReplications = deliveryReplcationRepository.findAll();

        // Convert the DeliveryReplication list to DeliveryReplicationResponse list
        return deliveryReplications.stream()
                .map(deliveryReplication -> new DeliveryReplicationResponse(
                        deliveryReplication.getOrderId(),
                        deliveryReplication.getUserId(),
                        deliveryReplication.getUserName(),
                        deliveryReplication.getUserPhoneNo(),
                        deliveryReplication.getRestaurantId(),
                        deliveryReplication.getDeliveryAddress(),
                        deliveryReplication.getOrderItems(),
                        deliveryReplication.getPrice(),
                        deliveryReplication.getOrderDate(),
                        deliveryReplication.getOrderTime(),
                        deliveryReplication.getAssignDriver(),
                        deliveryReplication.getDriverId(),
                        deliveryReplication.getDriverName(),
                        deliveryReplication.getDriverPhoneNo(),
                        deliveryReplication.getOrderDeliveredComplete(),
                        deliveryReplication.getDriverRemark(),
                        deliveryReplication.getUserRemark()
                ))
                .collect(Collectors.toList());
    }



    public void deleteDeliveryReplication(String id) {
        DeliveryReplication existingDelivery = deliveryReplcationRepository.findByOrderId(id)
                .orElseThrow(() -> new RuntimeException("DeliveryReplication not found with ID: " + id));

        deliveryReplcationRepository.delete(existingDelivery);
        logger.info("DeliveryReplication deleted successfully: {}", existingDelivery);
    }

    // Updated method to return List<DeliveryReplicationResponse>
    @Scheduled(fixedRate = 120000) // every 2 minutes
    public List<DeliveryReplicationResponse> getDeliveriesByAssignDriver() {
        List<DeliveryReplication> deliveries = deliveryReplcationRepository.findByIsAssignDriver(false);

        // 🔁 Loop through each unassigned delivery and manually call the Kafka logic
        deliveries.forEach(delivery -> {
            String address = delivery.getDeliveryAddress();
            listenUnassignedDelivery(address,delivery);
        });

        return deliveries.stream()
                .map(deliveryReplication -> new DeliveryReplicationResponse(
                        deliveryReplication.getOrderId(),
                        deliveryReplication.getUserId(),
                        deliveryReplication.getUserName(),
                        deliveryReplication.getUserPhoneNo(),
                        deliveryReplication.getRestaurantId(),
                        deliveryReplication.getDeliveryAddress(),
                        deliveryReplication.getOrderItems(),
                        deliveryReplication.getPrice(),
                        deliveryReplication.getOrderDate(),
                        deliveryReplication.getOrderTime(),
                        deliveryReplication.getAssignDriver(),
                        deliveryReplication.getDriverId(),
                        deliveryReplication.getDriverName(),
                        deliveryReplication.getDriverPhoneNo(),
                        deliveryReplication.getOrderDeliveredComplete(),
                        deliveryReplication.getDriverRemark(),
                        deliveryReplication.getUserRemark()
                ))
                .collect(Collectors.toList());
    }


    public DeliveryReplicationResponse updateDeliveryReplication(String orderId, DeliveryReplication request) {
        Optional<DeliveryReplication> optionalDelivery = deliveryReplcationRepository.findByOrderId(orderId);

        if (optionalDelivery.isEmpty()) {
            throw new RuntimeException("❌ DeliveryReplication not found with Order ID: " + orderId);
        }

        DeliveryReplication existingDelivery = optionalDelivery.get();

        // 🔄 Update fields
        existingDelivery.setUserId(request.getUserId());
        existingDelivery.setUserName(request.getUserName());
        existingDelivery.setUserPhoneNo(request.getUserPhoneNo());
        existingDelivery.setRestaurantId(request.getRestaurantId());
        existingDelivery.setDeliveryAddress(request.getDeliveryAddress());
        existingDelivery.setOrderItems(request.getOrderItems());
        existingDelivery.setPrice(request.getPrice());
        existingDelivery.setOrderDate(request.getOrderDate());
        existingDelivery.setOrderTime(request.getOrderTime());
        existingDelivery.setAssignDriver(true);
        existingDelivery.setDriverId(request.getDriverId());
        existingDelivery.setDriverName(request.getDriverName());
        existingDelivery.setDriverPhoneNo(request.getDriverPhoneNo());
        existingDelivery.setOrderDeliveredComplete(request.getOrderDeliveredComplete());
        existingDelivery.setDriverRemark(request.getDriverRemark());
        existingDelivery.setUserRemark(request.getUserRemark());

        // 💾 Save updated record
        deliveryReplcationRepository.save(existingDelivery);
        logger.info("✅ DeliveryReplication updated successfully: {}", existingDelivery);

        return new DeliveryReplicationResponse(
                existingDelivery.getOrderId(),
                existingDelivery.getUserId(),
                existingDelivery.getUserName(),
                existingDelivery.getUserPhoneNo(),
                existingDelivery.getRestaurantId(),
                existingDelivery.getDeliveryAddress(),
                existingDelivery.getOrderItems(),
                existingDelivery.getPrice(),
                existingDelivery.getOrderDate(),
                existingDelivery.getOrderTime(),
                existingDelivery.getAssignDriver(),
                existingDelivery.getDriverId(),
                existingDelivery.getDriverName(),
                existingDelivery.getDriverPhoneNo(),
                existingDelivery.getOrderDeliveredComplete(),
                existingDelivery.getDriverRemark(),
                existingDelivery.getUserRemark()
        );
    }



    public DeliveryReplicationResponse updateDeliveryReplicationDriver(String orderId, DeliveryReplication request) {
        Optional<DeliveryReplication> optionalDelivery = deliveryReplcationRepository.findByOrderId(orderId);

        if (optionalDelivery.isEmpty()) {
            throw new RuntimeException("❌ DeliveryReplication not found with Order ID: " + orderId);
        }

        DeliveryReplication existingDelivery = optionalDelivery.get();

        // 🔄 Update fields
        existingDelivery.setUserId(request.getUserId());
        existingDelivery.setUserName(request.getUserName());
        existingDelivery.setUserPhoneNo(request.getUserPhoneNo());
        existingDelivery.setRestaurantId(request.getRestaurantId());
        existingDelivery.setDeliveryAddress(request.getDeliveryAddress());
        existingDelivery.setOrderItems(request.getOrderItems());
        existingDelivery.setPrice(request.getPrice());
        existingDelivery.setOrderDate(request.getOrderDate());
        existingDelivery.setOrderTime(request.getOrderTime());
        existingDelivery.setAssignDriver(request.getAssignDriver());
        existingDelivery.setDriverId(request.getDriverId());
        existingDelivery.setDriverName(request.getDriverName());
        existingDelivery.setDriverPhoneNo(request.getDriverPhoneNo());
        existingDelivery.setOrderDeliveredComplete(request.getOrderDeliveredComplete());
        existingDelivery.setDriverRemark(request.getDriverRemark());
        existingDelivery.setUserRemark(request.getUserRemark());

        // 💾 Save updated record
        deliveryReplcationRepository.save(existingDelivery);
        logger.info("✅ DeliveryReplication updated successfully: {}", existingDelivery);

        return new DeliveryReplicationResponse(
                existingDelivery.getOrderId(),
                existingDelivery.getUserId(),
                existingDelivery.getUserName(),
                existingDelivery.getUserPhoneNo(),
                existingDelivery.getRestaurantId(),
                existingDelivery.getDeliveryAddress(),
                existingDelivery.getOrderItems(),
                existingDelivery.getPrice(),
                existingDelivery.getOrderDate(),
                existingDelivery.getOrderTime(),
                existingDelivery.getAssignDriver(),
                existingDelivery.getDriverId(),
                existingDelivery.getDriverName(),
                existingDelivery.getDriverPhoneNo(),
                existingDelivery.getOrderDeliveredComplete(),
                existingDelivery.getDriverRemark(),
                existingDelivery.getUserRemark()
        );
    }


    @Override
    public DeliveryReplicationResponse getDeliveryReplicationByOrderId(String orderId) {
        DeliveryReplication delivery = deliveryReplcationRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("DeliveryReplication not found with order ID: " + orderId));

        return new DeliveryReplicationResponse(
                delivery.getOrderId(),
                delivery.getUserId(),
                delivery.getUserName(),
                delivery.getUserPhoneNo(),
                delivery.getRestaurantId(),
                delivery.getDeliveryAddress(),
                delivery.getOrderItems(),
                delivery.getPrice(),
                delivery.getOrderDate(),
                delivery.getOrderTime(),
                delivery.getAssignDriver(),
                delivery.getDriverId(),
                delivery.getDriverName(),
                delivery.getDriverPhoneNo(),
                delivery.getOrderDeliveredComplete(),
                delivery.getDriverRemark(),
                delivery.getUserRemark()
        );
    }



}
