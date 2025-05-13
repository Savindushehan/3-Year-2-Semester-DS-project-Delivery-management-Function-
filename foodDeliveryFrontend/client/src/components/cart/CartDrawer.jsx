import React, { useState } from "react";
import { Button, Avatar, TextInput, Spinner } from "flowbite-react";
import { HiOutlineX, HiTrash, HiPlus, HiMinus, HiTag, HiCheckCircle, HiX } from "react-icons/hi";
import { FaMoneyBillWave } from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import { promotionService } from "../../service/promotionService";
import { useSelector } from "react-redux";

export default function CartDrawer() {
  const { currentUser } = useSelector((state) => state.user);
  const {
    cart,
    cartDrawerOpen,
    closeCartDrawer,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItemKey,
    applyPromotion,
    removePromotion
  } = useCart();

  const [promoCode, setPromoCode] = useState("");
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [promoError, setPromoError] = useState("");

  if (!cartDrawerOpen) return null;

  const formatPrice = (value) => {
    const numValue = Number(value);
    return isNaN(numValue) ? '0.00' : numValue.toFixed(2);
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError("Please enter a promotion code");
      return;
    }

    if (!cart.restaurantId) {
      setPromoError("Cannot apply promotion - restaurant information missing");
      return;
    }

    setValidatingPromo(true);
    setPromoError("");

    try {
      const validationData = {
        code: promoCode,
        restaurantId: cart.restaurantId,
        userId:currentUser.id,
        orderAmount: cart.subtotal,
      };

      const response = await promotionService.validatePromotion(validationData, currentUser?.token);
      
      if (response.ok) {
        const promoData = await response.json();
        applyPromotion(promoData);
        setPromoCode("");
      } else {
        const errorData = await response.json();
        setPromoError(errorData.message || "Invalid promotion code");
      }
    } catch (error) {
      console.error("Error validating promotion:", error);
      setPromoError("Error validating promotion");
    } finally {
      setValidatingPromo(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={closeCartDrawer}
      ></div>

      {/* Cart Drawer */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white dark:bg-gray-800 z-50 shadow-xl transform transition-transform duration-300 overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
            <FaMoneyBillWave className="mr-2 text-green-600" />
            Your Cart
          </h2>
          <button
            onClick={closeCartDrawer}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <HiOutlineX className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Empty Cart State */}
        {cart.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center h-64">
            <div className="text-gray-400 dark:text-gray-500 text-5xl mb-4">
              🛒
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your cart is empty
            </p>
            <Button color="primary" onClick={closeCartDrawer}>
              Start Shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Restaurant Name */}
            {cart.restaurantName && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 text-blue-700 dark:text-blue-300 text-sm flex items-center">
                <span className="font-medium mr-1">Orders from:</span>
                {cart.restaurantName}
              </div>
            )}

            {/* Cart Items */}
            <div className="divide-y dark:divide-gray-700 px-4">
              {cart.items.map((item) => {
                const cartItemKey = getCartItemKey(item.id, item.addOns);
                return (
                  <div key={cartItemKey} className="py-4">
                    <div className="flex gap-3">
                      {/* Item Image */}
                      {item.imageUrl ? (
                        <Avatar
                          img={item.imageUrl}
                          size="md"
                          rounded
                          className="flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-gray-500 dark:text-gray-400 text-xs">
                            IMG
                          </span>
                        </div>
                      )}

                      {/* Item Details */}
                      <div className="flex-grow">
                        <div className="flex justify-between">
                          <p className="font-medium text-gray-800 dark:text-white">
                            {item.name}
                          </p>
                          <p className="font-medium text-gray-800 dark:text-white">
                            ${formatPrice(item.itemTotal)}
                          </p>
                        </div>

                        {/* Price per item */}
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ${formatPrice(item.price)} each
                        </p>

                        {/* Add-ons */}
                        {item.addOns && item.addOns.length > 0 && (
                          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {item.addOns.map((addon, idx) => (
                              <span key={idx}>
                                +{addon.quantity}x {addon.name} ($
                                {addon.price.toFixed(2)})
                                {idx < item.addOns.length - 1 && ", "}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Quantity Controls */}
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center border rounded-lg overflow-hidden dark:border-gray-600">
                            <button
                              onClick={() =>
                                updateQuantity(cartItemKey, item.quantity - 1)
                              }
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                              disabled={item.quantity <= 1}
                            >
                              <HiMinus className="h-3.5 w-3.5" />
                            </button>
                            <span className="px-3 py-1">{isNaN(item.quantity) ? 1 : item.quantity}</span>
                            <button
                              onClick={() =>
                                updateQuantity(cartItemKey, item.quantity + 1)
                              }
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                              <HiPlus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(cartItemKey)}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <HiTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Promo Code Section */}
            <div className="px-4 py-3 border-t border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <HiTag className="mr-1 text-blue-500" />
                Apply Promotion Code
              </p>
              
              {cart.appliedPromotion ? (
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center">
                        <HiCheckCircle className="text-green-500 mr-1.5" />
                        <span className="font-medium text-green-700 dark:text-green-400">
                          {cart.appliedPromotion.code}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        {cart.appliedPromotion.discountPercentage}% discount applied
                      </p>
                    </div>
                    <button
                      onClick={removePromotion}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <HiX className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex">
                  <TextInput
                    id="promoCode"
                    type="text"
                    placeholder="Enter code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-grow"
                    color={promoError ? "failure" : "gray"}
                  />
                  <Button
                    color="blue"
                    className="ml-2 whitespace-nowrap"
                    onClick={handleApplyPromo}
                    disabled={validatingPromo}
                  >
                    {validatingPromo ? <Spinner size="sm" /> : "Apply"}
                  </Button>
                </div>
              )}
              
              {promoError && (
                <p className="text-red-500 text-xs mt-1">{promoError}</p>
              )}
            </div>

            {/* Cart Summary */}
            <div className="px-4 pt-4 pb-6 bg-gray-50 dark:bg-gray-900 mt-auto sticky bottom-0 border-t dark:border-gray-700">
              <div className="space-y-1.5 mb-4">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>
                    ${formatPrice(cart.subtotal)}
                  </span>
                </div>
                
                {/* Display discount if a promotion is applied */}
                {cart.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount</span>
                    <span>-${formatPrice(cart.discountAmount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax</span>
                  <span>
                    ${formatPrice(cart.taxAmount)}
                  </span>
                </div>
                
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Delivery Fee</span>
                  <span>
                    ${formatPrice(cart.deliveryFee || 0)}
                  </span>
                </div>
                
                <div className="flex justify-between font-bold text-gray-900 dark:text-white pt-2 border-t dark:border-gray-700">
                  <span>Total</span>
                  <span>
                    ${formatPrice(cart.total)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  gradientDuoTone="greenToBlue"
                  size="lg"
                  fullSized
                  onClick={() => {
                    closeCartDrawer();
                    window.location.href = "/checkout";
                  }}
                >
                  Proceed to Checkout
                </Button>

                <Button color="light" size="sm" fullSized onClick={clearCart}>
                  <HiTrash className="mr-1" />
                  Clear Cart
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}