package Delivery_driverService.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
@Document(collection = "delivery_driver")
public class DeliveryDriver {

    private String driverId;
    private String driverName;
    private String driverAddress;
    private String driverPhone;
    private String vehicleType;
    private String vehicleNumber;
    private String workingCity;

    public DeliveryDriver(String driverId, String driverName, String driverAddress, String driverPhone, String vehicleType, String vehicleNumber, String workingCity) {
        this.driverId = driverId;
        this.driverName = driverName;
        this.driverAddress = driverAddress;
        this.driverPhone = driverPhone;
        this.vehicleType = vehicleType;
        this.vehicleNumber = vehicleNumber;
        this.workingCity = workingCity;
    }

    public void setDriverId(String driverId) {
        this.driverId = driverId;
    }

    public void setDriverName(String driverName) {
        this.driverName = driverName;
    }

    public void setDriverAddress(String driverAddress) {
        this.driverAddress = driverAddress;
    }

    public void setDriverPhone(String driverPhone) {
        this.driverPhone = driverPhone;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public void setWorkingCity(String workingCity) {
        workingCity = workingCity;
    }

    public String getDriverId() {
        return driverId;
    }

    public String getDriverName() {
        return driverName;
    }

    public String getDriverAddress() {
        return driverAddress;
    }

    public String getDriverPhone() {
        return driverPhone;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public String getWorkingCity() {
        return workingCity;
    }
}
