import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";

const CartContext = createContext();

const initialState = {
  restaurantId: null,
  restaurantName: null,
  items: [],
  subtotal: 0,
  taxRate: 0.10, // 10% tax rate
  taxAmount: 0,
  deliveryFee: 3.99,
  discountAmount: 0,
  appliedPromotion: null,
  total: 0
};

const getInitialState = () => {
  try {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : { ...initialState };
  } catch (error) {
    console.error("Error loading cart from localStorage:", error);
    return { ...initialState };
  }
};

// Types of actions
const actionTypes = {
  ADD_TO_CART: "ADD_TO_CART",
  REMOVE_FROM_CART: "REMOVE_FROM_CART",
  UPDATE_QUANTITY: "UPDATE_QUANTITY",
  CLEAR_CART: "CLEAR_CART",
  SET_RESTAURANT: "SET_RESTAURANT",
  UPDATE_TOTALS: "UPDATE_TOTALS",
  APPLY_PROMOTION: "APPLY_PROMOTION",
  REMOVE_PROMOTION: "REMOVE_PROMOTION"
};

// Helper to create a unique key for a cart item including its addons
const getCartItemKey = (itemId, addOns = []) => {
  if (!addOns || !addOns.length) return itemId;

  const addOnKeys = addOns
    .map((addon) => `${addon.id}-${addon.quantity || 1}`)
    .sort()
    .join(",");

  return `${itemId}_${addOnKeys}`;
};

const calculateAddOnTotal = (addOns) => {
  if (!addOns || !addOns.length) return 0;

  return addOns.reduce((total, addon) => {
    // Check for quantity in the add-on object
    const addonPrice = Number(addon.price || 0);
    const quantity = Number(addon.quantity || 1); // Use the quantity from the add-on

    console.log(
      `Add-on: ${
        addon.name
      }, Price: ${addonPrice}, Quantity: ${quantity}, Total: ${
        addonPrice * quantity
      }`
    );

    return total + addonPrice * quantity;
  }, 0);
};

// Helper to calculate item total including add-ons - ensure all values are numeric
const calculateItemTotal = (item, quantity, selectedAddOns) => {
  // Always convert values to numbers to prevent NaN
  const basePrice = item.onPromotion
    ? item.discountedPrice || 0
    : item.price || 0;

    const qty = quantity || item.quantity || 0;
  const addOnTotal = calculateAddOnTotal(selectedAddOns);

  return basePrice * qty + addOnTotal;
};

// Reducer function
function cartReducer(state, action) {
  switch (action.type) {
    case actionTypes.ADD_TO_CART: {
      console.log("payload :", action.payload);
      const { item, quantity, selectedAddOns, restaurantId } = action.payload;

      // Check if we need to clear cart (items from different restaurant)
      if (
        state.restaurantId &&
        state.restaurantId !== restaurantId &&
        state.items.length > 0
      ) {
        return {
          ...state,
          items: [
            ...state.items,
            {
              id: item.id,
              name: item.name,
              price: item.onPromotion
                ? Number(item.discountedPrice)
                : Number(item.price),
              originalPrice: Number(item.price || 0),
              quantity: Number(item.quantity || quantity || 1),
              imageUrl: item.imageUrl,
              // Store the complete selectedAddOns array with quantity information
              addOns: selectedAddOns || [],
              itemTotal: calculateItemTotal(
                item,
                Number(item.quantity || quantity || 1),
                selectedAddOns
              ),
              restaurantId,
            },
          ],
          restaurantId: restaurantId || state.restaurantId,
        };
      }

      // Generate a unique key for this item + addons combination
      const cartItemKey = getCartItemKey(item.id, selectedAddOns);

      // Check if this exact item (with same addons) is already in cart
      const existingItemIndex = state.items.findIndex(
        (cartItem) =>
          getCartItemKey(cartItem.id, cartItem.addOns) === cartItemKey
      );

      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedItems = [...state.items];
        console.log("updatedItems :", updatedItems);
        console.log("existingItemIndex :", quantity);
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
          itemTotal: calculateItemTotal(
            item,
            updatedItems[existingItemIndex].quantity + quantity,
            selectedAddOns
          ),
        };

        return {
          ...state,
          items: updatedItems,
          restaurantId: restaurantId || state.restaurantId,
        };
      }

      // Add new item
      return {
        ...state,
        items: [
          ...state.items,
          {
            id: item.id,
            name: item.name,
            price: item.onPromotion ? item.discountedPrice : item.price,
            originalPrice: item.price || 0,
            quantity: item.quantity || quantity,
            imageUrl: item.imageUrl,
            addOns: item.addOns,
            itemTotal: calculateItemTotal(item, item.quantity, selectedAddOns),
            restaurantId,
          },
        ],
        restaurantId: restaurantId || state.restaurantId,
      };
    }

    case actionTypes.REMOVE_FROM_CART: {
      const { cartItemKey } = action.payload;

      const updatedItems = state.items.filter(
        (item) => getCartItemKey(item.id, item.addOns) !== cartItemKey
      );

      // If no items left, reset restaurantId and applied promotion
      const updatedRestaurantId =
        updatedItems.length > 0 ? state.restaurantId : null;
      const updatedPromotion = updatedItems.length > 0 ? state.appliedPromotion : null;

      return {
        ...state,
        items: updatedItems,
        restaurantId: updatedRestaurantId,
        appliedPromotion: updatedPromotion,
        discountAmount: updatedPromotion ? state.discountAmount : 0
      };
    }

    case actionTypes.UPDATE_QUANTITY: {
      const { cartItemKey, quantity } = action.payload;

      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        return cartReducer(state, {
          type: actionTypes.REMOVE_FROM_CART,
          payload: { cartItemKey },
        });
      }

      const updatedItems = state.items.map((item) => {
        if (getCartItemKey(item.id, item.addOns) === cartItemKey) {
          // Use the same logic for calculating item total as when adding to cart
          const itemPrice = Number(item.price || 0);
          const newQuantity = Number(quantity);
          const addOnTotal = calculateAddOnTotal(item.addOns);

          return {
            ...item,
            quantity: newQuantity,
            itemTotal: itemPrice * newQuantity + addOnTotal,
          };
        }
        return item;
      });

      return {
        ...state,
        items: updatedItems,
      };
    }

    case actionTypes.CLEAR_CART:
      return { ...initialState };

    case actionTypes.SET_RESTAURANT: {
      const { restaurant } = action.payload;

      return {
        ...state,
        restaurantName: restaurant.name,
        restaurantId: restaurant.id,
      };
    }

    case actionTypes.UPDATE_TOTALS: {
      const { subtotal, taxAmount, discountAmount, total } = action.payload;
      return {
        ...state,
        subtotal,
        taxAmount,
        discountAmount,
        total,
      };
    }

    case actionTypes.APPLY_PROMOTION: {
      const { promotion } = action.payload;
      return {
        ...state,
        appliedPromotion: promotion
      };
    }

    case actionTypes.REMOVE_PROMOTION: {
      return {
        ...state,
        appliedPromotion: null,
        discountAmount: 0
      };
    }

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, getInitialState());
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(state));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [state]);

  useEffect(() => {
    try {
      // Ensure we're using numeric values
      const subtotal = state.items.reduce(
        (total, item) => total + Number(item.itemTotal || 0),
        0
      );
      
      // Calculate discount if promotion is applied
      let discountAmount = 0;
      if (state.appliedPromotion) {
        // Calculate discount based on percentage
        const rawDiscount = subtotal * (state.appliedPromotion.discountPercentage / 100);
        
        // Apply max discount limit if available
        if (state.appliedPromotion.maxDiscount && rawDiscount > state.appliedPromotion.maxDiscount) {
          discountAmount = state.appliedPromotion.maxDiscount;
        } else {
          discountAmount = rawDiscount;
        }
      }
      
      // Apply discount to the subtotal
      const discountedSubtotal = subtotal - discountAmount;
      
      // Calculate tax on the discounted subtotal
      const taxAmount = discountedSubtotal * Number(state.taxRate || 0.1);
      
      const deliveryFee =
        state.items.length > 0 ? Number(state.deliveryFee || 0) : 0;
        
      const total = discountedSubtotal + taxAmount + deliveryFee;

      // Debug totals
      console.log("Cart totals:", { subtotal, discountAmount, taxAmount, deliveryFee, total });

      dispatch({
        type: actionTypes.UPDATE_TOTALS,
        payload: { subtotal, discountAmount, taxAmount, total },
      });
    } catch (error) {
      console.error("Error calculating totals:", error);
    }
  }, [state.items, state.taxRate, state.deliveryFee, state.appliedPromotion]);

  const addToCart = (item, quantity, selectedAddOns) => {
    if (!item || quantity <= 0) return;

    // Create a safe item with correct numeric values
    const safeItem = {
      ...item,
      price: item.priceValue || item.price || 0,
      discountedPrice: item.discountedValue || item.discountedPrice || 0,
      quantity: item.quantity || 1,
    };

    // Check if adding from a different restaurant
    if (
      state.restaurantId &&
      state.restaurantId !== safeItem.restaurantId &&
      state.items.length > 0
    ) {
      // Confirm with user before clearing cart
      const confirmed = window.confirm(
        "Your cart contains items from a different restaurant. Adding this item will clear your current cart. Continue?"
      );

      if (!confirmed) return;

      toast.info("Cart cleared - items from previous restaurant removed");
    }

    console.log("Safe item created:", safeItem);

    // Use the safe item in the dispatch
    dispatch({
      type: actionTypes.ADD_TO_CART,
      payload: {
        item: safeItem,
        quantity: item.quantity || quantity,
        selectedAddOns: item.addOns || selectedAddOns,
        restaurantId: safeItem.restaurantId,
      },
    });
  };

  const removeFromCart = (cartItemKey) => {
    dispatch({
      type: actionTypes.REMOVE_FROM_CART,
      payload: { cartItemKey },
    });

    toast.info("Item removed from cart");
  };

  const updateQuantity = (cartItemKey, quantity) => {
    console.log("Updating quantity for:", cartItemKey, "to", quantity);
    dispatch({
      type: actionTypes.UPDATE_QUANTITY,
      payload: { cartItemKey, quantity },
    });
  };

  const clearCart = () => {
    dispatch({ type: actionTypes.CLEAR_CART });
    toast.info("Cart cleared");
  };

  const openCartDrawer = () => setCartDrawerOpen(true);
  const closeCartDrawer = () => setCartDrawerOpen(false);

  const setRestaurant = (restaurant) => {
    dispatch({
      type: actionTypes.SET_RESTAURANT, // Use the constant, not a string
      payload: { restaurant },
    });
  };
  
  const applyPromotion = (promotion) => {
    // Check if the minimum order amount is met
    if (state.subtotal < promotion.minOrderAmount) {
      toast.error(`Minimum order amount of $${promotion.minOrderAmount.toFixed(2)} not met`);
      return false;
    }
    
    dispatch({
      type: actionTypes.APPLY_PROMOTION,
      payload: { promotion }
    });
    
    toast.success(`Promotion ${promotion.code} applied successfully!`);
    return true;
  };
  
  const removePromotion = () => {
    dispatch({
      type: actionTypes.REMOVE_PROMOTION
    });
    
    toast.info("Promotion removed");
  };

  // Values to be provided to consuming components
  const value = {
    cart: state,
    cartCount: state.items.reduce((count, item) => count + item.quantity, 0),
    addToCart,
    removeFromCart,
    updateQuantity,
    setRestaurant,
    clearCart,
    cartDrawerOpen,
    openCartDrawer,
    closeCartDrawer,
    getCartItemKey, // Export helper function for components
    applyPromotion,
    removePromotion
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);