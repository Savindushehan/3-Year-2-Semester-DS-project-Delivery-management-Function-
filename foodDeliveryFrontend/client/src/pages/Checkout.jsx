import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useSelector } from "react-redux";
import {
  Button,
  Card,
  TextInput,
  Label,
  Radio,
  Textarea,
  Alert,
  Spinner,
} from "flowbite-react";
import {
  HiLocationMarker,
  HiCreditCard,
  HiCash,
  HiShoppingBag,
  HiUser,
  HiPhone,
  HiMail,
  HiDocumentText,
  HiChevronLeft,
  HiCheck,
  HiClock,
} from "react-icons/hi";
import { FaCcVisa, FaCcMastercard, FaCcPaypal } from "react-icons/fa";
import { orderService } from "../service/orderService";

export default function Checkout() {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const { cart, clearCart } = useCart();

  const [orderProcessing, setOrderProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");

  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
    deliveryInstructions: "",
  });

  const [formErrors, setFormErrors] = useState({});

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.items.length === 0 && !orderSuccess) {
      navigate("/");
    }
  }, [cart.items, navigate, orderSuccess]);

  const validateForm = () => {
    const errors = {};

    if (!formData.fullName) errors.fullName = "Full name is required";
    if (!formData.email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Email is invalid";

    if (!formData.phone) errors.phone = "Phone number is required";

    if (!formData.address.street) errors.street = "Street address is required";
    if (!formData.address.city) errors.city = "City is required";
    if (!formData.address.state) errors.state = "State is required";
    if (!formData.address.zipCode) errors.zipCode = "ZIP code is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      window.scrollTo(0, 0);
      return;
    }

    setOrderProcessing(true);
    setOrderError("");

    // Create order object
    const order = {
      userId: currentUser?.id,
      restaurantId: cart.restaurantId,
      items: cart.items.map((item) => ({
        itemId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        addOns: item.addOns || [],
        itemTotal: item.itemTotal,
      })),
      subtotal: cart.subtotal,
      taxAmount: cart.taxAmount,
      deliveryFee: cart.deliveryFee || 0,
      discount: cart.discountAmount,
      total: cart.total,
      promotion: cart.appliedPromotion
        ? {
            code: cart.appliedPromotion.code,
            discountAmount: cart.discountAmount,
          }
        : null,
      deliveryAddress: formData.address,
      deliveryInstructions: formData.deliveryInstructions,
      contactInfo: {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      },
      paymentMethod,
      status: "pending",
    };

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await orderService.createOrder(
        order,
        currentUser?.token
      );
      if (!response.ok) {
        clearCart();
        setOrderError("Failed to place order. Please try again.");
        throw new Error("Failed to place order");
      }
      const data = await response.json();
      console.log("Order created successfully:", data);
      // For now, let's simulate success
      console.log("Order submitted:", order);

      setOrderSuccess(true);

      // Clear the cart after successful order
      clearCart();
    } catch (error) {
      console.error("Error placing order:", error);
      setOrderError("Failed to place order. Please try again.");
    } finally {
      setOrderProcessing(false);
    }
  };

  const formatPrice = (value) => {
    const numValue = Number(value);
    return isNaN(numValue) ? "0.00" : numValue.toFixed(2);
  };

  // Show order confirmation when successful
  if (orderSuccess) {
    return (
      <div className="container mx-auto my-8 px-4">
        <Card className="max-w-2xl mx-auto">
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiCheck className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Thank you for your order. Your food is being prepared!
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <Button
                color="light"
                onClick={() => navigate("/")}
                className="flex items-center justify-center"
              >
                <HiChevronLeft className="mr-1" /> Continue Shopping
              </Button>

              <Button
                color="blue"
                onClick={() => navigate("/orders")}
                className="flex items-center justify-center"
              >
                <HiClock className="mr-1" /> View Orders
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto my-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Checkout
      </h1>

      {orderError && (
        <Alert color="failure" className="mb-6">
          {orderError}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <Card className="mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <HiUser className="mr-2 text-blue-600" /> Contact Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="fullName" value="Full Name" />
                  <TextInput
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    color={formErrors.fullName ? "failure" : undefined}
                    helperText={formErrors.fullName}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email" value="Email" />
                  <TextInput
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    color={formErrors.email ? "failure" : undefined}
                    helperText={formErrors.email}
                    icon={HiMail}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone" value="Phone Number" />
                  <TextInput
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(555) 123-4567"
                    color={formErrors.phone ? "failure" : undefined}
                    helperText={formErrors.phone}
                    icon={HiPhone}
                    required
                  />
                </div>
              </div>
            </Card>

            <Card className="mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <HiLocationMarker className="mr-2 text-blue-600" /> Delivery
                Address
              </h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="street" value="Street Address" />
                  <TextInput
                    id="street"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    placeholder="123 Main St"
                    color={formErrors.street ? "failure" : undefined}
                    helperText={formErrors.street}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city" value="City" />
                    <TextInput
                      id="city"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      placeholder="New York"
                      color={formErrors.city ? "failure" : undefined}
                      helperText={formErrors.city}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="state" value="State" />
                    <TextInput
                      id="state"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
                      placeholder="NY"
                      color={formErrors.state ? "failure" : undefined}
                      helperText={formErrors.state}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="zipCode" value="ZIP Code" />
                    <TextInput
                      id="zipCode"
                      name="address.zipCode"
                      value={formData.address.zipCode}
                      onChange={handleChange}
                      placeholder="10001"
                      color={formErrors.zipCode ? "failure" : undefined}
                      helperText={formErrors.zipCode}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="deliveryInstructions"
                    value="Delivery Instructions (Optional)"
                  />
                  <Textarea
                    id="deliveryInstructions"
                    name="deliveryInstructions"
                    value={formData.deliveryInstructions}
                    onChange={handleChange}
                    placeholder="Apartment number, gate code, or special instructions"
                    rows={3}
                  />
                </div>
              </div>
            </Card>

            <Card className="mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <HiCreditCard className="mr-2 text-blue-600" /> Payment Method
              </h2>

              <div className="space-y-4">
                <div className="flex items-center pl-4 border border-gray-200 rounded dark:border-gray-700">
                  <Radio
                    id="card-payment"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                    className="w-4 h-4"
                  />
                  <Label
                    htmlFor="card-payment"
                    className="w-full py-4 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                  >
                    <div className="flex items-center">
                      Credit/Debit Card
                      <div className="ml-auto flex space-x-2">
                        <FaCcVisa className="text-blue-700 text-2xl" />
                        <FaCcMastercard className="text-red-600 text-2xl" />
                      </div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center pl-4 border border-gray-200 rounded dark:border-gray-700">
                  <Radio
                    id="paypal-payment"
                    name="paymentMethod"
                    value="paypal"
                    checked={paymentMethod === "paypal"}
                    onChange={() => setPaymentMethod("paypal")}
                  />
                  <Label
                    htmlFor="paypal-payment"
                    className="w-full py-4 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                  >
                    <div className="flex items-center">
                      PayPal
                      <div className="ml-auto">
                        <FaCcPaypal className="text-blue-800 text-2xl" />
                      </div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center pl-4 border border-gray-200 rounded dark:border-gray-700">
                  <Radio
                    id="cash-payment"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={() => setPaymentMethod("cash")}
                  />
                  <Label
                    htmlFor="cash-payment"
                    className="w-full py-4 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                  >
                    <div className="flex items-center">
                      Cash on Delivery
                      <div className="ml-auto">
                        <HiCash className="text-green-600 text-2xl" />
                      </div>
                    </div>
                  </Label>
                </div>

                {paymentMethod === "card" && (
                  <div className="p-4 border border-gray-200 rounded dark:border-gray-700">
                    {/* In a real application, you would add credit card form fields here */}
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Card details will be collected on the next screen.
                    </p>
                  </div>
                )}
              </div>
            </Card>

            <div className="flex justify-between mt-6">
              <Button color="light" onClick={() => navigate(-1)}>
                <HiChevronLeft className="mr-2" /> Back
              </Button>

              <Button
                type="submit"
                color="success"
                disabled={orderProcessing}
                className="px-8"
              >
                {orderProcessing ? (
                  <>
                    <Spinner size="sm" className="mr-3" />
                    Processing...
                  </>
                ) : (
                  <>
                    Place Order
                    <HiCheck className="ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <HiShoppingBag className="mr-2 text-blue-600" /> Order Summary
            </h2>

            <div className="divide-y dark:divide-gray-700">
              {cart.items.map((item, index) => (
                <div key={index} className="py-3 flex justify-between">
                  <div>
                    <div className="font-medium text-gray-800 dark:text-white flex items-center">
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs font-semibold px-2 py-0.5 rounded mr-2">
                        {item.quantity}x
                      </span>
                      {item.name}
                    </div>

                    {item.addOns && item.addOns.length > 0 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {item.addOns.map((addon, idx) => (
                          <span key={idx}>
                            +{addon.quantity}x {addon.name}
                            {idx < item.addOns.length - 1 && ", "}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-gray-700 dark:text-gray-300">
                    ${formatPrice(item.itemTotal)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t dark:border-gray-700 pt-4 mt-4 space-y-2">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>${formatPrice(cart.subtotal)}</span>
              </div>

              {cart.discountAmount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span className="flex items-center">
                    <HiDocumentText className="mr-1" />
                    Discount{" "}
                    {cart.appliedPromotion
                      ? `(${cart.appliedPromotion.code})`
                      : ""}
                  </span>
                  <span>-${formatPrice(cart.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Tax</span>
                <span>${formatPrice(cart.taxAmount)}</span>
              </div>

              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Delivery Fee</span>
                <span>${formatPrice(cart.deliveryFee || 0)}</span>
              </div>

              <div className="flex justify-between pt-3 border-t dark:border-gray-700 font-bold text-lg text-gray-900 dark:text-white">
                <span>Total</span>
                <span>${formatPrice(cart.total)}</span>
              </div>
            </div>

            {cart.appliedPromotion && (
              <div className="mt-4 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center text-green-700 dark:text-green-400">
                  <HiCheck className="mr-1.5 text-green-500" />
                  <span className="font-medium">
                    Promo code{" "}
                    <span className="font-bold">
                      {cart.appliedPromotion.code}
                    </span>{" "}
                    applied
                  </span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {cart.appliedPromotion.description}
                </div>
              </div>
            )}

            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              <p>
                By placing your order, you agree to our Terms of Service and
                Privacy Policy.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
