import React, { useState, useEffect } from "react";
import {
  Button,
  Label,
  Modal,
  TextInput,
  Textarea,
  Spinner,
  Alert,
  ToggleSwitch,
  Card,
} from "flowbite-react";
import { toast } from "react-toastify";
import {
  HiOutlineClock,
  HiPhone,
  HiMail,
  HiLocationMarker,
  HiPhotograph,
  HiPencilAlt,
  HiCheck,
  HiX,
} from "react-icons/hi";
import { FaStore, FaUtensils } from "react-icons/fa";
import { BsPersonBadge } from "react-icons/bs";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../../../firebase";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { restaurantService } from "../../../service/restaurantService";
import { cuisineTypeService } from "../../../service/cuisineService";
import { GoogleMap, Marker, LoadScript } from "@react-google-maps/api";
import Select from "react-select";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { authService } from "../../../service/authService";

const mapContainerStyle = {
  width: "100%",
  height: "300px",
};

const daysOfWeek = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" },
];

export const UpdateRestaurantModal = ({
  show,
  onClose,
  restaurant,
  onSuccess,
  token,
}) => {
  // Basic restaurant form data
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    restaurantImageUrl: "",
    bannerImageUrl: "",
    phoneNumber: "",
    email: "",
    latitude: 0,
    longitude: 0,
    formattedAddress: "",
    openingHours: [],
    cuisineTypeIds: [],
    adminIds: [],
    enabled: true, // Add the enabled property with default true
  });

  // States for storing lists of cuisines and admins
  const [cuisineTypes, setCuisineTypes] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);

  // For tracking if restaurant data is loading
  const [isLoading, setIsLoading] = useState(false);

  // Form state management
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [locationValue, setLocationValue] = useState(null);

  // Image upload states for restaurant image
  const [restaurantImage, setRestaurantImage] = useState(null);
  const [restaurantImagePreview, setRestaurantImagePreview] = useState(null);
  const [restaurantImageProgress, setRestaurantImageProgress] = useState(0);
  const [restaurantImageUploading, setRestaurantImageUploading] =
    useState(false);
  const [restaurantImageError, setRestaurantImageError] = useState(null);

  // Image upload states for banner image
  const [bannerImage, setBannerImage] = useState(null);
  const [bannerImagePreview, setBannerImagePreview] = useState(null);
  const [bannerImageProgress, setBannerImageProgress] = useState(0);
  const [bannerImageUploading, setBannerImageUploading] = useState(false);
  const [bannerImageError, setBannerImageError] = useState(null);

  // Opening hours management
  const [openingHoursData, setOpeningHoursData] = useState([
    { dayOfWeek: 1, openTime: "09:00", closeTime: "17:00", closed: false },
    { dayOfWeek: 2, openTime: "09:00", closeTime: "17:00", closed: false },
    { dayOfWeek: 3, openTime: "09:00", closeTime: "17:00", closed: false },
    { dayOfWeek: 4, openTime: "09:00", closeTime: "17:00", closed: false },
    { dayOfWeek: 5, openTime: "09:00", closeTime: "17:00", closed: false },
    { dayOfWeek: 6, openTime: "09:00", closeTime: "17:00", closed: false },
    { dayOfWeek: 7, openTime: "09:00", closeTime: "17:00", closed: true },
  ]);

  // Map center state
  const [mapCenter, setMapCenter] = useState({
    lat: 6.927079, // Default to Colombo, Sri Lanka
    lng: 79.861244,
  });

  // Initialize form data from restaurant object when modal opens
  useEffect(() => {
    if (show && restaurant) {
      initializeFormData();
    }
  }, [show, restaurant]);

  // Fetch admin users only after form data is initialized
  useEffect(() => {
    if (show) {
      fetchCuisineTypes();
      fetchAdminUsers(); // Call this immediately when modal opens, not dependent on formData
    }
  }, [show, token]);

  const handleEnabledChange = () => {
    setFormData({
      ...formData,
      enabled: !formData.enabled,
    });
  };

  // Initialize form data from restaurant object
  const initializeFormData = () => {
    setIsLoading(true);

    try {
      // Initialize form data from restaurant
      let cuisineIds = [];
      if (restaurant.cuisineTypes) {
        // If cuisineTypes is an array of objects with id properties
        if (
          Array.isArray(restaurant.cuisineTypes) &&
          restaurant.cuisineTypes.length > 0 &&
          typeof restaurant.cuisineTypes[0] === "object" &&
          restaurant.cuisineTypes[0].id
        ) {
          cuisineIds = restaurant.cuisineTypes.map((cuisine) => cuisine.id);
        }
        // If cuisineTypes is already an array of IDs
        else if (Array.isArray(restaurant.cuisineTypes)) {
          cuisineIds = restaurant.cuisineTypes;
        }
      } else if (restaurant.cuisineTypeIds) {
        cuisineIds = restaurant.cuisineTypeIds;
      }

      // Extract admin IDs properly
      let adminIds = [];
      if (restaurant.adminIds) {
        // If adminIds is already an array of IDs
        if (Array.isArray(restaurant.adminIds)) {
          adminIds = restaurant.adminIds.map((id) => id.toString());
        }
      } else if (restaurant.admins) {
        // Alternative property name: if 'admins' exists instead of 'adminIds'
        if (Array.isArray(restaurant.admins)) {
          if (
            restaurant.admins.length > 0 &&
            typeof restaurant.admins[0] === "object" &&
            restaurant.admins[0].id
          ) {
            // Array of objects with id property
            adminIds = restaurant.admins.map((admin) => admin.id.toString());
          } else {
            // Array of direct ID values
            adminIds = restaurant.admins.map((id) => id.toString());
          }
        }
      }

      setFormData({
        name: restaurant.name || "",
        description: restaurant.description || "",
        address: restaurant.address || "",
        restaurantImageUrl: restaurant.restaurantImageUrl || "",
        bannerImageUrl: restaurant.bannerImageUrl || "",
        phoneNumber: restaurant.phoneNumber || "",
        email: restaurant.email || "",
        latitude: restaurant.latitude || 0,
        longitude: restaurant.longitude || 0,
        formattedAddress: restaurant.formattedAddress || "",
        cuisineTypeIds: cuisineIds,
        adminIds: adminIds,
        enabled: restaurant.enabled !== undefined ? restaurant.enabled : true, // Initialize from restaurant data
      });

      // Set image previews
      setRestaurantImagePreview(restaurant.restaurantImageUrl || null);
      setBannerImagePreview(restaurant.bannerImageUrl || null);

      // Set map center
      if (restaurant.latitude && restaurant.longitude) {
        setMapCenter({
          lat: restaurant.latitude,
          lng: restaurant.longitude,
        });
      }

      // Set opening hours
      if (restaurant.openingHours && restaurant.openingHours.length > 0) {
        // Make sure we have all 7 days
        let fullOpeningHours = [...openingHoursData];

        restaurant.openingHours.forEach((hour) => {
          const index = fullOpeningHours.findIndex(
            (h) => h.dayOfWeek === hour.dayOfWeek
          );
          if (index >= 0) {
            fullOpeningHours[index] = {
              dayOfWeek: hour.dayOfWeek,
              openTime: hour.openTime || "09:00",
              closeTime: hour.closeTime || "17:00",
              closed: hour.closed || false,
            };
          }
        });

        setOpeningHoursData(fullOpeningHours);
      }
    } catch (error) {
      console.error("Error initializing restaurant data:", error);
      toast.error("Error loading restaurant information");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch cuisine types from API
  const fetchCuisineTypes = async () => {
    try {
      const response = await cuisineTypeService.getAllCuisineTypes(token);
      if (response.ok) {
        const data = await response.json();

        // Filter only active cuisines
        const activeCuisines = data.filter(
          (cuisine) => cuisine.active === true
        );

        // Transform data for react-select
        const cuisineOptions = activeCuisines.map((cuisine) => ({
          value: cuisine.id,
          label: cuisine.name,
          icon: cuisine.iconUrl,
        }));

        setCuisineTypes(cuisineOptions);
      } else {
        toast.error("Failed to load cuisine types");
      }
    } catch (error) {
      console.error("Error fetching cuisine types:", error);
      toast.error("Error loading cuisine types");
    }
  };
  // Fetch admin users from API - modified to use restaurant.adminIds directly
  const fetchAdminUsers = async () => {
    try {
      // Get all restaurant admin users
      const adminResponse = await authService.getRestaurantAdmins(token);
      if (!adminResponse.ok) {
        toast.error("Failed to load admin users");
        return;
      }

      const adminData = await adminResponse.json();

      // Transform data for react-select - include ALL admin users
      const adminOptions = adminData
        .filter(
          (user) =>
            user.enabled === true && !user.disabled && user.verified === true
        )
        .map((user) => ({
          value: user.id,
          label: user.username || `${user.firstName} ${user.lastName}`,
          image: user.profilePictureUrl,
          email: user.email,
          phone: user.phoneNumber,
        }));

      setAdminUsers(adminOptions);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      toast.error("Error loading admin users");
    }
  };
  // Basic input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle restaurant image selection
  const handleRestaurantImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setRestaurantImageError("File size should be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setRestaurantImageError("Please select an image file");
        return;
      }
      setRestaurantImage(file);
      setRestaurantImageError(null);

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setRestaurantImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle banner image selection
  const handleBannerImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setBannerImageError("File size should be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setBannerImageError("Please select an image file");
        return;
      }
      setBannerImage(file);
      setBannerImageError(null);

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setBannerImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload restaurant image when selected
  useEffect(() => {
    if (restaurantImage) {
      uploadRestaurantImage();
    }
  }, [restaurantImage]);

  // Upload banner image when selected
  useEffect(() => {
    if (bannerImage) {
      uploadBannerImage();
    }
  }, [bannerImage]);

  // Handle restaurant image upload
  const uploadRestaurantImage = async () => {
    setRestaurantImageUploading(true);
    const storage = getStorage(app);
    const fileName = new Date().getTime() + restaurantImage.name;
    const storageRef = ref(storage, `restaurantImages/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, restaurantImage);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setRestaurantImageProgress(Math.round(progress));
      },
      (error) => {
        setRestaurantImageError("Error uploading image: " + error.message);
        setRestaurantImageUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData({
            ...formData,
            restaurantImageUrl: downloadURL,
          });
          setRestaurantImageUploading(false);
          toast.success("Restaurant image uploaded successfully");
        });
      }
    );
  };

  // Handle banner image upload
  const uploadBannerImage = async () => {
    setBannerImageUploading(true);
    const storage = getStorage(app);
    const fileName = new Date().getTime() + bannerImage.name;
    const storageRef = ref(storage, `restaurantBanners/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, bannerImage);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setBannerImageProgress(Math.round(progress));
      },
      (error) => {
        setBannerImageError("Error uploading banner: " + error.message);
        setBannerImageUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData({
            ...formData,
            bannerImageUrl: downloadURL,
          });
          setBannerImageUploading(false);
          toast.success("Banner image uploaded successfully");
        });
      }
    );
  };

  // Handle opening hours changes
  const handleOpeningHourChange = (index, field, value) => {
    const updatedHours = [...openingHoursData];
    updatedHours[index] = {
      ...updatedHours[index],
      [field]: field === "closed" ? !updatedHours[index].closed : value,
    };
    setOpeningHoursData(updatedHours);
  };

  // Handle cuisine selection
  const handleCuisineChange = (selectedOptions) => {
    const cuisineIds = selectedOptions
      ? selectedOptions.map((option) => option.value)
      : [];
    setFormData({
      ...formData,
      cuisineTypeIds: cuisineIds,
    });
  };

  // Handle admin selection
  const handleAdminChange = (selectedOptions) => {
    const adminIds = selectedOptions
      ? selectedOptions.map((option) => option.value)
      : [];
    setFormData({
      ...formData,
      adminIds: adminIds,
    });
  };

  // Handle location selection from Google Places
  const handleLocationSelect = (place) => {
    setLocationValue(place);

    if (place?.value?.place_id) {
      // Wait for the Google Maps API to be properly loaded
      const handleGeocode = () => {
        if (window.google && window.google.maps) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode(
            { placeId: place.value.place_id },
            (results, status) => {
              if (status === "OK" && results[0]) {
                const lat = results[0].geometry.location.lat();
                const lng = results[0].geometry.location.lng();

                setMapCenter({ lat, lng });
                setFormData({
                  ...formData,
                  latitude: lat,
                  longitude: lng,
                  address: place.label,
                  formattedAddress: place.label,
                });
              }
            }
          );
        } else {
          // If Google Maps API isn't loaded yet, retry after a short delay
          setTimeout(handleGeocode, 200);
        }
      };

      handleGeocode();
    }
  };
  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.name) {
      newErrors.name = "Restaurant name is required";
      isValid = false;
    }

    if (!formData.address) {
      newErrors.address = "Address is required";
      isValid = false;
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
      isValid = false;
    } else if (
      !/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(formData.phoneNumber)
    ) {
      newErrors.phoneNumber = "Invalid phone number format";
      isValid = false;
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email address is invalid";
      isValid = false;
    }

    if (!formData.latitude || !formData.longitude) {
      newErrors.location = "Location is required";
      isValid = false;
    }

    if (formData.cuisineTypeIds.length === 0) {
      newErrors.cuisines = "At least one cuisine type must be selected";
      isValid = false;
    }

    if (formData.adminIds.length === 0) {
      newErrors.admins = "At least one admin must be selected";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the final data with opening hours
      const finalData = {
        ...formData,
        openingHours: openingHoursData,
      };

      const response = await restaurantService.updateRestaurant(
        restaurant.id,
        finalData,
        token
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update restaurant");
      }

      setSuccess(true);
      // Reset form after success
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 200);
    } catch (error) {
      toast.error(
        error.message || "An error occurred while updating the restaurant"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Selected cuisines for the select component
  const selectedCuisines = cuisineTypes.filter((cuisine) =>
    formData.cuisineTypeIds.includes(cuisine.value)
  );

  // Selected admins for the select component
  const selectedAdmins = adminUsers.filter((admin) =>
    formData.adminIds.includes(admin.value)
  );

  const CustomCuisineOption = ({ innerProps, isDisabled, label, data }) => {
    return !isDisabled ? (
      <div
        {...innerProps}
        className="flex items-center p-2 cursor-pointer hover:bg-gray-100"
      >
        {data.icon && (
          <img
            src={data.icon}
            alt={label}
            className="w-8 h-8 rounded-full mr-2 object-cover"
          />
        )}
        <span>{label}</span>
      </div>
    ) : null;
  };

  const CustomAdminOption = ({ innerProps, isDisabled, label, data }) => {
    return !isDisabled ? (
      <div
        {...innerProps}
        className="flex items-center p-2 cursor-pointer hover:bg-gray-100"
      >
        {data.image ? (
          <img
            src={data.image}
            alt={label}
            className="w-8 h-8 rounded-full mr-2 object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
            <BsPersonBadge className="text-gray-500" />
          </div>
        )}
        <span>{label}</span>
      </div>
    ) : null;
  };

  return (
    <Modal show={show} onClose={onClose} size="6xl" popup={false}>
      <Modal.Header className="border-b border-gray-200 bg-gray-50">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-full mr-3">
            <FaStore className="text-blue-600" size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Update Restaurant</h3>
        </div>
      </Modal.Header>

      <Modal.Body className="px-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Spinner size="xl" />
          </div>
        ) : (
          <>
            {success && (
              <Alert color="success" className="mb-4">
                Restaurant updated successfully!
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center justify-between p-4 mb-4 bg-gray-50 border rounded-lg">
                <div className="flex items-center">
                  <div
                    className={`p-2 ${
                      formData.enabled ? "bg-green-100" : "bg-red-100"
                    } rounded-full mr-3`}
                  >
                    {formData.enabled ? (
                      <HiCheck className="text-green-600" size={18} />
                    ) : (
                      <HiX className="text-red-600" size={18} />
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-medium">
                      {formData.enabled
                        ? "Restaurant Active"
                        : "Restaurant Inactive"}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {formData.enabled
                        ? "This restaurant is visible to customers and can accept orders."
                        : "This restaurant is hidden from customers and cannot accept orders."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Label
                    htmlFor="restaurant-enabled"
                    value={formData.enabled ? "Enabled" : "Disabled"}
                    className="mr-3 font-medium"
                  />
                  <ToggleSwitch
                    id="restaurant-enabled"
                    checked={formData.enabled}
                    onChange={handleEnabledChange}
                    label=""
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column */}
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 block">
                      <Label
                        htmlFor="name"
                        value="Restaurant Name *"
                        className="font-medium"
                      />
                    </div>
                    <TextInput
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter restaurant name"
                      required
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <div className="mb-2 block">
                      <Label
                        htmlFor="description"
                        value="Description"
                        className="font-medium"
                      />
                    </div>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Enter restaurant description"
                      rows={3}
                    />
                  </div>

                  <div>
                    <div className="mb-2 block">
                      <Label
                        htmlFor="phoneNumber"
                        value="Phone Number *"
                        className="font-medium"
                      />
                    </div>
                    <TextInput
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="e.g. +94 77 123 4567"
                      icon={HiPhone}
                      required
                    />
                    {errors.phoneNumber && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="mb-2 block">
                      <Label
                        htmlFor="email"
                        value="Email"
                        className="font-medium"
                      />
                    </div>
                    <TextInput
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="restaurant@example.com"
                      icon={HiMail}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="mb-2 block">
                      <Label
                        htmlFor="location"
                        value="Restaurant Location *"
                        className="font-medium"
                      />
                    </div>
                    <LoadScript
                      googleMapsApiKey="AIzaSyCms2-r4afPJIKiStBZUNuRx_4BdU2p9ps"
                      libraries={["places"]}
                      onLoad={() =>
                        console.log("Google Maps API loaded successfully")
                      }
                      onError={(error) =>
                        console.error("Google Maps API loading failed:", error)
                      }
                    >
                      <GooglePlacesAutocomplete
                        apiKey="AIzaSyCms2-r4afPJIKiStBZUNuRx_4BdU2p9ps"
                        selectProps={{
                          value: locationValue,
                          onChange: handleLocationSelect,
                          placeholder:
                            formData.address || "Search for an address...",
                          styles: {
                            control: (provided) => ({
                              ...provided,
                              padding: "4px",
                              borderColor: "#D1D5DB",
                              boxShadow: "none",
                            }),
                          },
                        }}
                      />

                      {formData.latitude !== 0 && formData.longitude !== 0 && (
                        <div className="mt-2">
                          <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            zoom={15}
                            center={mapCenter}
                          >
                            <Marker position={mapCenter} />
                          </GoogleMap>
                        </div>
                      )}
                    </LoadScript>

                    {errors.location && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.location}
                      </p>
                    )}
                  </div>
                </div>
                {/* Right column */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Restaurant image */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="restaurantImage"
                        value="Restaurant Image"
                        className="font-medium"
                      />
                      <div className="flex flex-col items-center">
                        <div className="relative w-32 h-32 mb-2">
                          {restaurantImageUploading && (
                            <CircularProgressbar
                              value={restaurantImageProgress || 0}
                              text={`${restaurantImageProgress}%`}
                              strokeWidth={5}
                              styles={{
                                root: {
                                  width: "100%",
                                  height: "100%",
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                },
                                path: {
                                  stroke: `rgba(59, 130, 246, ${
                                    restaurantImageProgress / 100
                                  })`,
                                },
                                text: {
                                  fill: "#3b82f6",
                                  fontSize: "20px",
                                  fontWeight: "bold",
                                },
                              }}
                            />
                          )}
                          <img
                            src={
                              restaurantImagePreview ||
                              "https://via.placeholder.com/128?text=Restaurant"
                            }
                            alt="Restaurant"
                            className={`rounded-lg w-full h-full object-cover border-2 border-gray-200 ${
                              restaurantImageUploading && "opacity-60"
                            }`}
                          />
                        </div>
                        <input
                          type="file"
                          id="restaurantImage"
                          accept="image/*"
                          onChange={handleRestaurantImageChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="restaurantImage"
                          className="flex items-center justify-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 w-full text-sm"
                        >
                          <HiPhotograph className="mr-1" size={16} />
                          Change Image
                        </label>
                        {restaurantImageError && (
                          <p className="text-red-500 text-xs mt-1">
                            {restaurantImageError}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Banner image */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="bannerImage"
                        value="Banner Image"
                        className="font-medium"
                      />
                      <div className="flex flex-col items-center">
                        <div className="relative w-full h-32 mb-2">
                          {bannerImageUploading && (
                            <CircularProgressbar
                              value={bannerImageProgress || 0}
                              text={`${bannerImageProgress}%`}
                              strokeWidth={5}
                              styles={{
                                root: {
                                  width: "40%",
                                  height: "40%",
                                  position: "absolute",
                                  top: "30%",
                                  left: "30%",
                                },
                                path: {
                                  stroke: `rgba(59, 130, 246, ${
                                    bannerImageProgress / 100
                                  })`,
                                },
                                text: {
                                  fill: "#3b82f6",
                                  fontSize: "20px",
                                  fontWeight: "bold",
                                },
                              }}
                            />
                          )}
                          <img
                            src={
                              bannerImagePreview ||
                              "https://via.placeholder.com/800x200?text=Banner+Image"
                            }
                            alt="Banner"
                            className={`rounded-lg w-full h-full object-cover border-2 border-gray-200 ${
                              bannerImageUploading && "opacity-60"
                            }`}
                          />
                        </div>
                        <input
                          type="file"
                          id="bannerImage"
                          accept="image/*"
                          onChange={handleBannerImageChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="bannerImage"
                          className="flex items-center justify-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 w-full text-sm"
                        >
                          <HiPhotograph className="mr-1" size={16} />
                          Change Banner
                        </label>
                        {bannerImageError && (
                          <p className="text-red-500 text-xs mt-1">
                            {bannerImageError}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 block">
                      <Label
                        value="Select Cuisine Types *"
                        className="font-medium"
                      />
                    </div>
                    <Select
                      isMulti
                      name="cuisineTypes"
                      options={cuisineTypes}
                      className="basic-multi-select"
                      classNamePrefix="select"
                      placeholder="Select cuisine types..."
                      onChange={handleCuisineChange}
                      value={selectedCuisines}
                      components={{
                        Option: CustomCuisineOption,
                      }}
                    />
                    {errors.cuisines && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.cuisines}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="mb-2 block">
                      <Label
                        value="Select Restaurant Admins *"
                        className="font-medium"
                      />
                    </div>
                    <Select
                      isMulti
                      name="admins"
                      options={adminUsers}
                      className="basic-multi-select"
                      classNamePrefix="select"
                      placeholder="Select restaurant admins..."
                      onChange={handleAdminChange}
                      value={selectedAdmins}
                      components={{
                        Option: CustomAdminOption,
                      }}
                    />
                    {errors.admins && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.admins}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="mb-2 block">
                      <Label value="Opening Hours" className="font-medium" />
                    </div>
                    <Card className="max-h-[300px] overflow-y-auto">
                      <div className="space-y-3">
                        {openingHoursData.map((day, index) => (
                          <div
                            key={day.dayOfWeek}
                            className="grid grid-cols-12 gap-2 items-center"
                          >
                            <div className="col-span-3">
                              <span className="text-sm font-medium">
                                {
                                  daysOfWeek.find(
                                    (d) => d.value === day.dayOfWeek
                                  )?.label
                                }
                              </span>
                            </div>

                            <div className="col-span-3 flex items-center">
                              <Label
                                htmlFor={`closed-${day.dayOfWeek}`}
                                value="Closed"
                                className="mr-2 text-sm"
                              />
                              <ToggleSwitch
                                id={`closed-${day.dayOfWeek}`}
                                checked={day.closed}
                                onChange={() =>
                                  handleOpeningHourChange(
                                    index,
                                    "closed",
                                    !day.closed
                                  )
                                }
                                size="sm"
                              />
                            </div>

                            {!day.closed && (
                              <>
                                <div className="col-span-3 flex flex-col items-start">
                                  <Label
                                    value="Open"
                                    size="sm"
                                    className="text-xs"
                                  />
                                  <input
                                    type="time"
                                    value={day.openTime}
                                    onChange={(e) =>
                                      handleOpeningHourChange(
                                        index,
                                        "openTime",
                                        e.target.value
                                      )
                                    }
                                    className="border border-gray-300 rounded-lg px-2 py-1 text-sm w-full"
                                    disabled={day.closed}
                                  />
                                </div>

                                <div className="col-span-3 flex flex-col items-start">
                                  <Label
                                    value="Close"
                                    size="sm"
                                    className="text-xs"
                                  />
                                  <input
                                    type="time"
                                    value={day.closeTime}
                                    onChange={(e) =>
                                      handleOpeningHourChange(
                                        index,
                                        "closeTime",
                                        e.target.value
                                      )
                                    }
                                    className="border border-gray-300 rounded-lg px-2 py-1 text-sm w-full"
                                    disabled={day.closed}
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </form>
          </>
        )}
      </Modal.Body>

      <Modal.Footer className="border-t border-gray-200 bg-gray-50 flex justify-between">
        <Button color="gray" onClick={onClose}>
          Cancel
        </Button>
        <Button
          gradientDuoTone="purpleToBlue"
          disabled={
            isSubmitting ||
            restaurantImageUploading ||
            bannerImageUploading ||
            isLoading
          }
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Updating Restaurant...
            </>
          ) : (
            <>
              <HiPencilAlt className="mr-2 h-5 w-5" />
              Update Restaurant
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
