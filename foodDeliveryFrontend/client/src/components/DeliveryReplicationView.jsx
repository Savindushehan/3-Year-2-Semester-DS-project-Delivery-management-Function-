import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography
} from "@mui/material";

const DeliveryReplicationView = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8089/api/deliveryReplication")
      .then((response) => {
        if (!response.ok) {
          return response.text().then(text => {
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${text}`);
          });
        }
        return response.json();
      })
      .then((data) => {
        setDeliveries(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </div>
    );
  }

  const getOrderIdStyle = (assignDriver, orderDeliveredComplete) => {
    if (!assignDriver) return { color: 'red' };
    if (assignDriver && !orderDeliveredComplete) return { color: 'orange' };
    return { color: 'green' };
  };

  return (
    <div style={{ padding: '20px', maxWidth: '100vw', overflowX: 'hidden' }}>
      <Typography variant="h4" gutterBottom align="center">
        Delivery Order Data
      </Typography>

      <TableContainer component={Paper}>
        {/* ✅ Only this scrolls horizontally */}
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <Table sx={{ minWidth: 1600 }}>
            <TableHead style={{ backgroundColor: "#FF5A1F" }}>
              <TableRow>
                <TableCell style={{ border: "1px solid white" }}>Order ID</TableCell>
                <TableCell style={{ border: "1px solid white" }}>User Name</TableCell>
                <TableCell style={{ border: "1px solid white" }}>User Phone</TableCell>
                <TableCell style={{ border: "1px solid white" }}>Restaurant ID</TableCell>
                <TableCell style={{ border: "1px solid white" }}>Delivery Address</TableCell>
                <TableCell style={{ border: "1px solid white" }}>Order Items</TableCell>
                <TableCell style={{ border: "1px solid white" }}>Price</TableCell>
                <TableCell style={{ border: "1px solid white" }}>Order Date</TableCell>
                <TableCell style={{ border: "1px solid white" }}>Order Time</TableCell>
                <TableCell style={{ border: "1px solid white" }}>Assign Driver</TableCell>
                <TableCell style={{ border: "1px solid white" }}>Driver Name</TableCell>
                <TableCell style={{ border: "1px solid white" }}>Driver Phone</TableCell>
                <TableCell style={{ border: "1px solid white" }}>Delivered</TableCell>
                <TableCell style={{ border: "1px solid white" }}>Driver Remark</TableCell>
                <TableCell style={{ border: "1px solid white" }}>User Remark</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {deliveries.map((delivery) => (
                <TableRow key={delivery.orderId}>
                  <TableCell style={getOrderIdStyle(delivery.isAssignDriver, delivery.orderDeliveredComplete)}>
                    {delivery.orderId}
                  </TableCell>
                  <TableCell>{delivery.userName}</TableCell>
                  <TableCell>{delivery.userPhoneNo}</TableCell>
                  <TableCell>{delivery.restaurantId}</TableCell>
                  <TableCell>{delivery.deliveryAddress}</TableCell>
                  <TableCell>{delivery.orderItems.join(", ")}</TableCell>
                  <TableCell>{delivery.price}</TableCell>
                  <TableCell>{delivery.orderDate}</TableCell>
                  <TableCell>{delivery.orderTime}</TableCell>
                  <TableCell>{delivery.isAssignDriver ? "Yes" : "No"}</TableCell>
                  <TableCell>{delivery.driverName}</TableCell>
                  <TableCell>{delivery.driverPhoneNo}</TableCell>
                  <TableCell>{delivery.orderDeliveredComplete ? "Yes" : "No"}</TableCell>
                  <TableCell>{delivery.driverRemark}</TableCell>
                  <TableCell>{delivery.userRemark}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TableContainer>
    </div>
  );
};

export default DeliveryReplicationView;
