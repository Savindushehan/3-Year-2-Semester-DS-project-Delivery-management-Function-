package DriverOrderService.repository;

import DriverOrderService.models.DriverOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DriverOrderRepository extends JpaRepository<DriverOrder, String> {

    List<DriverOrder> findByDriverIdAndIsOrderComplete(String driverId, Boolean isOrderComplete);

    List<DriverOrder> findByDriverId(String driverId);

    List<DriverOrder> findByOrderId(String orderId);
}

