package DeliveryLocationService.repository;

import DeliveryLocationService.models.Location;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LocationRepository extends JpaRepository<Location, Long> {
    Location findTopByUserIdOrderByTimestampDesc(String userId); // Fetch the most recent location for a user
    List<Location> findByUserId(String userId); // Fetch all locations for a specific user
    List<Location> findByUserIdAndOrderId(String userId, String orderId);

}
