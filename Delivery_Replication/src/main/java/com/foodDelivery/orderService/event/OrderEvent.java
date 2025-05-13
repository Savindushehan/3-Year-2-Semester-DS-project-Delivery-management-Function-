package com.foodDelivery.orderService.event;

import com.foodDelivery.orderService.dto.*;
import com.foodDelivery.orderService.model.OrderStatus;
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
    private List<OrderItemRequest> items;
    private ContactInfoRequest contactInfo;
    private DeliveryAddressRequest deliveryAddress;
    private String deliveryInstructions;
    private String paymentMethod;
    private OrderStatus status;
    private double subtotal;
    private double taxAmount;
    private double deliveryFee;
    private double discount;
    private double total;
    private LocationRequest deliveryLocation;
    private LocationRequest restaurantLocation;
    private PromotionDetailsRequest promotion;
    private long timestamp;

    public OrderEvent() {
    }

    public OrderEvent(String eventId, String eventType, String orderId, Long userId, String restaurantId, List<OrderItemRequest> items, ContactInfoRequest contactInfo, DeliveryAddressRequest deliveryAddress, String deliveryInstructions, String paymentMethod, OrderStatus status, double subtotal, double taxAmount, double deliveryFee, double discount, double total, LocationRequest deliveryLocation, LocationRequest restaurantLocation, PromotionDetailsRequest promotion, long timestamp) {
        this.eventId = eventId;
        this.eventType = eventType;
        this.orderId = orderId;
        this.userId = userId;
        this.restaurantId = restaurantId;
        this.items = items;
        this.contactInfo = contactInfo;
        this.deliveryAddress = deliveryAddress;
        this.deliveryInstructions = deliveryInstructions;
        this.paymentMethod = paymentMethod;
        this.status = status;
        this.subtotal = subtotal;
        this.taxAmount = taxAmount;
        this.deliveryFee = deliveryFee;
        this.discount = discount;
        this.total = total;
        this.deliveryLocation = deliveryLocation;
        this.restaurantLocation = restaurantLocation;
        this.promotion = promotion;
        this.timestamp = timestamp;
    }

    public double getSubtotal() {
        return subtotal;
    }

    public String getEventId() {
        return eventId;
    }

    public String getEventType() {
        return eventType;
    }

    public String getOrderId() {
        return orderId;
    }

    public Long getUserId() {
        return userId;
    }

    public String getRestaurantId() {
        return restaurantId;
    }

    public List<OrderItemRequest> getItems() {
        return items;
    }

    public ContactInfoRequest getContactInfo() {
        return contactInfo;
    }

    public DeliveryAddressRequest getDeliveryAddress() {
        return deliveryAddress;
    }

    public String getDeliveryInstructions() {
        return deliveryInstructions;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public double getTaxAmount() {
        return taxAmount;
    }

    public double getDeliveryFee() {
        return deliveryFee;
    }

    public double getDiscount() {
        return discount;
    }

    public double getTotal() {
        return total;
    }

    public LocationRequest getDeliveryLocation() {
        return deliveryLocation;
    }

    public LocationRequest getRestaurantLocation() {
        return restaurantLocation;
    }

    public PromotionDetailsRequest getPromotion() {
        return promotion;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setDeliveryAddress(DeliveryAddressRequest deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setRestaurantId(String restaurantId) {
        this.restaurantId = restaurantId;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }

    public void setContactInfo(ContactInfoRequest contactInfo) {
        this.contactInfo = contactInfo;
    }

    public void setDeliveryInstructions(String deliveryInstructions) {
        this.deliveryInstructions = deliveryInstructions;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public void setSubtotal(double subtotal) {
        this.subtotal = subtotal;
    }

    public void setTaxAmount(double taxAmount) {
        this.taxAmount = taxAmount;
    }

    public void setDeliveryFee(double deliveryFee) {
        this.deliveryFee = deliveryFee;
    }

    public void setDiscount(double discount) {
        this.discount = discount;
    }

    public void setTotal(double total) {
        this.total = total;
    }

    public void setDeliveryLocation(LocationRequest deliveryLocation) {
        this.deliveryLocation = deliveryLocation;
    }

    public void setRestaurantLocation(LocationRequest restaurantLocation) {
        this.restaurantLocation = restaurantLocation;
    }

    public void setPromotion(PromotionDetailsRequest promotion) {
        this.promotion = promotion;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
}