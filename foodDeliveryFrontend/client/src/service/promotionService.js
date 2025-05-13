// src/service/promotionService.js

const API_URL = "http://localhost:8089/api/restaurants";

export const promotionService = {
  // Create promotion
  createPromotion: async (promotionData, token) => {
    const res = await fetch(`${API_URL}/promotions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(promotionData),
    });
    return res;
  },

  // Update promotion
  updatePromotion: async (promotionId, promotionData, token) => {
    const res = await fetch(`${API_URL}/promotions/${promotionId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(promotionData),
    });
    return res;
  },

  // Delete promotion
  deletePromotion: async (promotionId, token) => {
    const res = await fetch(`${API_URL}/promotions/${promotionId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res;
  },

  // Validate promotion code
  validatePromotion: async (validationData, token = null) => {
    const headers = {
      "Content-Type": "application/json",
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const res = await fetch(`${API_URL}/promotions/validate`, {
      method: "POST",
      headers,
      body: JSON.stringify(validationData),
    });
    return res;
  },

  // Get all promotions by restaurant ID
  getPromotionsByRestaurantId: async (restaurantId, token = null) => {
    const headers = {
      "Content-Type": "application/json",
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const res = await fetch(`${API_URL}/promotions/restaurant/${restaurantId}`, {
      method: "GET",
      headers,
    });
    return res;
  },

  // Get only active promotions by restaurant ID
  getActivePromotionsByRestaurantId: async (restaurantId, token) => {
    const headers = {
      "Content-Type": "application/json",
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const res = await fetch(`${API_URL}/promotions/restaurant/${restaurantId}/active`, {
      method: "GET",
      headers,
    });
    return res;
  },
};