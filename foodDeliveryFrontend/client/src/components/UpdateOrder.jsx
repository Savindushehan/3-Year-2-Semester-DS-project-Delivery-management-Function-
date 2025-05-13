// import React, { useEffect, useState } from "react";
// import {
//   Container,
//   Typography,
//   TextField,
//   Button,
//   CircularProgress,
//   Box,
//   Paper,
//   Select,
//   MenuItem,
//   FormControl,
//   InputLabel,
// } from "@mui/material";
// import axios from "axios";
// import { useParams, useNavigate } from "react-router-dom";

// const UpdateOrderPage = () => {
//   const { orderId } = useParams();
//   const navigate = useNavigate();

//   const [loading, setLoading] = useState(true);
//   const [remark, setRemark] = useState("");
//   const [status, setStatus] = useState("still_ordering"); // new status field
//   const [orderData, setOrderData] = useState(null);

//   useEffect(() => {
//     const fetchOrder = async () => {
//       try {
//         //         const res = await axios.get(`http://localhost:8081/api/driver-orders/order-by-id/${orderId}`);
//         const res = await axios.get(`http://localhost:8089/api/driver-orders/order-by-id/${orderId}`);
//         const currentOrder = res.data[0];

//         if (currentOrder) {
//           setOrderData(currentOrder);
//           setRemark(currentOrder.remarks || "");

//           // Map boolean or status field to string status
//           if (currentOrder.status) {
//             setStatus(currentOrder.status); // assuming API already returns string status
//           } else {
//             setStatus(currentOrder.isOrderComplete ? "completed" : "still_ordering");
//           }
//         }
//       } catch (err) {
//         console.error("Failed to fetch order:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrder();
//   }, [orderId]);

//   // const handleUpdate = async () => {
//   //   if (!orderData) return;

//   //   const updatedOrder = {
//   //     ...orderData,
//   //     remarks: remark,
//   //     status: status, // updated with selected value
//   //     isOrderComplete: status === "completed", // optional backward compatibility
//   //   };

//   //   try {
//   //     await axios.put(`http://localhost:8081/api/driver-orders/${orderId}`, updatedOrder);
//   //     alert("Order updated successfully");
//   //     navigate("/DeliveryAssignOrders");
//   //   } catch (error) {
//   //     console.error("Error updating order:", error);
//   //     alert("Failed to update order");
//   //   }
//   // };

//   // const handleUpdate = async () => {
//   //   if (!orderData) return;
  
//   //   let updatedOrder = {
//   //     ...orderData,
//   //     remarks: remark,
//   //     status: status,
//   //     isOrderComplete: status === "completed",
//   //   };
  
//   //   // If status is NOT "completed", fetch and update deliveryReplication
//   //   if (status !== "completed") {
//   //     try {
//   //       const replicationRes = await axios.get(`http://localhost:9001/api/deliveryReplication/${orderId}`);
//   //       const replicationData = replicationRes.data;
  
//   //       console.log("Replication data:", replicationData);
  
//   //       // Modify replication fields based on status
//   //       let updatedReplication = { 
//   //         ...replicationData,  // Spread all original data first
//   //         driverRemark: status === "completed" ? remark : replicationData.driverRemark,
//   //         isAssignDriver: status === "cant_deliver" ? false : replicationData.isAssignDriver,
//   //         driverName: status === "cant_deliver" ? null : replicationData.driverName,
//   //         driverPhoneNo: status === "cant_deliver" ? null : replicationData.driverPhoneNo,
//   //         isOrderDeliveredComplete: status === "completed" ? true : replicationData.isOrderDeliveredComplete
//   //       };
        
  
//   //       // PUT update to deliveryReplication service
//   //       await axios.put(`http://localhost:9001/api/deliveryReplication/${orderId}`, {
//   //         $set: updatedReplication
//   //       });
//   //       console.log("UpdateReplication Data:"+updatedReplication);
//   //       console.log("Replication updated");
  
//   //       // Copy needed fields into driver order update
//   //       updatedOrder.isAssignDriver = updatedReplication.isAssignDriver;
//   //       updatedOrder.isOrderDeliveredComplete = updatedReplication.isOrderDeliveredComplete;
//   //     } catch (error) {
//   //       console.error("Failed to fetch/update delivery replication data:", error);
//   //       alert("Could not update delivery replication data");
//   //       return;
//   //     }
//   //   }
  
//   //   // Update driver order
//   //   try {
//   //     await axios.put(`http://localhost:8081/api/driver-orders/${orderId}`, updatedOrder);
//   //     alert("Order updated successfully");
//   //     // navigate("/DeliveryAssignOrders");
//   //   } catch (error) {
//   //     console.error("Error updating driver order:", error);
//   //     alert("Failed to update order");
//   //   }
//   // };

//   const handleUpdate = async () => {
//     if (!orderData) return;
  
//     // 1. Update the driver order first
//     const updatedOrder = {
//       ...orderData,
//       remarks: remark,
//       status: status,
//       isOrderComplete: status === "completed",
//     };
  
//     try {
//       //      await axios.put(`http://localhost:8081/api/driver-orders/${orderId}`, updatedOrder);
//       await axios.put(`http://localhost:8089/api/driver-orders/${orderId}`, updatedOrder);
  
//       // 2. Handle replication update
//       try {
//         //         const replicationRes = await axios.get(`http://localhost:9001/api/deliveryReplication/${orderId}`);
//         const replicationRes = await axios.get(`http://localhost:8089/api/deliveryReplication/${orderId}`);
//         const currentReplication = replicationRes.data;
//         console.log(replicationRes.data);
  
//         // Create update payload - preserve ALL existing fields
//         const replicationUpdate = {
//           ...currentReplication, // Keep all existing data
//           driverRemark: remark, // Update remark
//           assignDriver: status === "cant_deliver" ? false : currentReplication.isAssignDriver,
//           isOrderDeliveredComplete: status === "completed",
//           ...(status === "cant_deliver" ? { // Only clear driver info if status is "can't deliver"
//             driverId: "NA",
//             driverName: "NA",
//             driverPhoneNo: "NA" 
//           } : {}),
//           assignDriver: status === "completed" ? true : currentReplication.isOrderDeliveredComplete,
          
//         };
  
//         // Remove MongoDB-specific fields that shouldn't be sent back
//         delete replicationUpdate._id;
//         delete replicationUpdate._class;
  
//         console.log("Sending replication update:", JSON.stringify(replicationUpdate, null, 2));
        
//         //         await axios.put(`http://localhost:9001/api/deliveryReplication/driver/${orderId}`, replicationUpdate);
//         await axios.put(`http://localhost:8089/api/deliveryReplication/driver/${orderId}`, replicationUpdate);
        
//         alert("Order updated successfully with all data preserved");
//         navigate("/DeliveryAssignOrders");
//       } catch (replicationError) {
//         console.error("Replication update failed:", replicationError.response?.data || replicationError.message);
//         alert("Order updated but replication failed - check console");
//       }
//     } catch (orderError) {
//       console.error("Order update failed:", orderError.response?.data || orderError.message);
//       alert("Failed to update order");
//     }
//   };
  

//   if (loading) {
//     return (
//       <Box display="flex" justifyContent="center" mt={5}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Container maxWidth="sm">
//       <Paper elevation={3} sx={{ p: 4, mt: 5 }}>
//         <Typography variant="h5" gutterBottom>
//           Update Order #{orderId}
//         </Typography>

//         <FormControl fullWidth margin="normal">
//           <InputLabel>Status</InputLabel>
//           <Select
//             value={status}
//             onChange={(e) => setStatus(e.target.value)}
//             label="Status"
//           >
//             <MenuItem value="completed">Completed</MenuItem>
//             <MenuItem value="still_ordering">Still Ordering</MenuItem>
//             <MenuItem value="cant_deliver">Can't Deliver</MenuItem>
//           </Select>
//         </FormControl>

//         <TextField
//           fullWidth
//           label="Remarks"
//           value={remark}
//           onChange={(e) => setRemark(e.target.value)}
//           margin="normal"
//         />

//         <Button
//           fullWidth
//           variant="contained"
//           color="primary"
//           onClick={handleUpdate}
//           sx={{ mt: 2 }}
//         >
//           Update Order
//         </Button>
//       </Paper>
//     </Container>
//   );
// };

// export default UpdateOrderPage;




import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Box,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { purple, green, red, amber } from "@mui/material/colors";

const UpdateOrderPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [remark, setRemark] = useState("");
  const [status, setStatus] = useState("still_ordering");
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`http://localhost:8089/api/driver-orders/order-by-id/${orderId}`);
        const currentOrder = res.data[0];

        if (currentOrder) {
          setOrderData(currentOrder);
          setRemark(currentOrder.remarks || "");
          setStatus(currentOrder.status || (currentOrder.isOrderComplete ? "completed" : "still_ordering"));
        }
      } catch (err) {
        console.error("Failed to fetch order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleUpdate = async () => {
    if (!orderData) return;

    const updatedOrder = {
      ...orderData,
      remarks: remark,
      status: status,
      isOrderComplete: status === "completed",
    };

    try {
      await axios.put(`http://localhost:8089/api/driver-orders/${orderId}`, updatedOrder);

      const replicationRes = await axios.get(`http://localhost:8089/api/deliveryReplication/${orderId}`);
      const currentReplication = replicationRes.data;

      const replicationUpdate = {
        ...currentReplication,
        driverRemark: remark,
        assignDriver: status === "cant_deliver" ? false : currentReplication.isAssignDriver,
        isOrderDeliveredComplete: status === "completed",
        ...(status === "cant_deliver" ? { driverId: "NA", driverName: "NA", driverPhoneNo: "NA" } : {}),
      };

      await axios.put(`http://localhost:8089/api/deliveryReplication/driver/${orderId}`, replicationUpdate);

      alert("Order updated successfully with all data preserved");
      navigate("/DeliveryAssignOrders");
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order");
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm">
      <Paper elevation={8} sx={{ p: 4, mt: 5, borderRadius: 2, backgroundColor: purple[50] }}>
        <Typography variant="h5" gutterBottom color="primary" sx={{ fontWeight: "bold" }}>
          Update Order #{orderId}
        </Typography>

        <FormControl fullWidth margin="normal">
          <InputLabel>Status</InputLabel>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            label="Status"
            sx={{
              backgroundColor: "#fff",
              borderRadius: 1,
              "& .MuiSelect-icon": { color: purple[700] },
            }}
          >
            <MenuItem value="completed" sx={{ backgroundColor: green[100] }}>
              Completed
            </MenuItem>
            <MenuItem value="still_ordering" sx={{ backgroundColor: amber[100] }}>
              Still Ordering
            </MenuItem>
            <MenuItem value="cant_deliver" sx={{ backgroundColor: red[100] }}>
              Can't Deliver
            </MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Remarks"
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          margin="normal"
          multiline
          rows={4}
          sx={{
            backgroundColor: "#fff",
            borderRadius: 1,
            "& .MuiInputBase-root": { borderRadius: 1 },
          }}
        />

        <Grid container spacing={2} sx={{ mt: 3 }}>
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleUpdate}
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                textTransform: "none",
                backgroundColor: purple[700],
                "&:hover": { backgroundColor: purple[900] },
              }}
            >
              Update Order
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default UpdateOrderPage;


