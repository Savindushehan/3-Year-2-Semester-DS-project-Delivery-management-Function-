const API_URL = "http://localhost:8082/api/payments/reports";

const paymentReportService = {
  getAvailableReportTypes: async (token) => {
    try {
      const response = await fetch(`${API_URL}/types`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch report types');
      return await response.json();
    } catch (error) {
      console.error("Error fetching report types:", error);
      throw error;
    }
  },

  generatePaymentReportByOrder: async (orderId, token) => {
    try {
      const response = await fetch(`${API_URL}/order/${orderId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to generate order report');
      }
      return await response.blob();
    } catch (error) {
      console.error("Error generating order report:", error);
      throw error;
    }
  },

  generatePaymentReportByUser: async (email, token) => {
    try {
      const response = await fetch(`${API_URL}/user/${email}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to generate user report');
      }
      return await response.blob();
    } catch (error) {
      console.error("Error generating user report:", error);
      throw error;
    }
  },

  generatePaymentReportByDateRange: async (startDate, endDate, token) => {
    try {
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      const response = await fetch(`${API_URL}/date-range?${params}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to generate date range report');
      }
      return await response.blob();
    } catch (error) {
      console.error("Error generating date range report:", error);
      throw error;
    }
  },

  generatePaymentReportByStatus: async (status, token) => {
    try {
      // Map frontend status to backend status
      const backendStatus = status === 'success' ? 'succeeded' :
                          status === 'failed' ? 'failed' :
                          status.toLowerCase();

      const response = await fetch(`${API_URL}/status/${backendStatus}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to generate status report');
      }
      return await response.blob();
    } catch (error) {
      console.error("Error generating status report:", error);
      throw error;
    }
  },

  downloadPdfReport: (reportBlob, filename) => {
    const url = window.URL.createObjectURL(reportBlob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};

export default paymentReportService;