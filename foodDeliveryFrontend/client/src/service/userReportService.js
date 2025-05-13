// src/service/reportService.js

const API_URL = "http://localhost:8089/api";

export const reportService = {
  // Get available report types
  getAvailableReportTypes: async (token) => {
    const res = await fetch(`${API_URL}/reports/types`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res;
  },

  // Generate user report - returns PDF blob
  generateUserReport: async (userId, token) => {
    const res = await fetch(`${API_URL}/reports/users/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: 'blob',
    });
    
    if (res.ok) {
      return res.blob(); // Return as blob for PDF handling
    }
    return res;
  },

  // Generate role-based report - returns PDF blob
  generateRoleBasedReport: async (roleName, token) => {
    const res = await fetch(`${API_URL}/reports/roles/${roleName}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: 'blob',
    });
    
    if (res.ok) {
      return res.blob(); // Return as blob for PDF handling
    }
    return res;
  },

  // Helper function to download a PDF report with proper filename
  downloadPdfReport: async (reportBlob, filename) => {
    // Create a URL for the blob
    const url = window.URL.createObjectURL(reportBlob);
    
    // Create temporary link element
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    
    // Append to body, click and remove
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Helper function to open PDF in new tab
  openPdfInNewTab: async (reportBlob) => {
    const url = window.URL.createObjectURL(reportBlob);
    window.open(url, '_blank');
    
    // Clean up URL object after delay to ensure it opens
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);
  }
};