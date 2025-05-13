import React, { useState, useEffect } from "react";
import {
  Button,
  Label,
  Modal,
  Spinner,
  Badge,
  Card,
  Avatar,
} from "flowbite-react";
import {
  HiOutlineClock,
  HiPhone,
  HiMail,
  HiLocationMarker,
  HiEye,
  HiCalendar,
} from "react-icons/hi";
import { FaStore, FaUtensils, FaMapMarkedAlt } from "react-icons/fa";
import { BsPersonBadge } from "react-icons/bs";
import { cuisineTypeService } from "../../../service/cuisineService";
import { GoogleMap, Marker, LoadScript } from "@react-google-maps/api";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { authService } from "../../../service/authService";

const mapContainerStyle = {
  width: "100%",
  height: "300px",
};

const daysOfWeek = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

export const ViewRestaurantModal = ({ show, onClose, restaurant, token }) => {
  const [loading, setLoading] = useState(false);
  const [cuisines, setCuisines] = useState([]);
  const [admins, setAdmins] = useState([]);

  // Fetch associated data when modal is shown with valid restaurant
  useEffect(() => {
    if (show && restaurant) {
      fetchAssociatedData();
    }
  }, [show, restaurant]);

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "PPpp");
    } catch (error) {
      return dateString;
    }
  };

  // Fetch associated cuisine and admin data
  const fetchAssociatedData = async () => {
    setLoading(true);

    try {
      // Fetch associated data in parallel for better performance
      await Promise.all([
        fetchCuisineDetails(restaurant.cuisineTypeIds),
        fetchAdminDetails(restaurant.adminIds),
      ]);
    } catch (error) {
      console.error("Error fetching associated data:", error);
      toast.error("Error loading complete restaurant details");
    } finally {
      setLoading(false);
    }
  };

  // Fetch cuisine details
  const fetchCuisineDetails = async (cuisineIds) => {
    if (!cuisineIds || !cuisineIds.length) {
      setCuisines([]);
      return;
    }

    try {
      const response = await cuisineTypeService.getAllCuisineTypes(token);
      if (response.ok) {
        const allCuisines = await response.json();

        // Filter only cuisines associated with this restaurant
        const filteredCuisines = allCuisines.filter((cuisine) =>
          cuisineIds.includes(cuisine.id)
        );

        setCuisines(filteredCuisines);
      }
    } catch (error) {
      console.error("Error fetching cuisine details:", error);
    }
  };

  // Fetch admin details
  const fetchAdminDetails = async (adminIds) => {
    if (!adminIds || !adminIds.length) {
      setAdmins([]);
      return;
    }

    try {
      const response = await authService.getRestaurantAdmins(token);
      if (response.ok) {
        const allAdmins = await response.json();

        // Convert adminIds to strings for consistent comparison
        const adminIdStrings = adminIds.map((id) => String(id));

        // Filter only admins associated with this restaurant
        const filteredAdmins = allAdmins.filter((admin) =>
          adminIdStrings.includes(String(admin.id))
        );

        console.log("Filtered admins:", filteredAdmins);
        setAdmins(filteredAdmins);
      }
    } catch (error) {
      console.error("Error fetching admin details:", error);
    }
  };

  // Format opening hours for display
  const formatOpeningHours = (day) => {
    if (day.closed) {
      return "Closed";
    }

    const formatTime = (timeString) => {
      try {
        const [hours, minutes] = timeString.split(":");
        const hour = parseInt(hours, 10);
        const period = hour >= 12 ? "PM" : "AM";
        const adjustedHour = hour % 12 || 12;
        return `${adjustedHour}:${minutes} ${period}`;
      } catch (error) {
        return timeString;
      }
    };

    return `${formatTime(day.openTime)} - ${formatTime(day.closeTime)}`;
  };

  return (
    <Modal
      show={show}
      onClose={onClose}
      size="6xl"
      popup={false}
    >
      <Modal.Header className="border-b border-gray-200 bg-gray-50">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-full mr-3">
            <HiEye className="text-blue-600" size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            Restaurant Details
          </h3>
        </div>
      </Modal.Header>

      <Modal.Body className="px-6">
        {!restaurant ? (
          <div className="text-center text-gray-500 py-8">
            <p>No restaurant data available.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Restaurant Banner and Basic Info */}
            <div className="relative w-full h-56 bg-gray-100 rounded-lg overflow-hidden">
              {restaurant.bannerImageUrl ? (
                <img
                  src={restaurant.bannerImageUrl}
                  alt={`${restaurant.name} banner`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <FaStore size={48} className="text-gray-400" />
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent p-4">
                <div className="flex items-end">
                  {restaurant.restaurantImageUrl ? (
                    <img
                      src={restaurant.restaurantImageUrl}
                      alt={restaurant.name}
                      className="w-20 h-20 rounded-lg border-2 border-white object-cover mr-3"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-white flex items-center justify-center mr-3">
                      <FaStore size={32} className="text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {restaurant.name}
                    </h2>
                    <Badge
                      color={restaurant.enabled ? "success" : "failure"}
                      className="mt-1"
                    >
                      {restaurant.enabled ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Restaurant Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left column - Basic Information */}
              <div className="space-y-4">
                <Card>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Basic Information
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <Label
                        value="Description"
                        className="text-sm text-gray-500"
                      />
                      <p className="text-gray-800">
                        {restaurant.description || "No description provided."}
                      </p>
                    </div>

                    <div>
                      <Label
                        value="Contact Information"
                        className="text-sm text-gray-500"
                      />
                      <div className="flex items-center mt-1">
                        <HiPhone className="text-gray-400 mr-2" />
                        <span>{restaurant.phoneNumber || "N/A"}</span>
                      </div>
                      {restaurant.email && (
                        <div className="flex items-center mt-1">
                          <HiMail className="text-gray-400 mr-2" />
                          <span>{restaurant.email}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label
                        value="Address"
                        className="text-sm text-gray-500"
                      />
                      <div className="flex items-start mt-1">
                        <HiLocationMarker className="text-gray-400 mr-2 mt-1" />
                        <span>
                          {restaurant.formattedAddress ||
                            restaurant.address ||
                            "N/A"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <Label
                        value="Registration Date"
                        className="text-sm text-gray-500"
                      />
                      <div className="flex items-center mt-1">
                        <HiCalendar className="text-gray-400 mr-2" />
                        <span>{formatDate(restaurant.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Cuisine Types
                  </h3>
                  {loading ? (
                    <div className="flex justify-center py-4">
                      <Spinner size="md" />
                    </div>
                  ) : cuisines.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {cuisines.map((cuisine) => (
                        <div
                          key={cuisine.id}
                          className="flex items-center p-2 border rounded-lg"
                        >
                          {cuisine.iconUrl && (
                            <img
                              src={cuisine.iconUrl}
                              alt={cuisine.name}
                              className="w-8 h-8 rounded-full mr-2 object-cover"
                            />
                          )}
                          <span>{cuisine.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No cuisine types specified.</p>
                  )}
                </Card>
              </div>

              {/* Middle column - Operating Hours and Map */}
              <div className="space-y-4">
                <Card>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    <div className="flex items-center">
                      <HiOutlineClock className="mr-2 text-blue-500" />
                      Opening Hours
                    </div>
                  </h3>

                  {restaurant.openingHours &&
                  restaurant.openingHours.length > 0 ? (
                    <div className="space-y-2">
                      {restaurant.openingHours
                        .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                        .map((day) => (
                          <div
                            key={day.dayOfWeek}
                            className="flex justify-between items-center py-1 border-b border-gray-100"
                          >
                            <span className="font-medium">
                              {daysOfWeek[day.dayOfWeek]}
                            </span>
                            <span
                              className={
                                day.closed ? "text-red-500" : "text-green-600"
                              }
                            >
                              {formatOpeningHours(day)}
                            </span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No opening hours specified.</p>
                  )}
                </Card>

                <Card>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    <div className="flex items-center">
                      <FaMapMarkedAlt className="mr-2 text-blue-500" />
                      Location
                    </div>
                  </h3>

                  {restaurant.latitude && restaurant.longitude ? (
                    <LoadScript
                      googleMapsApiKey="AIzaSyCms2-r4afPJIKiStBZUNuRx_4BdU2p9ps"
                      onLoad={() => console.log("Google Maps API loaded")}
                    >
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        zoom={15}
                        center={{
                          lat: restaurant.latitude,
                          lng: restaurant.longitude,
                        }}
                      >
                        <Marker
                          position={{
                            lat: restaurant.latitude,
                            lng: restaurant.longitude,
                          }}
                          title={restaurant.name}
                        />
                      </GoogleMap>
                    </LoadScript>
                  ) : (
                    <p className="text-gray-500">
                      No location coordinates available.
                    </p>
                  )}
                </Card>
              </div>

              {/* Right column - Admins */}
              <div>
                <Card>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    <div className="flex items-center">
                      <BsPersonBadge className="mr-2 text-blue-500" />
                      Restaurant Administrators
                    </div>
                  </h3>

                  {loading ? (
                    <div className="flex justify-center py-4">
                      <Spinner size="md" />
                    </div>
                  ) : admins.length > 0 ? (
                    <div className="space-y-3">
                      {admins.map((admin) => (
                        <div
                          key={admin.id}
                          className="flex items-center p-3 bg-gray-50 rounded-lg"
                        >
                          <Avatar
                            img={admin.profilePictureUrl}
                            alt={admin.username}
                            rounded
                            bordered
                            size="md"
                            className="mr-3"
                          />
                          <div>
                            <p className="font-medium">
                              {admin.firstName && admin.lastName
                                ? `${admin.firstName} ${admin.lastName}`
                                : admin.username}
                            </p>
                            {admin.email && (
                              <div className="flex items-center text-sm text-gray-500">
                                <HiMail className="mr-1" />
                                <span>{admin.email}</span>
                              </div>
                            )}
                            {admin.phoneNumber && (
                              <div className="flex items-center text-sm text-gray-500">
                                <HiPhone className="mr-1" />
                                <span>{admin.phoneNumber}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      No administrators assigned to this restaurant.
                    </p>
                  )}
                </Card>
              </div>
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="border-t border-gray-200 bg-gray-50">
        <Button color="gray" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
