// src/service/menuCategoryService.js

const API_URL = "http://localhost:8089/api/restaurants";

export const menuCategoryService = {
  // Create menu category
  createCategory: async (categoryData, token) => {
    const res = await fetch(`${API_URL}/menu-categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(categoryData),
    });
    return res;
  },

  // Update menu category
  updateCategory: async (categoryId, categoryData, token) => {
    const res = await fetch(`${API_URL}/menu-categories/${categoryId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(categoryData),
    });
    return res;
  },

  // Delete menu category
  deleteCategory: async (categoryId, token) => {
    const res = await fetch(`${API_URL}/menu-categories/${categoryId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res;
  },

  // Get menu category by ID
  getCategoryById: async (categoryId) => {
    const res = await fetch(`${API_URL}/menu-categories/${categoryId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res;
  },

  // Get menu categories by restaurant ID
  getCategoriesByRestaurantId: async (restaurantId,token) => {
    const res = await fetch(`${API_URL}/menu-categories/by-restaurant/${restaurantId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res;
  },

  // Reorder menu categories
  reorderCategories: async (restaurantId, categoryIds, token) => {
    const res = await fetch(`${API_URL}/menu-categories/reorder/${restaurantId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ categoryIds }),
    });
    return res;
  },
};