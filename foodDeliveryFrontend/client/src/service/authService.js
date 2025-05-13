// src/services/authService.js

const API_URL = "http://localhost:8089/api";

export const authService = {
  // Sign up new user
  register: async (userData) => {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    return res;
  },

  // Sign in user
  login: async (username, password) => {
    const res = await fetch(`${API_URL}/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    return res;
  },

  // Request password reset
  requestPasswordReset: async (email) => {
    const res = await fetch(`${API_URL}/auth/forgot-password?email=${email}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res;
  },

  // Reset password with token
  resetPassword: async (token, newPassword) => {
    const res = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, newPassword }),
    });
    return res;
  },

  // Validate reset token

  validateToken: async (token) => {
    const res = await fetch(
      `${API_URL}/auth/password/validate?token=${token}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res;
  },

  logout: async (token) => {
    const res = await fetch(`${API_URL}/users/signout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res;
  },

  getAllUsers: async (token) => {
    const res = await fetch(`${API_URL}/users/all-users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res;
  },

  google: async (userData) => {
    const res = await fetch(`${API_URL}/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    return res;
  },

  getUserDetails: async (token) => {
    const res = await fetch(`${API_URL}/users/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res;
  },

  updateUserDetails: async (userData, token) => {
    const res = await fetch(`${API_URL}/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
    return res;
  },

  createUser: async (userData, token) => {
    const res = await fetch(`${API_URL}/users/create-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
    return res;
  },

  updateUser: async (userId, userData, token) => {
    const res = await fetch(`${API_URL}/users/update-user/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
    return res;
  },

  getUserByRole: async (role, token) => {
    const res = await fetch(`${API_URL}/users/by-role?roleName=${role}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res;
  },

  // For restaurant admin users specifically (to use in restaurant creation form)
  getRestaurantAdmins: async (token) => {
    return authService.getUserByRole("ROLE_RESTAURANT_ADMIN", token);
  },
};
