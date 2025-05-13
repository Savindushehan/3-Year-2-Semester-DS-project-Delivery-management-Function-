import React, { useState } from "react";
import {
  Container,
  Grid,
  TextField,
  Button,
  Typography,
  MenuItem,
  Paper
} from "@mui/material";
import axios from "axios";

export default function RegisterDeliveryDriver() {
  const [formData, setFormData] = useState({
    driverId: "",
    driverName: "",
    driverAddress: "",
    driverPhone: "",
    vehicleType: "bike",
    vehicleNumber: "",
    workingCity: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8089/api/deliveryDriver", formData);
      alert("Driver Registered: " + response.data);
    } catch (error) {
      console.error("Error registering driver:", error);
      alert("Failed to register driver");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #f9f6f2, #ffe3cc)",
        padding: "40px 0"
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 4,
            backgroundColor: "#fff8f0"
          }}
        >
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{
              fontWeight: "bold",
              color: "#FF5A1F",
              mb: 3
            }}
          >
            Register Delivery Driver
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Driver ID"
                  name="driverId"
                  value={formData.driverId}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  sx={{ backgroundColor: "white" }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Driver Name"
                  name="driverName"
                  value={formData.driverName}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  sx={{ backgroundColor: "white" }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Driver Address"
                  name="driverAddress"
                  value={formData.driverAddress}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  sx={{ backgroundColor: "white" }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Driver Phone"
                  name="driverPhone"
                  value={formData.driverPhone}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  sx={{ backgroundColor: "white" }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Vehicle Type"
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ backgroundColor: "white" }}
                >
                  <MenuItem value="bike">Bike</MenuItem>
                  <MenuItem value="car">Car</MenuItem>
                  <MenuItem value="threewheels">Three Wheels</MenuItem>
                  <MenuItem value="van">Van</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Vehicle Number"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  sx={{ backgroundColor: "white" }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Working City"
                  name="workingCity"
                  value={formData.workingCity}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  sx={{ backgroundColor: "white" }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    py: 1.5,
                    mt: 2,
                    fontSize: 16,
                    backgroundColor: "#FF5A1F",
                    "&:hover": {
                      backgroundColor: "#e04d1c"
                    }
                  }}
                >
                  Submit
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </div>
  );
}
