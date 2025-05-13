package Delivery_Replication.Delivery_Replication.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderEvent {
    private String eventId;
    private String eventType;
    private String orderId;
    private Long userId;
    private String restaurantId;
    private List<OrderItemInfo> items;
    private ContactInfo contactInfo;
    private DeliveryAddress deliveryAddress;
    private String deliveryInstructions;
    private String paymentMethod;
    private double subtotal;
    private double taxAmount;
    private double deliveryFee;
    private double discount;
    private double total;
    private Location deliveryLocation;
    private Location restaurantLocation;
    private PromotionDetails promotion;
    private long timestamp;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemInfo {
        private String itemId;
        private int quantity;
        private double price;
        private String name;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContactInfo {
        private String name;
        private String phone;
        private String email;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeliveryAddress {
        private String street;
        private String city;
        private String state;
        private String postalCode;
        private String country;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Location {
        private double latitude;
        private double longitude;
        private String address;
        private String name;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PromotionDetails {
        private String code;
        private double discountAmount;
    }
}