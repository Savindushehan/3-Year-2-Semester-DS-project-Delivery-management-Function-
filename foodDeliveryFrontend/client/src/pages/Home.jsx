import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  TextInput,
  Spinner,
  Badge,
  Dropdown,
  RangeSlider,
  Alert,
} from "flowbite-react";
import {
  FaSearch,
  FaUtensils,
  FaStar,
  FaClock,
  FaMapMarkerAlt,
  FaLocationArrow,
  FaDirections,
  FaLock,
  FaSignInAlt,
  FaUserPlus,
  FaTimes,
  FaFilter,
  FaAngleUp,
  FaAngleDown,
} from "react-icons/fa";
import { publicRestaurantService } from "../service/public/publicService";
import { useSelector } from "react-redux";

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [distanceRadius, setDistanceRadius] = useState(5);
  const [showNearby, setShowNearby] = useState(false);
  const [nearbyRestaurants, setNearbyRestaurants] = useState([]);

  // New state variables for UI enhancements
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const isLoggedIn = !!currentUser;

  // Get user's current location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationLoading(false);
        setShowNearby(true);

        // Fetch nearby restaurants when location is obtained
        if (isLoggedIn) {
          fetchNearbyRestaurants(
            position.coords.latitude,
            position.coords.longitude,
            distanceRadius
          );
        }
      },
      (error) => {
        setLocationError("Unable to retrieve your location");
        setLocationLoading(false);
        console.error("Geolocation error:", error);
      }
    );
  };

  // Fetch nearby restaurants
  const fetchNearbyRestaurants = async (lat, lng, radius) => {
    if (!isLoggedIn) return;

    try {
      setLoading(true);
      const response = await publicRestaurantService.getNearbyRestaurants(
        lat,
        lng,
        radius,
        currentUser?.token
      );

      if (!response.ok) {
        throw new Error("Failed to fetch nearby restaurants");
      }

      const data = await response.json();
      setNearbyRestaurants(data);
    } catch (err) {
      console.error("Error fetching nearby restaurants:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update radius and fetch new nearby restaurants
  const handleRadiusChange = (value) => {
    setDistanceRadius(value);

    if (userLocation && isLoggedIn) {
      fetchNearbyRestaurants(userLocation.lat, userLocation.lng, value);
    }
  };

  // Fetch restaurants and cuisines on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Always show some restaurant previews even for logged-out users
        const restaurantResponse =
          await publicRestaurantService.getAllEnabledRestaurants(
            currentUser?.token
          );

        if (!restaurantResponse.ok) {
          throw new Error("Failed to fetch restaurants");
        }

        const restaurantData = await restaurantResponse.json();
        setRestaurants(restaurantData);

        // Fetch cuisine types only if user is logged in
        if (isLoggedIn) {
          const cuisineResponse =
            await publicRestaurantService.getActiveCuisineTypes(
              currentUser?.token
            );

          if (cuisineResponse.ok) {
            const cuisineData = await cuisineResponse.json();
            setCuisines(cuisineData);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Only process location if user is logged in
    if (isLoggedIn) {
      // Check if we have user's location in local storage
      const savedLocation = localStorage.getItem("userLocation");
      if (savedLocation) {
        try {
          const locationData = JSON.parse(savedLocation);
          setUserLocation(locationData);

          // Fetch nearby restaurants with saved location
          fetchNearbyRestaurants(
            locationData.lat,
            locationData.lng,
            distanceRadius
          );
          setShowNearby(true);
        } catch (err) {
          console.error("Error parsing saved location:", err);
        }
      }

      // If user is logged in and has location in their profile
      if (currentUser?.latitude && currentUser?.longitude) {
        setUserLocation({
          lat: currentUser.latitude,
          lng: currentUser.longitude,
        });

        // Fetch nearby restaurants with profile location
        fetchNearbyRestaurants(
          currentUser.latitude,
          currentUser.longitude,
          distanceRadius
        );
        setShowNearby(true);
      }
    }
  }, [currentUser]);

  // Save location to local storage when it changes
  useEffect(() => {
    if (userLocation && isLoggedIn) {
      localStorage.setItem("userLocation", JSON.stringify(userLocation));
    }
  }, [userLocation, isLoggedIn]);

  // Calculate distance between two coordinates in kilometers
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    if (!lat1 || !lng1 || !lat2 || !lng2) return null;

    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  };

  // Filter restaurants based on search query and selected cuisine
  const getFilteredRestaurants = () => {
    const restList = showNearby ? nearbyRestaurants : restaurants;

    return restList.filter((restaurant) => {
      const matchesSearch =
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (restaurant.description &&
          restaurant.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()));

      // Only filter by cuisine if logged in and cuisine is selected
      const matchesCuisine =
        !isLoggedIn ||
        !selectedCuisine ||
        (restaurant.cuisineTypeIds &&
          restaurant.cuisineTypeIds.some(
            (cuisine) => cuisine.id === selectedCuisine
          ));

      return matchesSearch && matchesCuisine;
    });
  };

  const filteredRestaurants = getFilteredRestaurants();

  // Handle restaurant click
  const handleRestaurantClick = (restaurantId) => {
    if (isLoggedIn) {
      navigate(`/restaurant/${restaurantId}`);
    } else {
      // For non-logged in users, prompt to login instead of navigating
      navigate("/login", { state: { from: `/restaurant/${restaurantId}` } });
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle cuisine selection
  const handleCuisineChange = (cuisineId) => {
    if (!isLoggedIn) return;
    setSelectedCuisine(cuisineId === selectedCuisine ? "" : cuisineId);
  };

  // Toggle between all restaurants and nearby restaurants
  const toggleNearbyFilter = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    if (!userLocation) {
      getUserLocation();
    } else {
      setShowNearby(!showNearby);
    }
  };

  // Navigate to login page
  const handleLoginClick = () => {
    navigate("/sign-in");
  };

  // Navigate to signup page
  const handleSignupClick = () => {
    navigate("/sign-up");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Enhanced Hero Header Section */}
      <header className="relative bg-gradient-to-r from-orange-500 to-red-600 dark:from-orange-700 dark:to-red-800">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
              Flavour Fleet
            </h1>
            <p className="text-xl md:text-2xl text-white opacity-90 mb-8 max-w-2xl mx-auto">
              Order delicious food from the best restaurants near you
            </p>

            {/* Enhanced Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="relative flex items-center">
                <TextInput
                  id="search"
                  type="text"
                  placeholder="Search for restaurants, cuisines, or dishes..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  icon={FaSearch}
                  className="w-full shadow-xl drop-shadow-lg"
                  sizing="lg"
                />
                {searchQuery && (
                  <button
                    className="absolute right-3 text-gray-500 hover:text-gray-700"
                    onClick={() => setSearchQuery("")}
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Login Alert for Non-Authenticated Users - Enhanced */}
        {!isLoggedIn && (
          <div className="mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border border-blue-100 dark:border-gray-600 shadow-lg transform transition duration-300 hover:shadow-xl">
            <div className="p-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            <div className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between w-full">
                <div className="flex items-start sm:items-center mb-4 sm:mb-0">
                  <div className="flex-shrink-0 bg-blue-100 dark:bg-gray-700 p-3 rounded-full mr-4">
                    <FaLock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                      Limited Access Mode
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 max-w-lg">
                      Log in to unlock all features including restaurant
                      details, cuisine filtering, and food ordering.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-3 sm:mt-0">
                  <Button
                    color="blue"
                    size="lg"
                    onClick={handleLoginClick}
                    className="transition-transform duration-200 hover:scale-105 font-medium rounded-lg"
                  >
                    <FaSignInAlt className="mr-2" />
                    Log In
                  </Button>
                  <Button
                    color="light"
                    size="lg"
                    onClick={handleSignupClick}
                    className="transition-transform duration-200 hover:scale-105 font-medium border-2 border-blue-600 dark:border-blue-500 rounded-lg"
                  >
                    <FaUserPlus className="mr-2" />
                    Sign Up
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Filters Toggle - Only on Small Screens */}
        <div className="md:hidden mb-4">
          <Button
            fullSized
            color="light"
            className="flex items-center justify-center"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <FaFilter className="mr-2" />
            Filters{" "}
            {showMobileFilters ? (
              <FaAngleUp className="ml-2" />
            ) : (
              <FaAngleDown className="ml-2" />
            )}
          </Button>
        </div>

        {/* Two-column Layout for Desktop, Stack for Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar - Left Side on Desktop, Collapsible on Mobile */}
          <div
            className={`md:col-span-1 ${
              showMobileFilters ? "block" : "hidden md:block"
            }`}
          >
            <div className="sticky top-4 bg-white dark:bg-gray-800 shadow-md rounded-lg p-5 space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b pb-3 border-gray-200 dark:border-gray-700">
                Filters
              </h2>

              {/* Cuisine Filter */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  Filter by Cuisine
                </h3>
                {isLoggedIn && cuisines.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {cuisines.map((cuisine) => (
                      <Button
                        key={cuisine.id}
                        color={
                          selectedCuisine === cuisine.id ? "success" : "light"
                        }
                        size="xs"
                        pill={true}
                        onClick={() => handleCuisineChange(cuisine.id)}
                        className="dark:border-gray-700"
                      >
                        {cuisine.name}
                      </Button>
                    ))}
                  </div>
                ) : (
                  !isLoggedIn && (
                    <p className="text-sm text-gray-500">
                      <FaLock className="inline mr-2" />
                      Log in to filter by cuisine type
                    </p>
                  )
                )}
              </div>

              {/* Location Filter */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  Location
                </h3>
                <Button
                  fullSized
                  color={showNearby ? "success" : "light"}
                  className="flex items-center justify-center"
                  onClick={toggleNearbyFilter}
                  disabled={locationLoading || !isLoggedIn}
                >
                  {locationLoading ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Finding location...
                    </>
                  ) : (
                    <>
                      <FaLocationArrow className="mr-2" />
                      {!isLoggedIn
                        ? "Login to view nearby"
                        : showNearby
                        ? "Show All Restaurants"
                        : "Show Nearby Restaurants"}
                    </>
                  )}
                </Button>

                {locationError && (
                  <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                    {locationError}
                  </div>
                )}
              </div>

              {/* Distance Radius Slider (only show when viewing nearby restaurants and logged in) */}
              {isLoggedIn && showNearby && userLocation && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                    Distance: {distanceRadius} km
                  </h3>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={distanceRadius}
                    onChange={(e) =>
                      handleRadiusChange(parseInt(e.target.value))
                    }
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>1 km</span>
                    <span>10 km</span>
                    <span>20 km</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content - Right Side */}
          <div className="md:col-span-3">
            {/* Loading State */}
            {loading && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col h-full"
                    >
                      {/* Skeleton Image */}
                      <div className="w-full h-48 bg-gray-300 dark:bg-gray-700 animate-pulse"></div>

                      {/* Skeleton Content */}
                      <div className="p-4 flex-grow flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-10 animate-pulse"></div>
                        </div>

                        {/* Skeleton Tags */}
                        <div className="flex flex-wrap gap-1 mt-1 mb-2">
                          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-14 animate-pulse"></div>
                        </div>

                        {/* Skeleton Description */}
                        <div className="space-y-2 mb-3 flex-grow">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse"></div>
                        </div>

                        <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
                          {/* Skeleton Address */}
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5 animate-pulse mb-2"></div>
                          {/* Skeleton Delivery Time */}
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Error State */}
            {error && (
              <Alert color="failure" className="mb-6">
                <span className="font-medium">Error:</span> {error}
              </Alert>
            )}

            {/* No Results */}
            {!loading && !error && filteredRestaurants.length === 0 && (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow">
                <FaUtensils className="mx-auto text-gray-400 dark:text-gray-600 text-5xl mb-4" />
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                  No restaurants found
                </h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  {showNearby
                    ? "No restaurants found within the selected radius. Try increasing the distance."
                    : searchQuery
                    ? "Try a different search term or filter"
                    : "There are no restaurants available at the moment"}
                </p>
                {searchQuery && (
                  <Button
                    color="light"
                    className="mt-4"
                    onClick={() => setSearchQuery("")}
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            )}

            {/* Results Summary */}
            {!loading && !error && filteredRestaurants.length > 0 && (
              <div className="mb-4 text-gray-700 dark:text-gray-300">
                Showing {filteredRestaurants.length}{" "}
                {filteredRestaurants.length === 1
                  ? "restaurant"
                  : "restaurants"}
                {selectedCuisine && " (filtered by cuisine)"}
                {showNearby && " near you"}
              </div>
            )}

            {/* Enhanced Restaurant Grid - With proper card sizes and layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredRestaurants.map((restaurant) => {
                // Calculate distance if we have user location and restaurant location
                const distance =
                  userLocation && restaurant.latitude && restaurant.longitude
                    ? calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        restaurant.latitude,
                        restaurant.longitude
                      )
                    : null;

                return (
                  <Card
                    key={restaurant.id}
                    className="h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col"
                    onClick={() => handleRestaurantClick(restaurant.id)}
                  >
                    {/* Restaurant Image */}
                    <div className="w-full h-48 overflow-hidden relative">
                      <img
                        src={
                          restaurant.restaurantImageUrl ||
                          "https://via.placeholder.com/300x200?text=No+Image"
                        }
                        alt={restaurant.name}
                        className={`w-full h-full object-cover ${
                          !isLoggedIn ? "opacity-80" : ""
                        } transition-transform duration-300 hover:scale-105`}
                      />

                      {/* Login Required Overlay */}
                      {!isLoggedIn && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                          <div className="bg-black bg-opacity-80 p-3 rounded-lg shadow-lg text-white text-center">
                            <FaLock className="mx-auto text-xl mb-1" />
                            <span className="font-medium">
                              Login to view details
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Distance Badge - If available */}
                      {isLoggedIn && distance !== null && (
                        <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                          {distance.toFixed(1)} km
                        </div>
                      )}
                    </div>

                    {/* Restaurant Info */}
                    <div className="p-4 flex-grow flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white line-clamp-1">
                          {restaurant.name}
                        </h5>
                        <div className="flex items-center bg-yellow-50 dark:bg-gray-700 px-2 py-1 rounded text-sm">
                          <FaStar className="text-yellow-400 dark:text-yellow-300 mr-1" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {restaurant.rating
                              ? restaurant.rating.toFixed(1)
                              : "New"}
                          </span>
                        </div>
                      </div>

                      {/* Cuisine Tags */}
                      <div className="flex flex-wrap gap-1 mt-1 mb-2">
                        {isLoggedIn &&
                          restaurant.cuisineTypes &&
                          restaurant.cuisineTypes.slice(0, 3).map((cuisine) => (
                            <Badge
                              key={cuisine.id}
                              color="info"
                              className="px-2 py-1"
                              size="xs"
                            >
                              {cuisine.name}
                            </Badge>
                          ))}
                        {restaurant.cuisineTypes &&
                          restaurant.cuisineTypes.length > 3 && (
                            <Badge color="gray" className="px-2 py-1" size="xs">
                              +{restaurant.cuisineTypes.length - 3} more
                            </Badge>
                          )}
                        {!isLoggedIn && (
                          <span className="text-sm text-gray-500">
                            <FaLock className="inline mr-1" /> Login to view
                            cuisine types
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      {restaurant.description && (
                        <p className="mt-1 mb-3 text-gray-600 dark:text-gray-300 text-sm line-clamp-2 flex-grow">
                          {restaurant.description}
                        </p>
                      )}

                      <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
                        {/* Address */}
                        {restaurant.address && (
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                            <FaMapMarkerAlt className="mr-1 flex-shrink-0" />
                            <span className="truncate">
                              {restaurant.address}
                            </span>
                          </div>
                        )}

                        {/* Delivery Time */}
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <FaClock className="mr-1 flex-shrink-0" />
                          <span>
                            {restaurant.deliveryTime || "30-45"} min delivery
                            time
                          </span>
                        </div>
                      </div>

                      {/* Login Button - For non-authenticated users */}
                      {!isLoggedIn && (
                        <Button
                          gradientDuoTone="purpleToBlue"
                          className="w-full mt-4 font-medium"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/login", {
                              state: { from: `/restaurant/${restaurant.id}` },
                            });
                          }}
                        >
                          <FaSignInAlt className="mr-2" />
                          Login to View Details
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
