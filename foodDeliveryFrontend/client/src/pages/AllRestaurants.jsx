import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  TextInput,
  Spinner,
  Badge,
  Dropdown,
  Alert,
  Rating,
} from "flowbite-react";
import {
  FaSearch,
  FaUtensils,
  FaStar,
  FaClock,
  FaMapMarkerAlt,
  FaLocationArrow,
  FaLock,
  FaSignInAlt,
  FaUserPlus,
  FaTimes,
  FaFilter,
  FaAngleUp,
  FaAngleDown,
  FaHeart,
} from "react-icons/fa";
import { publicRestaurantService } from "../service/public/publicService";
import { useSelector } from "react-redux";

export default function AllRestaurants() {
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
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortBy, setSortBy] = useState("rating"); // rating, distance, name

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

        // Always show restaurant previews even for logged-out users
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
        } catch (err) {
          console.error("Error parsing saved location:", err);
        }
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

    let filtered = restList.filter((restaurant) => {
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
          restaurant.cuisineTypeIds.includes(selectedCuisine)) ||
        (restaurant.cuisineTypes &&
          restaurant.cuisineTypes.some((c) => c.id === selectedCuisine));

      return matchesSearch && matchesCuisine;
    });

    // Sort restaurants
    if (sortBy === "rating") {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "distance" && userLocation) {
      filtered.sort((a, b) => {
        const distA = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          a.latitude,
          a.longitude
        ) || Infinity;
        const distB = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          b.latitude,
          b.longitude
        ) || Infinity;
        return distA - distB;
      });
    }

    return filtered;
  };

  const filteredRestaurants = getFilteredRestaurants();

  // Handle restaurant click
  const handleRestaurantClick = (restaurantId) => {
    if (isLoggedIn) {
      navigate(`/restaurant/${restaurantId}`);
    } else {
      // For non-logged in users, prompt to login instead of navigating
      navigate("/sign-in", { state: { from: `/restaurant/${restaurantId}` } });
    }
  };

  // Toggle between all restaurants and nearby restaurants
  const toggleNearbyFilter = () => {
    if (!isLoggedIn) {
      navigate("/sign-in");
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
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 dark:from-orange-700 dark:to-red-800">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Explore Restaurants
            </h1>
            <p className="text-white text-opacity-90 mb-6">
              Discover the best restaurants in your area and beyond
            </p>
            
            {/* Search Bar */}
            <div className="relative">
              <TextInput
                id="search"
                type="text"
                placeholder="Search for restaurants, cuisines, or dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={FaSearch}
                className="w-full shadow-lg"
                sizing="lg"
              />
              {searchQuery && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setSearchQuery("")}
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Login Alert for Non-Authenticated Users */}
        {!isLoggedIn && (
          <div className="mb-8 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border border-blue-100 dark:border-gray-600 shadow-lg">
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
                    <p className="text-gray-600 dark:text-gray-300">
                      Log in to unlock all features including restaurant details, cuisine filtering, and food ordering.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-3 sm:mt-0">
                  <Button
                    color="blue"
                    onClick={handleLoginClick}
                    className="transition-transform duration-200 hover:scale-105"
                  >
                    <FaSignInAlt className="mr-2" />
                    Log In
                  </Button>
                  <Button
                    color="light"
                    onClick={handleSignupClick}
                    className="transition-transform duration-200 hover:scale-105 border-2 border-blue-600 dark:border-blue-500"
                  >
                    <FaUserPlus className="mr-2" />
                    Sign Up
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Filters Toggle */}
        <div className="md:hidden mb-4">
          <Button
            fullSized
            color="light"
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

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <div
            className={`md:col-span-1 ${
              showMobileFilters ? "block" : "hidden md:block"
            }`}
          >
            <div className="sticky top-4 bg-white dark:bg-gray-800 shadow-md rounded-lg p-5 space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b pb-3 border-gray-200 dark:border-gray-700">
                Filters
              </h2>

              {/* Sort By Options */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  Sort By
                </h3>
                <div className="flex flex-col space-y-2">
                  <Button
                    color={sortBy === "rating" ? "blue" : "light"}
                    size="sm"
                    onClick={() => setSortBy("rating")}
                  >
                    <FaStar className="mr-2" />
                    Highest Rated
                  </Button>
                  {userLocation && (
                    <Button
                      color={sortBy === "distance" ? "blue" : "light"}
                      size="sm"
                      onClick={() => setSortBy("distance")}
                      disabled={!userLocation}
                    >
                      <FaLocationArrow className="mr-2" />
                      Nearest First
                    </Button>
                  )}
                  <Button
                    color={sortBy === "name" ? "blue" : "light"}
                    size="sm"
                    onClick={() => setSortBy("name")}
                  >
                    <FaUtensils className="mr-2" />
                    Alphabetical
                  </Button>
                </div>
              </div>

              {/* Cuisine Filter */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  Cuisine Type
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
                        onClick={() => 
                          setSelectedCuisine(
                            selectedCuisine === cuisine.id ? "" : cuisine.id
                          )
                        }
                      >
                        {cuisine.name}
                      </Button>
                    ))}
                  </div>
                ) : (
                  !isLoggedIn && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
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

              {/* Distance Radius Slider */}
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

              {/* Reset Filters */}
              {(selectedCuisine || searchQuery || showNearby) && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    fullSized
                    color="light"
                    onClick={() => {
                      setSelectedCuisine("");
                      setSearchQuery("");
                      setShowNearby(false);
                    }}
                  >
                    <FaTimes className="mr-2" />
                    Reset All Filters
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Restaurant Listings */}
          <div className="md:col-span-3">
            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    <div className="space-y-2 mt-4">
                      <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <Alert color="failure" className="mb-6">
                <span className="font-medium">Error:</span> {error}
              </Alert>
            )}

            {/* Results Count */}
            {!loading && !error && (
              <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2 sm:mb-0">
                  {filteredRestaurants.length}{" "}
                  {filteredRestaurants.length === 1 
                    ? "Restaurant" 
                    : "Restaurants"}{" "}
                  {selectedCuisine && "• Filtered by cuisine"}
                  {showNearby && "• Nearby"}
                  {searchQuery && `• Search: "${searchQuery}"`}
                </h2>
              </div>
            )}

            {/* No Results */}
            {!loading && !error && filteredRestaurants.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
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
                
                <div className="mt-6 flex flex-wrap gap-3 justify-center">
                  {searchQuery && (
                    <Button color="light" onClick={() => setSearchQuery("")}>
                      <FaTimes className="mr-2" />
                      Clear Search
                    </Button>
                  )}
                  {selectedCuisine && (
                    <Button color="light" onClick={() => setSelectedCuisine("")}>
                      <FaTimes className="mr-2" />
                      Clear Cuisine Filter
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Restaurant Grid */}
            {!loading && !error && filteredRestaurants.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="bg-black bg-opacity-80 p-3 rounded-lg shadow-lg text-white text-center">
                              <FaLock className="mx-auto text-xl mb-1" />
                              <span className="font-medium">
                                Login to view details
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Distance Badge */}
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
                          {isLoggedIn &&
                            restaurant.cuisineTypes &&
                            restaurant.cuisineTypes.length > 3 && (
                              <Badge color="gray" className="px-2 py-1" size="xs">
                                +{restaurant.cuisineTypes.length - 3} more
                              </Badge>
                            )}
                          {!isLoggedIn && (
                            <span className="text-sm text-gray-500">
                              <FaLock className="inline mr-1" /> Login to view cuisine types
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
                              navigate("/sign-in", {
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
            )}
          </div>
        </div>
      </main>
    </div>
  );
}