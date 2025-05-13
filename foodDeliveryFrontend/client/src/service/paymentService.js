const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8082/api/payments";

/**
 * Payment Service for handling all payment-related API calls
 */
const paymentService = {
  /**
   * Create a Payment Intent for Stripe
   * @param {Object} paymentData - Payment intent data
   * @param {number} paymentData.amount - Payment amount in dollars
   * @param {string} paymentData.orderId - Order ID
   * @param {string} paymentData.customerEmail - Customer email
   * @param {string} token - JWT authentication token
   * @returns {Promise<{clientSecret: string, paymentIntentId: string}>} - Payment intent details
   */
  createPaymentIntent: async (paymentData, token) => {
    try {
      if (paymentData.amount <= 0) {
        throw new Error('Payment amount must be positive');
      }

      console.log('Attempting to connect to:', `${API_BASE_URL}/create-payment-intent`);

      const response = await fetch(`${API_BASE_URL}/create-payment-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...paymentData,
          amount: parseFloat(paymentData.amount.toFixed(2))
        })
      });

      if (!response.ok) {
        // Improved error handling
        const errorText = await response.text();
        console.error('Backend response error:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`Backend error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Full PaymentService Error:", {
        message: error.message,
        stack: error.stack,
        type: error.name
      });
      throw new Error(`Payment initialization failed: ${error.message}`);
    }
  },

  /**
   * Confirm a payment after collecting card details
   * @param {Object} paymentData - Payment confirmation data
   * @param {string} paymentData.paymentIntentId - Payment Intent ID
   * @param {string} token - JWT authentication token
   * @returns {Promise<PaymentResponse>} - Payment response object
   */
  confirmPayment: async (paymentData, token) => {
      try {
          console.log('Confirming payment with data:', paymentData);

          const response = await fetch(`${API_BASE_URL}/confirm`, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({
                  paymentIntentId: paymentData.paymentIntentId
              })
          });

          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Payment confirmation failed');
          }

          return await response.json();
      } catch (error) {
          console.error("Payment confirmation error:", error);
          throw error;
      }
  },

  /**
   * Get all payments (Admin only)
   * @param {string} token - JWT authentication token
   * @returns {Promise<Array<PaymentDetails>>} - Array of payment objects
   */
  getAllPayments: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/all`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new TypeError("Response is not JSON");
      }

      return await response.json();
    } catch (error) {
      console.error("PaymentService Error - getAllPayments:", error);
      throw error;
    }
  },

  /**
   * Get all payments for a specific user by email
   * @param {string} email - User's email address
   * @param {string} token - JWT authentication token
   * @returns {Promise<Array<PaymentDetails>>} - Array of payment objects
   */
  getPaymentsByUser: async (email, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${email}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || 'Failed to fetch user payments');
        } catch {
          throw new Error(errorText || 'Failed to fetch user payments');
        }
      }

      return await response.json();
    } catch (error) {
      console.error("PaymentService Error - getPaymentsByUser:", error);
      throw error;
    }
  },

  /**
   * Get payment details by order ID
   * @param {string} orderId - Order ID
   * @param {string} token - JWT authentication token
   * @returns {Promise<PaymentDetails>} - Payment details object
   */
  getPaymentByOrderId: async (orderId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${orderId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || 'Payment not found');
        } catch {
          throw new Error(errorText || 'Payment not found');
        }
      }

      return await response.json();
    } catch (error) {
      console.error("PaymentService Error - getPaymentByOrderId:", error);
      throw error;
    }
  },

  /**
   * Get failed payments (Admin only)
   * @param {string} token - JWT authentication token
   * @returns {Promise<Array<PaymentDetails>>} - Array of failed payment objects
   */
  getFailedPayments: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/failed`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("PaymentService Error - getFailedPayments:", error);
      throw error;
    }
  },

  /**
   * Get payments within a date range (Admin only)
   * @param {string} startDate - Start date in ISO format
   * @param {string} endDate - End date in ISO format
   * @param {string} token - JWT authentication token
   * @returns {Promise<Array<PaymentDetails>>} - Array of payment objects
   */
  getPaymentsByDateRange: async (startDate, endDate, token) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/range?start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("PaymentService Error - getPaymentsByDateRange:", error);
      throw error;
    }
  },

  /**
   * Process a payment with Stripe (legacy method)
   * @param {Object} paymentData - Payment data
   * @param {string} paymentData.orderId - Order ID
   * @param {string} paymentData.customerEmail - Customer email
   * @param {number} paymentData.amount - Payment amount in dollars
   * @param {string} paymentData.stripeToken - Stripe payment method ID
   * @param {string} token - JWT authentication token
   * @returns {Promise<PaymentResponse>} - Payment response object
   */
  processPayment: async (paymentData, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: paymentData.orderId,
          customerEmail: paymentData.customerEmail,
          amount: paymentData.amount,
          stripeToken: paymentData.stripeToken
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || 'Payment processing failed');
        } catch {
          throw new Error(errorText || 'Payment processing failed');
        }
      }

      return await response.json();
    } catch (error) {
      console.error("PaymentService Error - processPayment:", error);
      throw error;
    }
  }
};

export default paymentService;