import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ViewDeliveryDrivers() {
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    // Fetch all delivery drivers when the component mounts
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      //      const response = await axios.get("http://localhost:9002/api/deliveryDriver");
      const response = await axios.get("http://localhost:8089/api/deliveryDriver");
      setDrivers(response.data);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  const handleDelete = async (driverId) => {
    try {
    //  await axios.delete(`http://localhost:9002/api/deliveryDriver/${driverId}`);
      await axios.delete(`http://localhost:8089/api/deliveryDriver/${driverId}`);
      alert("Driver Deleted!");
      fetchDrivers(); // Refresh the list after deleting
    } catch (error) {
      console.error("Error deleting driver:", error);
      alert("Failed to delete driver");
    }
  };

  const handleUpdate = (driverId) => {
    alert(`Redirect to update page for driver ID: ${driverId}`);
    // Here you would typically navigate to an update form or component
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>View Delivery Drivers</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Driver ID</th>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Phone</th>
            <th style={styles.th}>Vehicle Type</th>
            <th style={styles.th}>Vehicle Number</th>
            <th style={styles.th}>City</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((driver) => (
            <tr key={driver.driverId} style={styles.tr}>
              <td style={styles.td}>{driver.driverId}</td>
              <td style={styles.td}>{driver.driverName}</td>
              <td style={styles.td}>{driver.driverPhone}</td>
              <td style={styles.td}>{driver.vehicleType}</td>
              <td style={styles.td}>{driver.vehicleNumber}</td>
              <td style={styles.td}>{driver.workingCity}</td>
              <td style={styles.td}>
                <button
                  style={styles.button}
                  onClick={() => handleUpdate(driver.driverId)}
                >
                  Update
                </button>
                <button
                  style={{ ...styles.button, backgroundColor: "#f44336" }}
                  onClick={() => handleDelete(driver.driverId)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    textAlign: "center",
    color: "#333",
    marginBottom: "20px",
    fontSize: "24px",
    fontWeight: "bold",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  th: {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "12px 15px",
    textAlign: "left",
    fontSize: "16px",
    fontWeight: "bold",
  },
  td: {
    padding: "12px 15px",
    textAlign: "left",
    fontSize: "14px",
    borderBottom: "1px solid #ddd",
    color: "#555",
  },
  tr: {
    transition: "background-color 0.3s",
  },
  button: {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "8px 16px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    marginRight: "8px",
    transition: "background-color 0.3s",
  },
  buttonHover: {
    backgroundColor: "#45a049",
  },
  trHover: {
    backgroundColor: "#f1f1f1",
  },
};

// Add hover effect for rows
const rowHoverStyle = {
  "&:hover": {
    backgroundColor: "#f1f1f1",
  },
};
