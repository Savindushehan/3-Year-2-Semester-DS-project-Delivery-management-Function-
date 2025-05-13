package Delivery_Replication.Delivery_Replication.repository;

import Delivery_Replication.Delivery_Replication.models.DeliveryReplication;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface DeliveryReplcationRepository extends MongoRepository<DeliveryReplication, String> {

    Optional<DeliveryReplication> findByOrderId(String orderId);
    List<DeliveryReplication> findByIsAssignDriver(Boolean assignDriver);  // Change to return List

}
