package Delivery_Replication.Delivery_Replication.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
//import javax.validation.constraints.NotNull;
//import javax.validation.constraints.NotBlank;

import java.sql.Time;
import java.util.Date;

@Document(collection = "delivery_replication")
public class DeliveryReplication {

    @Id
    private String orderId;
    private String userId;
    private String userName;
    private String userPhoneNo;
    private String restaurantId;
    private String deliveryAddress;
    private String[] orderItems;
    private Double price;
    private String orderDate;
    private String orderTime;
    private Boolean isAssignDriver;
    private String driverId;
    private String driverName;
    private String driverPhoneNo;
    private Boolean isOrderDeliveredComplete;
    private String driverRemark;
    private String userRemark;

    public DeliveryReplication(String orderId, String userId, String userName, String userPhoneNo, String restaurantId, String deliveryAddress,String[] orderItems,Double price, String orderDate, String orderTime, Boolean isAssignDriver, String driverId, String driverName, String driverPhoneNo, Boolean isOrderDeliveredComplete, String driverRemark, String userRemark) {
        this.orderId = orderId;
        this.userId = userId;
        this.userName = userName;
        this.userPhoneNo = userPhoneNo;
        this.restaurantId = restaurantId;
        this.deliveryAddress = deliveryAddress;
        this.orderItems = orderItems;
        this.price = price;
        this.orderDate = orderDate;
        this.orderTime = orderTime;
        this.isAssignDriver = isAssignDriver;
        this.driverId = driverId;
        this.driverName = driverName;
        this.driverPhoneNo = driverPhoneNo;
        this.isOrderDeliveredComplete = isOrderDeliveredComplete;
        this.driverRemark = driverRemark;
        this.userRemark = userRemark;
    }
    public DeliveryReplication(){}

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public void setUserPhoneNo(String userPhoneNo) {
        this.userPhoneNo = userPhoneNo;
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

    public void setAssignDriver(Boolean assignDriver) {
        isAssignDriver = assignDriver;
    }

    public void setDriverId(String driverId) {
        this.driverId = driverId;
    }

    public void setDriverName(String driverName) {
        this.driverName = driverName;
    }

    public void setDriverPhoneNo(String driverPhoneNo) {
        this.driverPhoneNo = driverPhoneNo;
    }

    public void setOrderDeliveredComplete(Boolean orderDeliveredComplete) {
        isOrderDeliveredComplete = orderDeliveredComplete;
    }

    public void setDriverRemark(String driverRemark) {
        this.driverRemark = driverRemark;
    }

    public void setUserRemark(String userRemark) {
        this.userRemark = userRemark;
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

    public String getUserPhoneNo() {
        return userPhoneNo;
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

    public Boolean getAssignDriver() {
        return isAssignDriver;
    }

    public String getDriverId() {
        return driverId;
    }

    public String getDriverName() {
        return driverName;
    }

    public String getDriverPhoneNo() {
        return driverPhoneNo;
    }

    public Boolean getOrderDeliveredComplete() {
        return isOrderDeliveredComplete;
    }

    public String getDriverRemark() {
        return driverRemark;
    }

    public String getUserRemark() {
        return userRemark;
    }
}
