// src/context/PaymentContext.jsx
import { createContext, useContext, useState } from 'react';

const PaymentContext = createContext();

export function PaymentProvider({ children }) {
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const processPayment = async (paymentData) => {
    setLoading(true);
    setError(null);
    try {
      // This will be implemented in the payment service
      const response = await processPayment(paymentData);
      setPaymentDetails(response);
      return response;
    } catch (err) {
      setError(err.message || 'Payment failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaymentContext.Provider value={{ paymentDetails, processPayment, loading, error }}>
      {children}
    </PaymentContext.Provider>
  );
}

export const usePayment = () => useContext(PaymentContext);