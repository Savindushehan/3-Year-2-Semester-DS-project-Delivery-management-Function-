package DriverOrderService.models;

import jakarta.persistence.*;
import lombok.*;

import java.sql.Time;
import java.util.Date;

@Entity
@Table(name = "DriverOrders") // Defines the table name in the database
@Getter
@Setter
@Builder
public class DriverOrder {

    @Column(name = "driver_id")
    private String driverId;

    @Id
    @Column(name = "order_id", nullable = false, unique = true)
    private String orderId;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "user_name")
    private String userName;

    @Column(name = "restaurant_id")
    private String restaurantId;

    @Column(name = "delivery_address")
    private String deliveryAddress;

   @Column(name = "order_items")
    private String[] orderItems;

    @Column(name = "price")
    private Double price;

    @Column(name = "order_date")
    private String orderDate;

    @Column(name = "order_time")
    private String orderTime;

    @Column(name = "is_order_complete")
    private Boolean isOrderComplete;

    @Column(name = "remarks")
    private String remarks;

    public DriverOrder(String driverId, String orderId, String userId, String userName, String restaurantId, String deliveryAddress, String[] orderItems, Double price, String orderDate, String orderTime, Boolean isOrderComplete, String remarks) {
        this.driverId = driverId;
        this.orderId = orderId;
        this.userId = userId;
        this.userName = userName;
        this.restaurantId = restaurantId;
        this.deliveryAddress = deliveryAddress;
        this.orderItems = orderItems;
        this.price = price;
        this.orderDate = orderDate;
        this.orderTime = orderTime;
        this.isOrderComplete = isOrderComplete;
        this.remarks = remarks;
    }

    public DriverOrder() {

    }

    public void setDriverId(String driverId) {
        this.driverId = driverId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public void setRestaurantId(String restaurantId) {
        this.restaurantId = restaurantId;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public void setOrderItems(String[] orderItems) {
        this.orderItems = orderItems;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public void setOrderDate(String orderDate) {
        this.orderDate = orderDate;
    }

    public void setOrderTime(String orderTime) {
        this.orderTime = orderTime;
    }

    public void setOrderComplete(Boolean orderComplete) {
        isOrderComplete = orderComplete;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public String getDriverId() {
        return driverId;
    }

    public String getOrderId() {
        return orderId;
    }

    public String getUserId() {
        return userId;
    }

    public String getUserName() {
        return userName;
    }

    public String getRestaurantId() {
        return restaurantId;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public String[] getOrderItems() {
        return orderItems;
    }

    public Double getPrice() {
        return price;
    }

    public String getOrderDate() {
        return orderDate;
    }

    public String getOrderTime() {
        return orderTime;
    }

    public Boolean getOrderComplete() {
        return isOrderComplete;
    }

    public String getRemarks() {
        return remarks;
    }
}
