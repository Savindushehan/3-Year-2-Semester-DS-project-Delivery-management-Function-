const API_URL = "http://localhost:8089/api/restaurants";

export const publicRestaurantService = {
  /**
   * Get all enabled restaurants
   * @returns {Promise<Response>} - Fetch response
   */
  getAllEnabledRestaurants: async (token) => {
    const res = await fetch(`${API_URL}/all-users-access/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res;
  },

  /**
   * Get restaurant by ID
   * @param {string} id - Restaurant ID
   * @returns {Promise<Response>} - Fetch response
   */
  getRestaurantById: async (id,token) => {
    const res = await fetch(`${API_URL}/all-users-access/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res;
  },

  /**
   * Get all active cuisine types
   * @returns {Promise<Response>} - Fetch response
   */
  getActiveCuisineTypes: async (token) => {
    const res = await fetch(`${API_URL}/all-users-access/cuisine-types/active`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res;
  },

  /**
   * Get cuisine type by ID
   * @param {string} id - Cuisine type ID
   * @returns {Promise<Response>} - Fetch response
   */
  getCuisineTypeById: async (id,token) => {
    const res = await fetch(`${API_URL}/all-users-access/cuisine-types/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res;
  },

  /**
   * Get menu categories by restaurant ID
   * @param {string} restaurantId - Restaurant ID
   * @returns {Promise<Response>} - Fetch response
   */
  getCategoriesByRestaurantId: async (restaurantId,token) => {
    const res = await fetch(`${API_URL}/all-users-access/menu-categories/by-restaurant/${restaurantId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res;
  },

  /**
   * Get menu items by restaurant ID
   * @param {string} restaurantId - Restaurant ID
   * @returns {Promise<Response>} - Fetch response
   */
  getMenuItemsByRestaurantId: async (restaurantId,token) => {
    const res = await fetch(`${API_URL}/all-users-access/menu-items/restaurant/${restaurantId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res;
  },

  /**
   * Get menu items by category ID
   * @param {string} categoryId - Category ID
   * @returns {Promise<Response>} - Fetch response
   */
  getMenuItemsByCategoryId: async (categoryId,token) => {
    const res = await fetch(`${API_URL}/all-users-access/menu-items/category/${categoryId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res;
  },

  /**
   * Get nearby restaurants based on location
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} radius - Search radius in kilometers (default: 10)
   * @returns {Promise<Response>} - Fetch response
   */
  getNearbyRestaurants: async (lat, lng, radius = 10,token) => {
    const res = await fetch(
      `${API_URL}/all-users-access/nearby?lat=${lat}&lng=${lng}&radius=${radius}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res;
  }
};