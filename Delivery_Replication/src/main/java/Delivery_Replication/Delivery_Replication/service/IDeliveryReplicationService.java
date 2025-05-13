package Delivery_Replication.Delivery_Replication.service;

import Delivery_Replication.Delivery_Replication.dto.DeliveryReplicationRequest;
import Delivery_Replication.Delivery_Replication.dto.DeliveryReplicationResponse;
import Delivery_Replication.Delivery_Replication.models.DeliveryReplication;

import java.util.List;

public interface IDeliveryReplicationService {

    DeliveryReplicationResponse createDeliveryReplication(DeliveryReplication request);
    List<DeliveryReplicationResponse> getAllDeliveryReplicationResponses();
    void deleteDeliveryReplication(String id);
    List<DeliveryReplicationResponse> getDeliveriesByAssignDriver();
    DeliveryReplicationResponse updateDeliveryReplication(String orderId, DeliveryReplication request);
    DeliveryReplicationResponse getDeliveryReplicationByOrderId(String orderId);
    DeliveryReplicationResponse updateDeliveryReplicationDriver(String orderId, DeliveryReplication request);


}
