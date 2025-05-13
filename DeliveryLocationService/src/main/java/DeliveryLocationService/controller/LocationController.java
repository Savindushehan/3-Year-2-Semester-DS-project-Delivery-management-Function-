package DeliveryLocationService.controller;


import DeliveryLocationService.models.Location;
import DeliveryLocationService.repository.LocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/location")
public class LocationController {

    @Autowired
    private LocationRepository locationRepository;

    @PostMapping
    public Location saveLocation(@RequestBody Location location) {
        return locationRepository.save(location);
    }

    @GetMapping
    public List<Location> getAllLocations() {
        return locationRepository.findAll();
    }

    @GetMapping("/user/{userId}")
    public List<Location> getLocationsByUserId(@PathVariable String userId) {
        return locationRepository.findByUserId(userId);
    }

    @GetMapping("/user/{userId}/order/{orderId}")
    public List<Location> getLocationsByUserIdWithOrderId(@PathVariable String userId, @PathVariable String orderId) {
        return locationRepository.findByUserIdAndOrderId(userId, orderId);
    }



}
