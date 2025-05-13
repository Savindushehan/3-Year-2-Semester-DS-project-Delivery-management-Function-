import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Box,
  Button,
} from "@mui/material";
import UpdateIcon from "@mui/icons-material/Update";
import MapIcon from "@mui/icons-material/Map";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

const DeliveryAssignOrders = ({ driverId = "DRV123" }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const driverID = currentUser?.username;
    const fetchDriverOrders = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8089/api/driver-orders/orders/${driverID}`
        );
        setOrders(response.data);
      } catch (err) {
        setError("Failed to fetch driver orders.");
      } finally {
        setLoading(false);
      }
    };

    if (driverID) {
      fetchDriverOrders();
    }
  }, [driverId, currentUser]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={6} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h4" gutterBottom color="primary">
          Orders for Driver ID: <strong>{currentUser?.username}</strong>
        </Typography>

        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
            <CircularProgress color="primary" />
          </Box>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && (
          <>
            {orders.length === 0 ? (
              <Typography color="textSecondary">No orders found.</Typography>
            ) : (
              <TableContainer
                component={Paper}
                sx={{
                  mt: 2,
                  overflowX: "auto",
                }}
              >
                <Box sx={{ minWidth: "1200px" }}>
                  <Table>
                    <TableHead sx={{ backgroundColor: "#1976d2" }}>
                      <TableRow>
                        <TableCell sx={{ color: "#fff" }}>Order ID</TableCell>
                        <TableCell sx={{ color: "#fff" }}>User</TableCell>
                        <TableCell sx={{ color: "#fff" }}>Restaurant</TableCell>
                        <TableCell sx={{ color: "#fff" }}>Address</TableCell>
                        <TableCell sx={{ color: "#fff" }}>Items</TableCell>
                        <TableCell sx={{ color: "#fff" }}>Price</TableCell>
                        <TableCell sx={{ color: "#fff" }}>Date</TableCell>
                        <TableCell sx={{ color: "#fff" }}>Time</TableCell>
                        <TableCell sx={{ color: "#fff" }}>Completed</TableCell>
                        <TableCell sx={{ color: "#fff" }}>Remarks</TableCell>
                        <TableCell sx={{ color: "#fff" }}>Delivery Update</TableCell>
                        <TableCell sx={{ color: "#fff" }}>Share Location</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.orderId}>
                          <TableCell>{order.orderId}</TableCell>
                          <TableCell>{order.userName}</TableCell>
                          <TableCell>{order.restaurantId}</TableCell>
                          <TableCell>{order.deliveryAddress}</TableCell>
                          <TableCell>{order.orderItems.join(", ")}</TableCell>
                          <TableCell sx={{ color: "green", fontWeight: 600 }}>
                            ${order.price}
                          </TableCell>
                          <TableCell>{order.orderDate}</TableCell>
                          <TableCell>{order.orderTime}</TableCell>
                          <TableCell>
                            <Chip
                              label={order.orderComplete ? "Yes" : "No"}
                              color={order.orderComplete ? "success" : "error"}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{order.remarks || "-"}</TableCell>
                          <TableCell>
                            {!order.orderComplete && (
                              <Button
                                variant="contained"
                                color="warning"
                                size="small"
                                startIcon={<UpdateIcon />}
                                onClick={() =>
                                  navigate(`/update-order/${order.orderId}`)
                                }
                                sx={{
                                  textTransform: "none",
                                  fontWeight: "bold",
                                  borderRadius: 2,
                                  boxShadow: 1,
                                  "&:hover": {
                                    backgroundColor: "#f57c00",
                                  },
                                }}
                              >
                                Update
                              </Button>
                            )}
                          </TableCell>
                          <TableCell>
                            {!order.orderComplete && (
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<MapIcon />}
                                onClick={() =>
                                  navigate(`/location-map/${order.orderId}/${order.userId}`)
                                }
                                sx={{
                                  textTransform: "none",
                                  fontWeight: "bold",
                                  borderRadius: 2,
                                  boxShadow: 1,
                                  backgroundColor: "#52be80",
                                  "&:hover": {
                                    backgroundColor: "#45a163",
                                  },
                                }}
                              >
                                Map
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </TableContainer>
            )}
          </>
        )}
      </Paper>
    </Container>
  );
};

export default DeliveryAssignOrders;
