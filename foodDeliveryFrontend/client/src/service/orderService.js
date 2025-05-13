// src/service/orderService.js

const API_URL = "http://localhost:8089/api/orders";

export const orderService = {
  // Create a new order
  createOrder: async (orderData, token) => {
    const res = await fetch(`${API_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });
    return res;
  },

  // Update order status (restaurant admin or admin only)
  updateOrderStatus: async (orderId, status, token) => {
    const res = await fetch(`${API_URL}/${orderId}/status?status=${status}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res;
  },

  // Get order by ID
  getOrderById: async (orderId, token) => {
    const res = await fetch(`${API_URL}/${orderId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res;
  },

  // Get orders for a specific user
  getOrdersByUserId: async (userId, token) => {
    const res = await fetch(`${API_URL}/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res;
  },

  // Get orders for a specific restaurant (restaurant admin only)
  getOrdersByRestaurantId: async (restaurantId, token) => {
    const res = await fetch(`${API_URL}/restaurant/${restaurantId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res;
  },

  // Cancel an order
  cancelOrder: async (orderId, token) => {
    const res = await fetch(`${API_URL}/${orderId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res;
  },

  // Helper function to handle common fetch errors
  handleResponse: async (response) => {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: "Unknown error occurred"
      }));
      
      // Check if service is unavailable
      if (response.status === 503) {
        throw new Error("Service temporarily unavailable. Please try again later.");
      }
      
      throw new Error(errorData.error || `Error: ${response.statusText}`);
    }
    
    // Check if response is empty (for DELETE operations)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }
    
    return true; // For successful operations with no response body
  }
};