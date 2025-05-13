// src/service/restaurantService.js

const API_URL = "http://localhost:8089/api";

export const restaurantService = {
  /**
   * Create a new restaurant
   * @param {Object} restaurantData - Restaurant data object
   * @param {string} token - Authentication token
   * @returns {Promise<Response>} - Fetch response
   */
  createRestaurant: async (restaurantData, token) => {
    const res = await fetch(`${API_URL}/restaurants`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(restaurantData),
    });
    return res;
  },

  /**
   * Update an existing restaurant
   * @param {string} id - Restaurant ID
   * @param {Object} restaurantData - Updated restaurant data
   * @param {string} token - Authentication token
   * @returns {Promise<Response>} - Fetch response
   */
  updateRestaurant: async (id, restaurantData, token) => {
    const res = await fetch(`${API_URL}/restaurants/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(restaurantData),
    });
    return res;
  },

  /**
   * Get a specific restaurant by ID
   * @param {string} id - Restaurant ID
   * @returns {Promise<Response>} - Fetch response
   */
  getRestaurantById: async (id,token) => {
    const res = await fetch(`${API_URL}/restaurants/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res;
  },

  /**
   * Get all restaurants
   * @returns {Promise<Response>} - Fetch response
   */
  getAllRestaurants: async (token) => {
    const res = await fetch(`${API_URL}/restaurants`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res;
  },

  /**
   * Get restaurants managed by the current logged-in user
   * @param {string} token - Authentication token
   * @returns {Promise<Response>} - Fetch response
   */
  getMyRestaurants: async (token) => {
    const res = await fetch(`${API_URL}/restaurants/my-restaurants`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res;
  },

  /**
   * Delete a restaurant
   * @param {string} id - Restaurant ID
   * @param {string} token - Authentication token
   * @returns {Promise<Response>} - Fetch response
   */
  deleteRestaurant: async (id, token) => {
    const res = await fetch(`${API_URL}/restaurants/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res;
  },

  /**
   * Get restaurants by cuisine type
   * @param {string} cuisineId - Cuisine type ID
   * @returns {Promise<Response>} - Fetch response
   */
  getRestaurantsByCuisine: async (cuisineId) => {
    const res = await fetch(`${API_URL}/restaurants/cuisine/${cuisineId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res;
  },

  /**
   * Search restaurants by name or description
   * @param {string} query - Search query
   * @returns {Promise<Response>} - Fetch response
   */
  searchRestaurants: async (query) => {
    const res = await fetch(
      `${API_URL}/restaurants/search?q=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res;
  },

  /**
   * Toggle restaurant enabled/disabled status
   * @param {string} id - Restaurant ID
   * @param {boolean} enabled - New enabled status
   * @param {string} token - Authentication token
   * @returns {Promise<Response>} - Fetch response
   */
  toggleRestaurantStatus: async (id, enabled, token) => {
    const res = await fetch(`${API_URL}/restaurants/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ enabled }),
    });
    return res;
  },

  /**
   * Get nearby restaurants based on location
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} radius - Search radius in kilometers
   * @returns {Promise<Response>} - Fetch response
   */
  getNearbyRestaurants: async (lat, lng, radius = 5,token) => {
    const res = await fetch(
      `${API_URL}/restaurants/nearby?lat=${lat}&lng=${lng}&radius=${radius}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res;
  },

  /**
   * Add an admin to a restaurant
   * @param {string} restaurantId - Restaurant ID
   * @param {string} adminId - Admin user ID
   * @param {string} token - Authentication token
   * @returns {Promise<Response>} - Fetch response
   */
  addRestaurantAdmin: async (restaurantId, adminId, token) => {
    const res = await fetch(`${API_URL}/restaurants/${restaurantId}/admins`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ adminId }),
    });
    return res;
  },

  /**
   * Remove an admin from a restaurant
   * @param {string} restaurantId - Restaurant ID
   * @param {string} adminId - Admin user ID
   * @param {string} token - Authentication token
   * @returns {Promise<Response>} - Fetch response
   */
  removeRestaurantAdmin: async (restaurantId, adminId, token) => {
    const res = await fetch(
      `${API_URL}/restaurants/${restaurantId}/admins/${adminId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res;
  },

  getRestaurantsByUserId: async (userId, token) => {
    const res = await fetch(`${API_URL}/restaurants/by-user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res;
  },
  generateRestaurantReport: async (restaurantId, token) => {
    try {
      const response = await fetch(`${API_URL}/restaurants/reports/${restaurantId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        // Important for PDF download
        responseType: 'blob'
      });
      
      return response;
    } catch (error) {
      console.error("Error generating report:", error);
      throw error;
    }
  }

};
