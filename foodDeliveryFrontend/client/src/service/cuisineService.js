// src/services/cuisineTypeService.js

const API_URL = "http://localhost:8089/api/restaurants";

export const cuisineTypeService = {
  // Get all cuisine types
  getAllCuisineTypes: async (token) => {
    const res = await fetch(`${API_URL}/cuisine-types`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res;
  },

  // Get cuisine type by ID
  getCuisineTypeById: async (id) => {
    const res = await fetch(`${API_URL}/cuisine-types/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res;
  },

  // Create new cuisine type (admin only)
  createCuisineType: async (cuisineTypeData, token) => {
    const res = await fetch(`${API_URL}/cuisine-types`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(cuisineTypeData),
    });
    return res;
  },

  // Update cuisine type (admin only)
  updateCuisineType: async (id, cuisineTypeData, token) => {
    const res = await fetch(`${API_URL}/cuisine-types/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(cuisineTypeData),
    });
    return res;
  },

  // Delete cuisine type (admin only)
  deleteCuisineType: async (id, token) => {
    const res = await fetch(`${API_URL}/cuisine-types/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res;
  },

  // Add restaurant to cuisine type (admin only)
  addRestaurantToCuisineType: async (cuisineTypeId, restaurantId, token) => {
    const res = await fetch(
      `${API_URL}/cuisine-types/${cuisineTypeId}/restaurants/${restaurantId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res;
  },

  // Remove restaurant from cuisine type (admin only)
  removeRestaurantFromCuisineType: async (
    cuisineTypeId,
    restaurantId,
    token
  ) => {
    const res = await fetch(
      `${API_URL}/cuisine-types/${cuisineTypeId}/restaurants/${restaurantId}`,
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
};
