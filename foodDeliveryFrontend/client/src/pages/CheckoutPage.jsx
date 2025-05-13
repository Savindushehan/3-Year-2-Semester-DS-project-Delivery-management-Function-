import React, { useState, useEffect } from 'react';
import { Button, Card, Alert, Spinner, Badge } from 'flowbite-react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import paymentService from '../service/paymentService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FaCheck, FaShoppingCart, FaReceipt, FaArrowLeft, FaEnvelope } from 'react-icons/fa';
import { MdRestaurant, MdDeliveryDining } from 'react-icons/md';
import { useSelector } from "react-redux";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderTotal, setOrderTotal] = useState(0);
  const [paymentMessage, setPaymentMessage] = useState('');

  // Calculate subtotal, tax, and delivery fee correctly
  const subtotal = cart.subtotal || 0;
  const taxAmount = cart.taxAmount || 0;
  const deliveryFee = cart.deliveryFee || 0;
  const discountAmount = cart.discountAmount || 0;

  // For successful order screen
  const [orderSubtotal, setOrderSubtotal] = useState(0);
  const [orderTaxAmount, setOrderTaxAmount] = useState(0);
  const [orderDeliveryFee, setOrderDeliveryFee] = useState(0);
  const [orderDiscountAmount, setOrderDiscountAmount] = useState(0);

  const { currentUser } = useSelector((state) => state.user);
  console.log("incheckoutpage", currentUser?.email);

  useEffect(() => {
    console.log('Cart Total:', cart.total);
    if (!cart.items.length && !paymentSuccess) {
      window.location.href = '/';
      return;
    }

    // Add validation for zero amount
    if (cart.total <= 0) {
      setError('Invalid payment amount');
      setLoading(false);
      return;
    }

    const createPaymentIntent = async () => {
      try {
        setLoading(true);
        console.log('Submitting amount:', cart.total); // Debug
        const response = await paymentService.createPaymentIntent(
          {
            amount: cart.total,
            orderId: `order_${Date.now()}`,
            customerEmail: currentUser?.email || 'test@example.com'
          },
          user?.token || 'mock_jwt_token'
        );

        setClientSecret(response.clientSecret);
        setPaymentIntentId(response.paymentIntentId);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to initialize payment');
      } finally {
        setLoading(false);
      }
    };

    // Add debounce to prevent multiple calls
    const debounceTimer = setTimeout(createPaymentIntent, 300);
    return () => clearTimeout(debounceTimer);
  }, [cart, user, paymentSuccess]);

  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      const paymentRecord = await paymentService.confirmPayment(
        { paymentIntentId: paymentIntent.id },
        user?.token || 'mock_jwt_token'
      );

      if (paymentRecord.paymentStatus === 'succeeded') {
        // Show payment successful message first
        setPaymentMessage('Payment processed successfully! Preparing your order...');

        // Store all the important values before clearing the cart
        setOrderTotal(cart.total);
        setOrderSubtotal(subtotal);
        setOrderTaxAmount(taxAmount);
        setOrderDeliveryFee(deliveryFee);
        setOrderDiscountAmount(discountAmount);

        // Set order details
        setOrderDetails({
          orderId: paymentRecord.orderId,
          email: currentUser?.email || paymentIntent.receipt_email,
          amount: cart.total,
          subtotal: subtotal,
          taxAmount: taxAmount,
          deliveryFee: deliveryFee,
          discountAmount: discountAmount
        });

        // Display the success message for 2 seconds before transitioning
        setTimeout(() => {
          // Mark payment as successful
          setPaymentSuccess(true);

          // Clear cart after showing success message
          clearCart();
        }, 2000);
      } else {
        setError('Payment verification failed: ' +
          (paymentRecord.errorMessage || 'Unknown error'));
      }
    } catch (err) {
      console.error('Confirmation error:', err);
      setError('Payment confirmation failed: ' + err.message);
    }
  };

  if (paymentMessage && !paymentSuccess) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full mx-4">
          <div className="flex flex-col items-center text-center">
            <div className="bg-green-100 rounded-full p-4 mb-4">
              <FaCheck className="w-10 h-10 text-green-500" />
            </div>

            <h2 className="text-2xl font-bold mb-3 text-green-700 dark:text-green-400">
              Payment Successful!
            </h2>

            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {paymentMessage}
            </p>

            <div className="flex items-center justify-center space-x-2 mt-2">
              <Spinner size="md" color="success" />
              <span className="text-gray-600 dark:text-gray-400 text-sm">
                Processing your order...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="container max-w-2xl mx-auto p-4 my-12">
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white rounded-full p-4 shadow-md">
                <FaCheck className="w-12 h-12 text-green-500" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-white opacity-90">
              Your delicious food is on its way
            </p>
          </div>

          <div className="p-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-6 shadow-inner">
              <h2 className="font-semibold text-lg mb-4 flex items-center">
                <FaReceipt className="mr-2 text-orange-500" />
                Order Details
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="font-medium flex items-center">
                    <Badge color="purple" className="mr-2">Order ID</Badge>
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 font-mono">
                    {orderDetails?.orderId || 'N/A'}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="font-medium flex items-center">
                    <Badge color="info" className="mr-2">Email</Badge>
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {orderDetails?.email || 'N/A'}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="font-medium">Subtotal:</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    ${(orderDetails?.subtotal || orderSubtotal).toFixed(2)}
                  </span>
                </div>

                {/* Display discount if applied */}
                {(orderDetails?.discountAmount || orderDiscountAmount) > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="font-medium">Discount:</span>
                    <span className="text-green-600 dark:text-green-400">
                      -${(orderDetails?.discountAmount || orderDiscountAmount).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="font-medium">Tax:</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    ${(orderDetails?.taxAmount || orderTaxAmount).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="font-medium">Delivery Fee:</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    ${(orderDetails?.deliveryFee || orderDeliveryFee).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between py-2">
                  <span className="font-medium flex items-center">
                    <Badge color="success" className="mr-2">Total Amount</Badge>
                  </span>
                  <span className="text-gray-900 dark:text-white font-bold">
                    ${(orderDetails?.amount || orderTotal).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-6">
              <FaEnvelope className="text-gray-500 mr-2" />
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                A confirmation email has been sent with your order details
              </p>
            </div>

            <div className="flex justify-between">
              <Button
                onClick={() => window.location.href = '/'}
                color="light"
                className="flex items-center"
              >
                <FaArrowLeft className="mr-2" />
                Back to Home
              </Button>

              <Button
                onClick={() => window.location.href = '/restaurants'}
                gradientDuoTone="redToYellow"
                className="flex items-center"
              >
                <MdRestaurant className="mr-2" />
                Browse More Restaurants
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] p-4 my-8">
        <div className="text-center mb-4">
          <MdDeliveryDining className="text-5xl text-orange-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-xl font-semibold mb-2">Preparing Your Order</h2>
          <p className="text-gray-600 dark:text-gray-400">Loading payment details...</p>
        </div>
        <Spinner size="xl" color="warning" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-md mx-auto mt-16 mb-16 p-4">
        <Alert color="failure" className="shadow-md">
          <div className="font-medium mb-2">Payment Error</div>
          <p>{error}</p>
          <div className="mt-4">
            <Button color="gray" size="sm" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto p-4 my-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center mb-1">
          <FaShoppingCart className="mr-2 text-orange-500" />
          Checkout
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Complete your order and enjoy your meal</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 -mx-4 -mt-4 mb-4">
            <h2 className="font-bold text-lg">Order Summary</h2>
          </div>

          {cart.items.length > 0 && (
            <div className="space-y-3 mb-4">
              {cart.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <div className="flex items-center">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                      <Badge color="gray" className="rounded-full">{item.quantity}</Badge>
                    </div>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.description?.substring(0, 25) || 'Delicious item'}</p>
                    </div>
                  </div>
                  <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-gray-50 dark:bg-gray-800 p-4 -mx-4 rounded-b-lg mt-4">
            <div className="flex justify-between text-gray-700 dark:text-gray-300 mb-1">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            {/* Display discount if applied */}
            {discountAmount > 0 && (
              <div className="flex justify-between text-gray-700 dark:text-gray-300 mb-1">
                <span>Discount:</span>
                <span className="text-green-600 dark:text-green-400">-${discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-gray-700 dark:text-gray-300 mb-1">
              <span>Tax ({(cart.taxRate * 100).toFixed(0)}%):</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-gray-700 dark:text-gray-300 mb-2">
              <span>Delivery Fee:</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>

            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 dark:border-gray-700">
              <span>Order Total:</span>
              <span className="text-orange-600 dark:text-orange-400">${cart.total.toFixed(2)}</span>
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 flex items-center">
              <MdDeliveryDining className="mr-1" />
              Estimated delivery time: 30-45 minutes
            </p>
          </div>
        </Card>

        {clientSecret && (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm
              onSuccess={handlePaymentSuccess}
              clientSecret={clientSecret}
            />
          </Elements>
        )}
      </div>

      <div className="h-8"></div>
    </div>
  );
}