import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Button,
  Card,
  Badge,
  Spinner,
  Tabs,
  Modal,
  TextInput,
  Tooltip,
  Alert,
} from "flowbite-react";
import {
  FaArrowLeft,
  FaStar,
  FaClock,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaUtensils,
  FaDollarSign,
  FaShoppingCart,
  FaSearch,
  FaTag,
  FaPercent,
  FaAward,
} from "react-icons/fa";
import { HiPlus, HiMinus, HiOutlineX, HiCheck } from "react-icons/hi";
import { publicRestaurantService } from "../service/public/publicService";
import { useSelector } from "react-redux";
import { useCart } from "../context/CartContext"; // Fix the import path
import { toast } from "react-toastify";
import { promotionService } from "../service/promotionService";

export default function RestaurantDetail() {
  const { id } = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const { addToCart, setRestaurant } = useCart();

  const [restaurant, setRestaurantData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch restaurant and menu categories on component mount
  const [availablePromoCodes, setAvailablePromoCodes] = useState([]);
  const [loadingPromoCodes, setLoadingPromoCodes] = useState(false);
  const [promoError, setPromoError] = useState(null);

  // Fetch restaurant and menu categories on component mount
  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setLoading(true);

        // Fetch restaurant details
        const restaurantResponse =
          await publicRestaurantService.getRestaurantById(
            id,
            currentUser?.token
          );

        if (!restaurantResponse.ok) {
          throw new Error("Failed to fetch restaurant details");
        }

        const restaurantData = await restaurantResponse.json();
        setRestaurantData(restaurantData);

        // Set restaurant in cart context
        setRestaurant(restaurantData);

        // Fetch menu categories
        const categoriesResponse =
          await publicRestaurantService.getCategoriesByRestaurantId(
            id,
            currentUser?.token
          );

        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          // Sort categories by display order
          setCategories(
            categoriesData.sort(
              (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
            )
          );
        } else {
          throw new Error("Failed to fetch menu categories");
        }

        // Fetch active promotions for the restaurant
        try {
          setLoadingPromoCodes(true);
          const promosResponse =
            await promotionService.getActivePromotionsByRestaurantId(
              id,
              currentUser?.token
            );

          if (promosResponse.ok) {
            const promosData = await promosResponse.json();

            // Format the promotions for display
            const formattedPromos = promosData.map((promo) => ({
              code: promo.code,
              description: promo.description,
              discount: promo.discountPercentage,
              maxDiscount: promo.maxDiscount,
              minOrderAmount: promo.minOrderAmount,
            }));

            setAvailablePromoCodes(formattedPromos);
          } else {
            console.error("Failed to fetch promotions");
            setPromoError("Could not load promotions");
          }
        } catch (promoErr) {
          console.error("Error fetching promotions:", promoErr);
          setPromoError(promoErr.message);
        } finally {
          setLoadingPromoCodes(false);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, [id, currentUser]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Spinner size="xl" className="text-blue-600 dark:text-blue-400" />
        <span className="ml-2 text-gray-700 dark:text-gray-300">
          Loading restaurant details...
        </span>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900">
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
          <p>Error: {error || "Restaurant not found"}</p>
        </div>
        <Link to="/">
          <Button color="gray" className="dark:bg-gray-700 dark:text-white">
            <FaArrowLeft className="mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Restaurant Banner */}
      <div
        className="h-64 md:h-80 bg-cover bg-center flex items-end relative"
        style={{
          backgroundImage: `url(${
            restaurant.coverImageUrl ||
            restaurant.bannerImageUrl ||
            "https://via.placeholder.com/1200x400?text=Restaurant+Cover"
          })`,
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="container mx-auto px-4 pb-4 relative">
          <Link to="/">
            <Button
              color="light"
              className="z-10 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              <FaArrowLeft className="mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Restaurant Info - Takes 2/3 of the width on large screens */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 p-6 mb-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                <div className="md:mr-8 flex-grow">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {restaurant.name}
                  </h1>

                  {/* Cuisine Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {restaurant.cuisineTypes &&
                      restaurant.cuisineTypes.map((cuisine) => (
                        <Badge
                          key={cuisine.id}
                          color="info"
                          className="px-2 py-1"
                        >
                          {cuisine.name}
                        </Badge>
                      ))}
                  </div>

                  <p className="text-gray-600 dark:text-gray-300">
                    {restaurant.description}
                  </p>
                </div>

                <div className="mt-4 md:mt-0 text-left md:text-right flex-shrink-0">
                  <div className="inline-flex items-center bg-yellow-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                    <FaStar className="text-yellow-500 dark:text-yellow-300 mr-1 text-xl" />
                    <span className="font-medium text-lg text-gray-900 dark:text-white">
                      {restaurant.rating ? restaurant.rating.toFixed(1) : "New"}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-start md:justify-end">
                    <FaClock className="text-gray-500 dark:text-gray-400 mr-1" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {restaurant.deliveryTime || "30-45"} min delivery
                    </span>
                  </div>
                </div>
              </div>

              <hr className="my-5 border-gray-200 dark:border-gray-700" />

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <div className="bg-red-50 dark:bg-gray-700 p-2 rounded-full mr-3">
                    <FaMapMarkerAlt className="text-red-500 dark:text-red-400" />
                  </div>
                  <span>{restaurant.address || "Address not provided"}</span>
                </div>

                {restaurant.phoneNumber && (
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <div className="bg-blue-50 dark:bg-gray-700 p-2 rounded-full mr-3">
                      <FaPhoneAlt className="text-blue-500 dark:text-blue-400" />
                    </div>
                    <span>{restaurant.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6 relative">
              <div className="flex items-center">
                <TextInput
                  type="text"
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={FaSearch}
                  className="w-full"
                />
              </div>
            </div>

            {/* Menu Categories */}
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <FaUtensils className="mr-2" />
              Menu
            </h2>

            {categories.length === 0 ? (
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  No menu categories available
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700">
                <Tabs style="underline" className="dark:border-gray-700">
                  {categories
                    .filter((cat) => cat.active)
                    .map((category) => (
                      <Tabs.Item
                        key={category.id}
                        title={category.name}
                        active={categories.indexOf(category) === 0}
                        className="dark:text-white"
                      >
                        <div className="p-4">
                          {category.description && (
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                              {category.description}
                            </p>
                          )}

                          <MenuItemsByCategorySection
                            categoryId={category.id}
                            token={currentUser?.token}
                            searchTerm={searchTerm}
                            restaurantId={restaurant.id}
                          />
                        </div>
                      </Tabs.Item>
                    ))}
                </Tabs>
              </div>
            )}
          </div>

          {/* Sidebar - Takes 1/3 of the width on large screens */}
          <div className="lg:col-span-1">
            {/* Promo Codes Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 p-6 mb-6 sticky top-4">
              <div className="flex items-center mb-4">
                <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-full">
                  <FaTag className="text-orange-500 dark:text-orange-300" />
                </div>
                <h2 className="text-xl font-semibold ml-3 text-gray-800 dark:text-white">
                  Available Promo Codes
                </h2>
              </div>

              {loadingPromoCodes ? (
                <div className="flex justify-center py-4">
                  <Spinner size="sm" className="text-orange-500" />
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    Loading offers...
                  </span>
                </div>
              ) : promoError ? (
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded text-sm text-red-700 dark:text-red-300">
                  <p>Could not load promotions</p>
                </div>
              ) : availablePromoCodes.length > 0 ? (
                <div className="space-y-3">
                  {availablePromoCodes.map((promo, index) => (
                    <div
                      key={index}
                      className="border border-dashed border-orange-300 dark:border-orange-700 rounded-lg p-3 bg-orange-50 dark:bg-gray-700"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-orange-600 dark:text-orange-400">
                          {promo.code}
                        </span>
                        <Badge color="warning" className="ml-2">
                          {promo.discount}% OFF
                        </Badge>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {promo.description}
                      </p>
                      {promo.minOrderAmount > 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Min. order: ${promo.minOrderAmount.toFixed(2)}
                        </div>
                      )}
                      {promo.maxDiscount > 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Max discount: ${promo.maxDiscount.toFixed(2)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No promotional offers available at this time
                </p>
              )}

              <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-sm text-blue-700 dark:text-blue-300">
                <FaAward className="inline-block mr-2" />
                Use these codes at checkout to get discounts!
              </div>
            </div>

            {/* Restaurant Hours or Additional Info can be added here */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
                Opening Hours
              </h3>
              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span>9:00 AM - 10:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span>10:00 AM - 11:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span>10:00 AM - 9:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced component to fetch and display menu items for a category
function MenuItemsByCategorySection({
  categoryId,
  token,
  searchTerm,
  restaurantId,
}) {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const response = await publicRestaurantService.getMenuItemsByCategoryId(
          categoryId,
          token
        );

        if (response.ok) {
          const data = await response.json();
          setMenuItems(data);
          setFilteredItems(data);
        } else {
          throw new Error("Failed to fetch menu items");
        }
      } catch (err) {
        console.error("Error fetching menu items:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, [categoryId, token]);

  // Filter items based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredItems(menuItems);
      return;
    }

    const normalizedSearch = searchTerm.toLowerCase().trim();
    const filtered = menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(normalizedSearch) ||
        (item.description &&
          item.description.toLowerCase().includes(normalizedSearch))
    );

    setFilteredItems(filtered);
  }, [searchTerm, menuItems]);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setShowItemModal(true);
  };

  const handleAddToCart = (item, quantity = 1, selectedAddOns = []) => {
    try {
      // Format selected add-ons properly to include quantity
      const formattedAddOns = selectedAddOns.map((addon) => ({
        id: addon.id,
        name: addon.name,
        price: Number(addon.price || 0),
        quantity: Number(addon.quantity || 1),
        maxQuantity: addon.maxQuantity,
        multiple: addon.multiple,
      }));

      // Debug the add-ons before sending them
      console.log("Adding item with formatted add-ons:", formattedAddOns);

      // Create a clean item object with add-ons properly integrated
      const cartItem = {
        ...item,
        quantity: Number(quantity),
        // Use addOns as the property name, not selectedAddOns
        addOns: formattedAddOns,
      };

      // Remove redundant property if it exists
      delete cartItem.selectedAddOns;

      // Add to cart with the properly structured item
      addToCart(cartItem);

      // Show success toast
      toast.success(`Added ${quantity} ${item.name} to cart`, {
        position: "bottom-right",
        autoClose: 2000,
      });

      if (showItemModal) {
        setShowItemModal(false);
      }
    } catch (error) {
      toast.error(`Couldn't add item to cart: ${error.message}`, {
        position: "bottom-right",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner className="text-blue-600 dark:text-blue-400" />
        <span className="ml-2 text-gray-700 dark:text-gray-300">
          Loading menu items...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <FaSearch className="mx-auto text-4xl text-gray-400 mb-2" />
        <p className="text-gray-500 dark:text-gray-400">
          No menu items match your search
        </p>
        {searchTerm && (
          <Button
            color="light"
            className="mt-3"
            onClick={() => setSearchTerm("")}
          >
            Clear Search
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <Card
            key={item.id}
            className="hover:shadow-lg transition-shadow duration-300 cursor-pointer overflow-hidden"
            onClick={() => handleItemClick(item)}
          >
            <div className="flex h-full">
              {/* Item image with promotion tag if applicable */}
              <div className="w-32 h-32 flex-shrink-0 relative">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <FaUtensils className="text-gray-400 text-2xl" />
                  </div>
                )}
                {item.onPromotion && (
                  <div className="absolute top-0 left-0 bg-red-500 text-white text-xs px-2 py-1 font-semibold">
                    {Math.round(item.discountPercentage)}% OFF
                  </div>
                )}
              </div>

              <div className="ml-4 flex-1 flex flex-col">
                <div className="flex-grow">
                  <h5 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    {item.name}
                    {item.spicy && (
                      <Tooltip content="Spicy">
                        <span className="ml-2 text-red-500">🌶️</span>
                      </Tooltip>
                    )}
                  </h5>

                  {item.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  {/* Price display with discounts */}
                  <div className="mt-2 font-bold flex items-center">
                    {item.onPromotion ? (
                      <>
                        <span className="line-through text-gray-400 mr-2">
                          ${item.price.toFixed(2)}
                        </span>
                        <span className="text-red-600 dark:text-red-500">
                          ${item.discountedPrice.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-800 dark:text-gray-100">
                        ${item.price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Additional attributes badges */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.vegetarian && (
                      <Badge color="success" size="sm">
                        Vegetarian
                      </Badge>
                    )}
                    {item.vegan && (
                      <Badge color="purple" size="sm">
                        Vegan
                      </Badge>
                    )}
                    {item.glutenFree && (
                      <Badge color="indigo" size="sm">
                        Gluten Free
                      </Badge>
                    )}
                    {item.preparationTimeMinutes > 0 && (
                      <Badge color="gray" size="sm">
                        <FaClock className="mr-1" />
                        {item.preparationTimeMinutes} min
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Add to cart button */}
                <div
                  className="mt-3 flex justify-end"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    color="success"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(item);
                    }}
                  >
                    <FaShoppingCart className="mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Menu Item Detail Modal with improved feedback and close functionality */}
      <Modal
        show={showItemModal}
        onClose={() => setShowItemModal(false)}
        size="xl"
      >
        <Modal.Header>{selectedItem?.name}</Modal.Header>

        <Modal.Body>
          {selectedItem && (
            <div className="space-y-6">
              {/* Item image */}
              <div className="flex justify-center">
                {selectedItem.imageUrl ? (
                  <div className="relative w-full">
                    <img
                      src={selectedItem.imageUrl}
                      alt={selectedItem.name}
                      className="w-full max-h-64 object-cover rounded-lg shadow-md"
                    />
                    {selectedItem.onPromotion && (
                      <div className="absolute top-0 left-0 bg-red-600 text-white px-3 py-1 rounded-br-lg rounded-tl-lg font-medium">
                        <FaPercent className="inline mr-1" />
                        {Math.round(selectedItem.discountPercentage)}% OFF
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-200 w-full h-48 rounded-lg flex items-center justify-center">
                    <FaUtensils className="text-gray-400 text-4xl" />
                  </div>
                )}
              </div>

              {/* Price & badges */}
              <div className="flex flex-wrap justify-between items-center">
                <div className="text-xl font-bold">
                  {selectedItem.onPromotion ? (
                    <div className="flex items-center">
                      <span className="line-through text-gray-400 text-lg mr-2">
                        ${selectedItem.price.toFixed(2)}
                      </span>
                      <span className="text-red-600 dark:text-red-500">
                        ${selectedItem.discountedPrice.toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <span>${selectedItem.price.toFixed(2)}</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedItem.vegetarian && (
                    <Badge color="success">Vegetarian</Badge>
                  )}
                  {selectedItem.vegan && <Badge color="purple">Vegan</Badge>}
                  {selectedItem.glutenFree && (
                    <Badge color="indigo">Gluten Free</Badge>
                  )}
                  {selectedItem.spicy && <Badge color="failure">Spicy</Badge>}
                </div>
              </div>

              {/* Description */}
              {selectedItem.description && (
                <div>
                  <h4 className="text-lg font-medium mb-2">Description</h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    {selectedItem.description}
                  </p>
                </div>
              )}

              {/* Preparation time */}
              {selectedItem.preparationTimeMinutes > 0 && (
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <FaClock className="mr-2" />
                  <span>
                    Preparation: {selectedItem.preparationTimeMinutes} minutes
                  </span>
                </div>
              )}

              {/* Add-ons */}
              {selectedItem.addOns && selectedItem.addOns.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="text-lg font-medium mb-2">Add-ons</h4>
                  <div className="space-y-2">
                    {selectedItem.addOns.map((addon) => (
                      <div
                        key={addon.id}
                        className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded"
                      >
                        <div>
                          <p className="font-medium">{addon.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {addon.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            ${addon.price.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {addon.multiple
                              ? `Max: ${addon.maxQuantity}`
                              : "Single"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity selector & add to cart */}
              <div className="pt-4 border-t">
                <ItemAddToCartControl
                  item={selectedItem}
                  onAddToCart={handleAddToCart}
                  closeModal={() => setShowItemModal(false)}
                />
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}

// Component for Add to Cart controls with improved UI and close modal functionality
function ItemAddToCartControl({ item, onAddToCart, closeModal }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

  const handleQuantityChange = (newQuantity) => {
    setQuantity(Math.max(1, newQuantity));
  };

  const handleAddOnToggle = (addon) => {
    const existing = selectedAddOns.find((a) => a.id === addon.id);

    if (existing) {
      // If addon already exists, remove it
      setSelectedAddOns(selectedAddOns.filter((a) => a.id !== addon.id));
    } else {
      // Add new addon with quantity 1
      setSelectedAddOns([...selectedAddOns, { ...addon, quantity: 1 }]);
    }
  };

  const handleAddOnQuantityChange = (addonId, newQuantity) => {
    setSelectedAddOns(
      selectedAddOns.map((addon) =>
        addon.id === addonId
          ? {
              ...addon,
              quantity: Math.max(
                1,
                Math.min(newQuantity, addon.maxQuantity || 10)
              ),
            }
          : addon
      )
    );
  };

  // Calculate total price including add-ons
  const basePrice = item.onPromotion ? item.discountedPrice : item.price;
  const addOnTotal = selectedAddOns.reduce(
    (sum, addon) => sum + addon.price * addon.quantity,
    0
  );
  const totalPrice = (basePrice + addOnTotal) * quantity;

  const handleAddToCartClick = () => {
    setIsAdding(true);

    // Ensure add-ons have consistent format and quantity
    const preparedAddOns = selectedAddOns.map((addon) => ({
      ...addon,
      quantity: Number(addon.quantity || 1),
      price: Number(addon.price || 0),
    }));

    // Log add-ons for debugging
    console.log("Prepared add-ons for cart:", preparedAddOns);

    setTimeout(() => {
      onAddToCart(item, quantity, preparedAddOns);
      setIsAdding(false);
      if (closeModal) closeModal();
    }, 300);
  };

  return (
    <div className="space-y-4">
      {/* Add-on selector */}
      {item.addOns && item.addOns.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Select Add-ons</h4>
          <div className="space-y-2">
            {item.addOns.map((addon) => {
              const isSelected = selectedAddOns.some((a) => a.id === addon.id);
              const selectedAddon = selectedAddOns.find(
                (a) => a.id === addon.id
              );

              return (
                <div
                  key={addon.id}
                  className={`p-3 rounded border ${
                    isSelected
                      ? "border-green-400 bg-green-50 dark:bg-green-900 dark:border-green-700"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleAddOnToggle(addon)}
                        className="mr-2 w-4 h-4"
                      />
                      <div>
                        <p className="font-medium">{addon.name}</p>
                        <p className="text-xs text-gray-500">
                          ${addon.price.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {isSelected && addon.multiple && (
                      <div className="flex items-center">
                        <button
                          onClick={() =>
                            handleAddOnQuantityChange(
                              addon.id,
                              (selectedAddon?.quantity || 1) - 1
                            )
                          }
                          className="p-1 rounded-full border"
                          disabled={(selectedAddon?.quantity || 1) <= 1}
                        >
                          <HiMinus className="h-3 w-3" />
                        </button>
                        <span className="mx-2">
                          {selectedAddon?.quantity || 1}
                        </span>
                        <button
                          onClick={() =>
                            handleAddOnQuantityChange(
                              addon.id,
                              (selectedAddon?.quantity || 1) + 1
                            )
                          }
                          className="p-1 rounded-full border"
                          disabled={
                            (selectedAddon?.quantity || 1) >=
                            (addon.maxQuantity || 10)
                          }
                        >
                          <HiPlus className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity and add to cart */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
        <div className="flex items-center">
          <span className="text-gray-700 dark:text-gray-300 mr-3">
            Quantity
          </span>
          <div className="flex items-center">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              className="p-1.5 rounded-l border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700"
              disabled={quantity <= 1}
            >
              <HiMinus className="h-4 w-4" />
            </button>
            <span className="px-3 py-1 border-y border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              className="p-1.5 rounded-r border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700"
            >
              <HiPlus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className="font-bold text-lg">${totalPrice.toFixed(2)}</span>
          <Button
            color="success"
            onClick={handleAddToCartClick}
            disabled={isAdding}
          >
            {isAdding ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Adding...
              </>
            ) : (
              <>
                <FaShoppingCart className="mr-2" />
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
