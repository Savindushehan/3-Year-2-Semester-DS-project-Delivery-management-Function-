import React, { useState, useEffect } from 'react';
import { Button, Alert, Spinner, Card } from 'flowbite-react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { FaCreditCard, FaLock } from 'react-icons/fa';
import { useSelector } from "react-redux";

export default function CheckoutForm({ onSuccess, clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [ready, setReady] = useState(false);

  const { currentUser } = useSelector((state) => state.user || {});
  const userEmail = currentUser?.email || '';
  
  // Verify stripe and elements are loaded
  useEffect(() => {
    if (stripe && elements) {
      setReady(true);
      console.log("Stripe components ready");
    }
  }, [stripe, elements]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setError("Payment system not initialized. Please refresh the page.");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error("Card element not found");
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              email: userEmail,
            },
          }
        }
      );

      if (stripeError) {
        console.error("Stripe error:", stripeError);
        setError(stripeError.message);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent);
      } else {
        setError(`Payment status: ${paymentIntent.status}. Please try again.`);
      }
    } catch (err) {
      console.error("Payment processing error:", err);
      setError(err.message || 'Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  // Show a message if components aren't ready yet
  if (!ready) {
    return (
      <div className="text-center py-6">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">Initializing payment form...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border border-gray-200 dark:border-gray-700 shadow-md">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg flex items-center">
              <FaCreditCard className="mr-2 text-orange-500" />
              Payment Information
            </h3>
            <div className="flex items-center text-sm text-gray-500">
              <FaLock className="mr-1" />
              Secure Payment
            </div>
          </div>

          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 bg-white dark:bg-gray-800">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                    iconColor: '#f97316',
                    lineHeight: '1.5',
                    fontWeight: '400',
                  },
                  invalid: {
                    color: '#9e2146',
                    iconColor: '#ef4444',
                  },
                },
                hidePostalCode: true
              }}
              className="py-4"
            />
          </div>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 flex items-start">
          <FaLock className="mr-2 mt-0.5 text-green-600" />
          <span>
            Your payment information is encrypted and secure. We do not store your card details.
          </span>
        </div>
      </Card>

      {error && (
        <Alert color="failure" className="font-medium">
          {error}
        </Alert>
      )}

      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full transition-all duration-300 ease-in-out"
        gradientDuoTone="redToYellow"
        size="lg"
      >
        {processing ? (
          <div className="flex items-center justify-center">
            <Spinner size="sm" className="mr-2" />
            Processing Payment...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <FaCreditCard className="mr-2" />
            Complete Payment
          </div>
        )}
      </Button>
    </form>
  );
}