import React, { useState, useEffect } from "react";
import { Modal, Button, Spinner, TextInput, Card, Badge } from "flowbite-react";
import { HiOutlineSearch, HiPlus, HiMinusCircle } from "react-icons/hi";
import {
  FaStore,
  FaCheckCircle,
  FaArrowRight,
  FaArrowLeft,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { restaurantService } from "../../../service/restaurantService";
import { cuisineTypeService } from "../../../service/cuisineService";

export const ManageRestaurantsModal = ({
  show,
  onClose,
  cuisineData,
  token,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(true);
  const [processingRestaurantIds, setProcessingRestaurantIds] = useState([]); // Track restaurants being added/removed
  const [associatedRestaurants, setAssociatedRestaurants] = useState([]);
  const [availableRestaurants, setAvailableRestaurants] = useState([]);
  const [searchAssociated, setSearchAssociated] = useState("");
  const [searchAvailable, setSearchAvailable] = useState("");

  useEffect(() => {
    if (show && cuisineData) {
      fetchRestaurants();
    }
  }, [show, cuisineData]);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      // Fetch all restaurants
      const response = await restaurantService.getAllRestaurants(token);
      if (!response.ok) {
        throw new Error("Failed to fetch restaurants");
      }
  
      const allRestaurants = await response.json();
  
      // Filter only enabled restaurants
      const enabledRestaurants = allRestaurants.filter((r) => r.enabled === true);
  
      // Set associated restaurants from cuisineData
      const currentRestaurants = cuisineData.restaurants || [];
  
      // Ensure we have complete restaurant objects for associated restaurants
      const completeAssociatedRestaurants = currentRestaurants.map((r) => {
        const fullRestaurant = enabledRestaurants.find((er) => er.id === r.id);
        return fullRestaurant || r;
      });
  
      setAssociatedRestaurants(completeAssociatedRestaurants);
  
      // Filter out restaurants that are already associated with the cuisine
      const currentIds = new Set(currentRestaurants.map((r) => r.id));
      const availableRests = enabledRestaurants.filter((r) => !currentIds.has(r.id));
      setAvailableRestaurants(availableRests);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      toast.error("Could not load restaurants");
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddRestaurant = async (restaurantId) => {
    setProcessingRestaurantIds((prev) => [...prev, restaurantId]);
  
    try {
      const response = await cuisineTypeService.addRestaurantToCuisineType(
        cuisineData.id,
        restaurantId,
        token
      );
  
      if (response.ok) {
        toast.success("Restaurant added to cuisine type successfully");
  
        // Find the restaurant in availableRestaurants
        const restaurant = availableRestaurants.find((r) => r.id === restaurantId);
  
        if (restaurant) {
          // Update the UI optimistically
          setAssociatedRestaurants((prev) => [...prev, restaurant]);
          setAvailableRestaurants((prev) => prev.filter((r) => r.id !== restaurantId));
        }
  
        if (onSuccess) {
          onSuccess();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add restaurant");
      }
    } catch (error) {
      console.error("Error adding restaurant:", error);
      toast.error(error.message || "Failed to add restaurant");
    } finally {
      setProcessingRestaurantIds((prev) => prev.filter((id) => id !== restaurantId));
    }
  };
  
  const handleRemoveRestaurant = async (restaurantId) => {
    setProcessingRestaurantIds((prev) => [...prev, restaurantId]);
  
    try {
      const response = await cuisineTypeService.removeRestaurantFromCuisineType(
        cuisineData.id,
        restaurantId,
        token
      );
  
      if (response.ok) {
        toast.success("Restaurant removed from cuisine type successfully");
  
        // Find the restaurant in associatedRestaurants
        const restaurant = associatedRestaurants.find((r) => r.id === restaurantId);
  
        if (restaurant) {
          // Update the UI optimistically
          setAssociatedRestaurants((prev) => prev.filter((r) => r.id !== restaurantId));
  
          // Only move to available if the restaurant is enabled
          if (restaurant.enabled) {
            setAvailableRestaurants((prev) => [...prev, restaurant]);
          }
        }
  
        if (onSuccess) {
          onSuccess();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove restaurant");
      }
    } catch (error) {
      console.error("Error removing restaurant:", error);
      toast.error(error.message || "Failed to remove restaurant");
    } finally {
      setProcessingRestaurantIds((prev) => prev.filter((id) => id !== restaurantId));
    }
  };

  // Filter restaurants based on search term
  const filteredAssociatedRestaurants = associatedRestaurants.filter(
    (restaurant) =>
      restaurant.name?.toLowerCase().includes(searchAssociated.toLowerCase())
  );

  const filteredAvailableRestaurants = availableRestaurants.filter(
    (restaurant) =>
      restaurant.name?.toLowerCase().includes(searchAvailable.toLowerCase())
  );

  // Restaurant card component for reuse
  const RestaurantCard = ({ restaurant, isAssociated }) => {
    const isProcessing = processingRestaurantIds.includes(restaurant.id);

    return (
      <Card
        className={`mb-3 transition-all duration-300 ${
          isProcessing ? "opacity-70" : "hover:shadow-lg"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {restaurant.restaurantImageUrl ? (
              <img
                src={restaurant.restaurantImageUrl}
                alt={restaurant.name}
                className="w-14 h-14 object-cover rounded-lg mr-4"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/56?text=No+Image";
                }}
              />
            ) : (
              <div className="w-14 h-14 bg-gray-200 rounded-lg mr-4 flex items-center justify-center">
                <FaStore className="text-gray-400" size={24} />
              </div>
            )}
            <div>
              <h4
                className="font-medium text-gray-900 leading-tight break-words max-w-[250px]"
                style={{ wordBreak: "break-word" }}
              >
                {restaurant.name}
              </h4>
              <p
                className="text-sm text-gray-500 truncate max-w-[250px]"
                title={
                  restaurant.formattedAddress ||
                  restaurant.address ||
                  "No address provided"
                }
              >
                {restaurant.formattedAddress ||
                  restaurant.address ||
                  "No address provided"}
              </p>
            </div>
          </div>
          <div>
            {isAssociated ? (
              <Button
                color="red"
                size="sm"
                onClick={() => handleRemoveRestaurant(restaurant.id)}
                disabled={isProcessing}
                className="px-2"
              >
                {isProcessing ? (
                  <Spinner size="sm" className="mr-2" />
                ) : (
                  <HiMinusCircle className="mr-1" />
                )}
                {isProcessing ? "Removing..." : "Remove"}
              </Button>
            ) : (
              <Button
                color="success"
                size="sm"
                onClick={() => handleAddRestaurant(restaurant.id)}
                disabled={isProcessing}
                className="px-2"
              >
                {isProcessing ? (
                  <Spinner size="sm" className="mr-2" />
                ) : (
                  <HiPlus className="mr-1" />
                )}
                {isProcessing ? "Adding..." : "Add"}
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  };
  
  return (
    <Modal show={show} onClose={onClose} size="6xl" popup={false}>
      <Modal.Header className="border-b border-gray-200 bg-gray-50">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-full mr-3">
            <FaStore className="text-blue-600" size={20} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">
            Manage Restaurants - {cuisineData?.name}
          </h3>
        </div>
      </Modal.Header>

      <Modal.Body className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Restaurants Column */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Badge color="blue" className="mr-2">
                  {associatedRestaurants.length}
                </Badge>
                Current Restaurants
              </h3>
            </div>

            <TextInput
              type="text"
              placeholder="Search current restaurants..."
              value={searchAssociated}
              onChange={(e) => setSearchAssociated(e.target.value)}
              rightIcon={HiOutlineSearch}
              className="mb-4"
            />

            {loading ? (
              <div className="flex justify-center py-8 border border-dashed border-gray-200 rounded-lg">
                <Spinner size="xl" />
              </div>
            ) : filteredAssociatedRestaurants.length > 0 ? (
              <div className="h-96 overflow-y-auto pr-2 border border-gray-100 rounded-lg p-4 bg-gray-50">
                {filteredAssociatedRestaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    isAssociated={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed border-gray-200 rounded-lg h-96 flex flex-col items-center justify-center">
                <div className="p-3 bg-gray-100 rounded-full inline-block mb-3">
                  <FaStore className="text-gray-400" size={30} />
                </div>
                <p className="text-gray-500">
                  {searchAssociated
                    ? "No restaurants match your search"
                    : "No restaurants are currently associated"}
                </p>
              </div>
            )}
          </div>

          {/* Available Restaurants Column */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Badge color="gray" className="mr-2">
                  {availableRestaurants.length}
                </Badge>
                Available Restaurants
              </h3>
            </div>

            <TextInput
              type="text"
              placeholder="Search available restaurants..."
              value={searchAvailable}
              onChange={(e) => setSearchAvailable(e.target.value)}
              rightIcon={HiOutlineSearch}
              className="mb-4"
            />

            {loading ? (
              <div className="flex justify-center py-8 border border-dashed border-gray-200 rounded-lg">
                <Spinner size="xl" />
              </div>
            ) : filteredAvailableRestaurants.length > 0 ? (
              <div className="h-96 overflow-y-auto pr-2 border border-gray-100 rounded-lg p-4 bg-gray-50">
                {filteredAvailableRestaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    isAssociated={false}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed border-gray-200 rounded-lg h-96 flex flex-col items-center justify-center">
                <div className="p-3 bg-gray-100 rounded-full inline-block mb-3">
                  <FaStore className="text-gray-400" size={30} />
                </div>
                <p className="text-gray-500">
                  {searchAvailable
                    ? "No restaurants match your search"
                    : "No additional restaurants available to add"}
                </p>
                {!searchAvailable && availableRestaurants.length === 0 && (
                  <p className="text-sm text-gray-400 mt-2">
                    All enabled restaurants are already associated
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="border-t border-gray-200 bg-gray-50">
        <Button color="gray" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
