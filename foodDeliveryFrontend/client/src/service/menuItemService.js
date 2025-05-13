const API_BASE_URL = "http://localhost:8089/api";

export const menuItemService = {
  createMenuItem: async (menuItemData, token) => {
    return fetch(`${API_BASE_URL}/restaurants/menu-items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(menuItemData),
    });
  },

  getMenuItemById: async (id) => {
    return fetch(`${API_BASE_URL}/restaurants/menu-items/${id}`);
  },

  getMenuItemsByRestaurantId: async (restaurantId, token) => {
    return fetch(
      `${API_BASE_URL}/restaurants/menu-items/by-restaurant/${restaurantId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  getMenuItemsByCategoryId: async (categoryId, token) => {
    return fetch(
      `${API_BASE_URL}/restaurants/menu-items/by-category/${categoryId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  updateMenuItem: async (id, menuItemData, token) => {
    return fetch(`${API_BASE_URL}/restaurants/menu-items/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(menuItemData),
    });
  },

  deleteMenuItem: async (id, token) => {
    return fetch(`${API_BASE_URL}/restaurants/menu-items/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
