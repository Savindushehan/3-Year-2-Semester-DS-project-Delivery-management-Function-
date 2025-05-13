package com.foodDelivery.orderService.dto.restaurant;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class RestaurantResponse {
    private String id;
    private String name;
    private String description;
    private String address;
    private String restaurantImageUrl;
    private String bannerImageUrl;
    private List<String> imageUrls = new ArrayList<>();
    private String phoneNumber;
    private String email;
    private Double latitude;
    private Double longitude;
    private double[] location;
    private String formattedAddress;
    private List<OpeningHourDto> openingHours = new ArrayList<>();
    private List<String> cuisineTypeIds = new ArrayList<>();
    private List<String> adminIds = new ArrayList<>();
    private String ownerId;
    private boolean enabled;
    private double avgRating;
    private int totalRatings;
    private long createdAt;
    private long updatedAt;

    @Data
    public static class OpeningHourDto {
        private int dayOfWeek;
        private String openTime;
        private String closeTime;
        private boolean closed;
    }
}