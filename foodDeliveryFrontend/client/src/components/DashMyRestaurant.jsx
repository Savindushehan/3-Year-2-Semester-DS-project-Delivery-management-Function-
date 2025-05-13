import React, { useState, useEffect, Suspense } from "react";
import { useSelector } from "react-redux";
import {
  Button,
  Card,
  Label,
  TextInput,
  Textarea,
  Spinner,
  Alert,
  Tabs,
  ToggleSwitch,
  Avatar,
} from "flowbite-react";
import {
  HiOutlinePencilAlt,
  HiOutlinePhotograph,
  HiOutlineClock,
  HiOutlineLocationMarker,
  HiOutlineCheck,
  HiExclamation,
  HiInformationCircle,
  HiPhone,
  HiMail,
  HiSave,
  HiUserGroup,
} from "react-icons/hi";
import { FaStore, FaUtensils } from "react-icons/fa";
import { LoadScript, GoogleMap, Marker } from "@react-google-maps/api";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import Select from "react-select";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { restaurantService } from "../service/restaurantService";
import { cuisineTypeService } from "../service/cuisineService";
import OpeningHoursEditor from "./sub-components/restaurant-management/OpeningHoursEditor";
import LocationTab from "./sub-components/restaurant-management/LocationTab";
import { BsPersonBadge } from "react-icons/bs";
import { authService } from "../service/authService";
import { HiDocumentReport, HiDownload } from "react-icons/hi";

export default function DashMyRestaurant() {
  // State definitions remain the same
  const { currentUser } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [restaurant, setRestaurant] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Add new state for restaurant admins
  const [restaurantAdmins, setRestaurantAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    phoneNumber: "",
    email: "",
    restaurantImageUrl: "",
    bannerImageUrl: "",
    latitude: 0,
    longitude: 0,
    formattedAddress: "",
    enabled: true,
    cuisineTypeIds: [],
  });
  const [openingHours, setOpeningHours] = useState([]);
  const [cuisineOptions, setCuisineOptions] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [activeTab, setActiveTab] = useState("general");
  const [locationValue, setLocationValue] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Image upload states for restaurant logo
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

  // Map configuration
  const mapContainerStyle = {
    width: "100%",
    height: "400px",
    borderRadius: "0.5rem",
  };

  const defaultCenter = { lat: 6.9271, lng: 79.8612 }; // Colombo default
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  // The useEffect hooks and function definitions remain the same
  // ...

  // Keep all the existing functions and handlers - I'm not changing their functionality
  // Only focusing on the UI improvements in the return statement

  useEffect(() => {
    if (currentUser?.token) {
      fetchMyRestaurant();
      fetchCuisineTypes();
    }
  }, [currentUser]);

  useEffect(() => {
    if (restaurant?.adminIds?.length > 0) {
      fetchRestaurantAdmins(restaurant.adminIds);
    }
  }, [restaurant]);

  const handleLocationUpdate = (locationData) => {
    setFormData((prev) => ({
      ...prev,
      ...locationData,
    }));

    if (locationData.latitude && locationData.longitude) {
      setMapCenter({
        lat: locationData.latitude,
        lng: locationData.longitude,
      });
    }
  };

  const fetchMyRestaurant = async () => {
    try {
      setLoading(true);
      const response = await restaurantService.getRestaurantsByUserId(
        currentUser.id,
        currentUser.token
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const myRestaurant = data[0];
          setRestaurant(myRestaurant);
          setFormData({
            name: myRestaurant.name || "",
            description: myRestaurant.description || "",
            address: myRestaurant.address || "",
            phoneNumber: myRestaurant.phoneNumber || "",
            email: myRestaurant.email || "",
            restaurantImageUrl: myRestaurant.restaurantImageUrl || "",
            bannerImageUrl: myRestaurant.bannerImageUrl || "",
            latitude: myRestaurant.latitude || defaultCenter.lat,
            longitude: myRestaurant.longitude || defaultCenter.lng,
            formattedAddress: myRestaurant.formattedAddress || "",
            enabled: myRestaurant.enabled ?? false,
            cuisineTypeIds: myRestaurant.cuisineTypeIds || [],
          });
          setRestaurantImagePreview(myRestaurant.restaurantImageUrl || null);
          setBannerImagePreview(myRestaurant.bannerImageUrl || null);
          if (myRestaurant.latitude && myRestaurant.longitude) {
            setMapCenter({
              lat: myRestaurant.latitude,
              lng: myRestaurant.longitude,
            });
          }
          setOpeningHours(myRestaurant.openingHours || []);
        } else {
          toast.info(
            "You don't have any restaurants assigned to you. Please contact the system administrator."
          );
        }
      } else {
        toast.error("Failed to fetch restaurant details");
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchCuisineTypes = async () => {
    try {
      const response = await cuisineTypeService.getAllCuisineTypes(
        currentUser.token
      );
      if (response.ok) {
        const cuisines = await response.json();
        const activeCuisines = cuisines.filter(
          (cuisine) => cuisine.active === true
        );
        const options = activeCuisines.map((cuisine) => ({
          value: cuisine.id,
          label: cuisine.name,
          icon: cuisine.iconUrl,
        }));
        setCuisineOptions(options);
      }
    } catch (error) {
      console.error("Error fetching cuisine types:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  const handleCuisineChange = (selectedOptions) => {
    const cuisineIds = selectedOptions
      ? selectedOptions.map((option) => option.value)
      : [];
    setFormData({
      ...formData,
      cuisineTypeIds: cuisineIds,
    });
  };

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
      const reader = new FileReader();
      reader.onload = () => {
        setRestaurantImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

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
      const reader = new FileReader();
      reader.onload = () => {
        setBannerImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (restaurantImage) {
      uploadRestaurantImage();
    }
  }, [restaurantImage]);

  useEffect(() => {
    if (bannerImage) {
      uploadBannerImage();
    }
  }, [bannerImage]);

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
          setFormData((prev) => ({
            ...prev,
            restaurantImageUrl: downloadURL,
          }));
          setRestaurantImageUploading(false);
          toast.success("Restaurant image uploaded successfully");
        });
      }
    );
  };

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
          setFormData((prev) => ({
            ...prev,
            bannerImageUrl: downloadURL,
          }));
          setBannerImageUploading(false);
          toast.success("Banner image uploaded successfully");
        });
      }
    );
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Restaurant name is required";
    }

    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
    } else if (
      !/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(formData.phoneNumber)
    ) {
      errors.phoneNumber = "Invalid phone number format";
    }

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = "Valid email is required";
    }

    if (!formData.address.trim()) {
      errors.address = "Address is required";
    }

    if (formData.cuisineTypeIds.length === 0) {
      errors.cuisineTypeIds = "At least one cuisine type must be selected";
    }

    if (!formData.latitude || !formData.longitude) {
      errors.location = "Location coordinates are required";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please correct the form errors");
      return;
    }

    try {
      setSubmitting(true);
      const updateData = {
        ...formData,
        openingHours: openingHours,
        id: restaurant.id,
      };

      const response = await restaurantService.updateRestaurant(
        restaurant.id,
        updateData,
        currentUser.token
      );

      if (response.ok) {
        toast.success("Restaurant details updated successfully");
        fetchMyRestaurant();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to update restaurant details");
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="p-4">
        <Alert color="info" icon={HiInformationCircle}>
          <span className="font-medium">No restaurant found!</span> You don't
          have any restaurants assigned to your account. Please contact the
          system administrator.
        </Alert>
      </div>
    );
  }

  const selectedCuisines = formData.cuisineTypeIds
    ?.map((id) => cuisineOptions.find((option) => option.value === id))
    .filter(Boolean);

  const LocationFallback = () => (
    <div className="flex justify-center items-center p-8">
      <Spinner size="xl" />
      <p className="ml-2">Loading map components...</p>
    </div>
  );

  const fetchRestaurantAdmins = async (adminIds) => {
    if (!adminIds || !adminIds.length || !currentUser?.token) return;

    setLoadingAdmins(true);
    try {
      const response = await authService.getRestaurantAdmins(currentUser.token);
      if (response.ok) {
        const allAdmins = await response.json();

        // Convert adminIds to strings for consistent comparison
        const adminIdStrings = adminIds.map((id) => String(id));

        // Filter only admins associated with this restaurant
        const filteredAdmins = allAdmins.filter((admin) =>
          adminIdStrings.includes(String(admin.id))
        );

        setRestaurantAdmins(filteredAdmins);
      }
    } catch (error) {
      console.error("Error fetching restaurant admins:", error);
      toast.error("Failed to load restaurant administrators");
    } finally {
      setLoadingAdmins(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!restaurant?.id) {
      toast.warning("Restaurant information not available");
      return;
    }

    setIsDownloading(true);
    try {
      const response = await restaurantService.generateRestaurantReport(
        restaurant.id,
        currentUser.token
      );

      if (response.ok) {
        // Convert response to blob
        const blob = await response.blob();

        // Create download link and trigger download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `restaurant-report-${formData.name}-${
          new Date().toISOString().split("T")[0]
        }.pdf`;
        document.body.appendChild(a);
        a.click();

        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success("Restaurant report downloaded successfully");
      } else {
        throw new Error(`Failed to download report: ${response.status}`);
      }
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("Failed to download restaurant report");
    } finally {
      setIsDownloading(false);
    }
  };
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header with title and save button */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white rounded-lg p-5 shadow-sm">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <FaStore className="mr-3 text-blue-600 text-3xl" />
            My Restaurant
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your restaurant details and settings
          </p>
        </div>
        <div className="flex gap-3">
          {/* Add Report Download Button */}
          <Button
            gradientDuoTone="purpleToBlue"
            size="lg"
            onClick={handleDownloadReport}
            disabled={isDownloading || !restaurant}
            className="px-6"
          >
            {isDownloading ? (
              <Spinner size="sm" className="mr-2" />
            ) : (
              <HiDocumentReport className="mr-2 text-lg" />
            )}
            {isDownloading ? "Generating..." : "Download Report"}
          </Button>
          <Button
            gradientDuoTone="greenToBlue"
            size="lg"
            onClick={handleSubmit}
            disabled={
              submitting || restaurantImageUploading || bannerImageUploading
            }
            className="px-6"
          >
            {submitting ? (
              <Spinner size="sm" className="mr-2" />
            ) : (
              <HiSave className="mr-2 text-lg" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Banner section with improved styling */}
      <div className="mb-8 relative bg-white rounded-xl overflow-hidden shadow-md">
        {bannerImageUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-10">
            <div className="w-28 h-28">
              <CircularProgressbar
                value={bannerImageProgress}
                text={`${bannerImageProgress}%`}
                styles={{
                  path: {
                    stroke: `rgba(59, 130, 246, ${bannerImageProgress / 100})`,
                    strokeLinecap: "round",
                  },
                  trail: {
                    stroke: "rgba(255, 255, 255, 0.3)",
                  },
                  text: {
                    fill: "#ffffff",
                    fontSize: "18px",
                    fontWeight: "bold",
                  },
                }}
              />
            </div>
          </div>
        )}

        {bannerImagePreview ? (
          <div className="h-72 overflow-hidden">
            <img
              src={bannerImagePreview}
              alt={formData.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-72 bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
            <div className="text-center">
              <FaStore className="text-blue-300 text-6xl mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No banner image</p>
              <p className="text-gray-400 text-sm">
                Upload an image to showcase your restaurant
              </p>
            </div>
          </div>
        )}

        <div className="absolute right-5 bottom-5">
          <input
            type="file"
            id="bannerImage"
            accept="image/*"
            onChange={handleBannerImageChange}
            className="hidden"
          />
          <label
            htmlFor="bannerImage"
            className="flex items-center justify-center px-5 py-3 bg-white bg-opacity-90 rounded-lg shadow-lg cursor-pointer hover:bg-opacity-100 transition-all transform hover:scale-105"
          >
            <HiOutlinePhotograph className="mr-2 text-blue-600 text-xl" />
            Change Banner
          </label>
          {bannerImageError && (
            <p className="mt-3 text-sm text-red-600 bg-white bg-opacity-90 p-2 rounded-md shadow">
              {bannerImageError}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Sidebar with restaurant image and status - now with better styling */}
        <div className="xl:col-span-1 space-y-6">
          <Card className="overflow-visible shadow-md">
            <div className="flex flex-col items-center">
              <div className="relative w-40 h-40 rounded-full overflow-hidden mb-6 border-4 border-white shadow-lg -mt-12 bg-white">
                {restaurantImageUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-10 rounded-full">
                    <CircularProgressbar
                      value={restaurantImageProgress}
                      text={`${restaurantImageProgress}%`}
                      styles={{
                        path: {
                          stroke: `rgba(59, 130, 246, ${
                            restaurantImageProgress / 100
                          })`,
                          strokeLinecap: "round",
                        },
                        trail: {
                          stroke: "rgba(255, 255, 255, 0.3)",
                        },
                        text: {
                          fill: "#ffffff",
                          fontSize: "16px",
                          fontWeight: "bold",
                        },
                      }}
                    />
                  </div>
                )}

                {restaurantImagePreview ? (
                  <img
                    src={restaurantImagePreview}
                    alt={formData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <FaStore className="text-gray-400 text-5xl" />
                  </div>
                )}
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
                className="flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 transition-all transform hover:scale-105 mb-4"
              >
                <HiOutlinePhotograph className="mr-2" />
                Change Logo
              </label>

              {restaurantImageError && (
                <p className="text-sm text-red-600 mb-4 bg-red-50 p-2 rounded-md">
                  {restaurantImageError}
                </p>
              )}

              <h3 className="text-xl font-bold text-center">{formData.name}</h3>

              <div className="w-full border-t border-gray-100 my-4"></div>

              <div className="mt-2 mb-3 w-full flex justify-between items-center px-3">
                <Label htmlFor="enabled" className="font-medium text-gray-700">
                  Restaurant Status
                </Label>
                <ToggleSwitch
                  id="enabled"
                  checked={formData.enabled}
                  onChange={() =>
                    setFormData((prev) => ({ ...prev, enabled: !prev.enabled }))
                  }
                />
              </div>
              <div
                className={`w-full text-center py-2 px-3 rounded-lg ${
                  formData.enabled
                    ? "bg-green-50 text-green-600"
                    : "bg-red-50 text-red-600"
                }`}
              >
                <p className="font-medium flex items-center justify-center">
                  {formData.enabled ? (
                    <>
                      <HiOutlineCheck className="mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <HiExclamation className="mr-1" />
                      Inactive
                    </>
                  )}
                </p>
              </div>
            </div>
          </Card>

          {/* Restaurant admins card - new addition */}
          <Card className="shadow-md overflow-hidden">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <BsPersonBadge className="mr-3 text-blue-600" />
              Restaurant Admins
            </h3>

            {loadingAdmins ? (
              <div className="flex justify-center py-6">
                <Spinner size="md" />
              </div>
            ) : restaurantAdmins.length > 0 ? (
              <div className="space-y-3">
                {restaurantAdmins.map((admin) => (
                  <div
                    key={admin.id}
                    className="flex items-center p-3 bg-gray-50 rounded-lg transition-all hover:bg-gray-100"
                  >
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
              <div className="text-center py-6 px-4 bg-gray-50 rounded-lg">
                <HiUserGroup className="mx-auto text-gray-300 text-3xl mb-2" />
                <p className="text-gray-500">
                  No administrators assigned to this restaurant.
                </p>
              </div>
            )}
          </Card>

          {/** Cuisine Card */}
          <Card className="shadow-md">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <FaUtensils className="mr-3 text-blue-600" />
              Cuisine Types
            </h3>
            <div className="mb-4">
              <Label
                htmlFor="cuisines"
                value="Selected Cuisines"
                className="mb-2 block"
              />
              <Select
                id="cuisines"
                isMulti
                options={cuisineOptions}
                value={selectedCuisines}
                onChange={handleCuisineChange}
                placeholder="Select cuisines..."
                className="basic-multi-select"
                classNamePrefix="select"
                formatOptionLabel={(cuisine) => (
                  <div className="flex items-center">
                    {cuisine.icon && (
                      <img
                        src={cuisine.icon}
                        alt={cuisine.label}
                        className="w-6 h-6 mr-2 rounded-full object-cover"
                      />
                    )}
                    {cuisine.label}
                  </div>
                )}
              />
              {formErrors.cuisineTypeIds && (
                <p className="text-sm text-red-500 mt-2 bg-red-50 p-2 rounded-md">
                  {formErrors.cuisineTypeIds}
                </p>
              )}
            </div>

            {selectedCuisines?.length > 0 ? (
              <>
                <Label
                  value="Current Cuisines"
                  className="mb-2 block text-sm font-medium"
                />
                <div className="flex flex-wrap gap-2 mt-2 bg-gray-50 p-3 rounded-lg">
                  {selectedCuisines.map((cuisine) => (
                    <span
                      key={cuisine.value}
                      className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center"
                    >
                      {cuisine.icon && (
                        <img
                          src={cuisine.icon}
                          alt={cuisine.label}
                          className="w-4 h-4 mr-1 rounded-full"
                        />
                      )}
                      {cuisine.label}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center bg-gray-50 py-4 px-2 rounded-lg">
                <p className="text-sm text-gray-500">
                  No cuisine types selected
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Select at least one cuisine type for your restaurant
                </p>
              </div>
            )}
          </Card>

          <Card className="shadow-md">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <HiDocumentReport className="mr-3 text-blue-600" />
              Analytics & Reports
            </h3>

            <div className="space-y-4">
              {/* Restaurant Performance Report */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-blue-100 dark:border-gray-600">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-white">
                      Restaurant Report
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                      Download a comprehensive report of your restaurant
                      performance, orders, and customer feedback.
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded-full p-2 shadow">
                    <HiDocumentReport className="text-blue-500 dark:text-blue-400 text-xl" />
                  </div>
                </div>

                <Button
                  color="light"
                  size="sm"
                  className="w-full mt-4 bg-white dark:bg-gray-700 border border-blue-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors duration-200"
                  onClick={handleDownloadReport}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <HiDownload className="mr-2" />
                      Download Report
                    </>
                  )}
                </Button>
              </div>

              <div className="text-center text-sm text-gray-500 mt-2">
                <p>
                  Reports are generated based on your restaurant's current data
                  and performance metrics.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main content area with tabs - enhanced styling */}
        <div className="xl:col-span-3">
          <Card className="shadow-md">
            {/* General Information Tab */}
            <Tabs.Item
              title="General Information"
              icon={HiInformationCircle}
              active={activeTab === "general"}
            >
              <form className="space-y-6 p-2">
                <div>
                  <Label
                    htmlFor="name"
                    value="Restaurant Name *"
                    className="mb-2 block text-gray-700"
                  />
                  <TextInput
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter restaurant name"
                    required
                    sizing="lg"
                    color={formErrors.name ? "failure" : undefined}
                    className="shadow-sm"
                  />
                  {formErrors.name && (
                    <p className="text-sm text-red-500 mt-2 bg-red-50 p-2 rounded-md">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="description"
                    value="Description"
                    className="mb-2 block text-gray-700"
                  />
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter a description of your restaurant"
                    rows={5}
                    className="shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label
                      htmlFor="phoneNumber"
                      value="Phone Number *"
                      className="mb-2 block text-gray-700"
                    />
                    <TextInput
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                      sizing="lg"
                      required
                      color={formErrors.phoneNumber ? "failure" : undefined}
                      icon={HiPhone}
                      className="shadow-sm"
                    />
                    {formErrors.phoneNumber && (
                      <p className="text-sm text-red-500 mt-2 bg-red-50 p-2 rounded-md">
                        {formErrors.phoneNumber}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="email"
                      value="Email"
                      className="mb-2 block text-gray-700"
                    />
                    <TextInput
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                      sizing="lg"
                      color={formErrors.email ? "failure" : undefined}
                      icon={HiMail}
                      className="shadow-sm"
                    />
                    {formErrors.email && (
                      <p className="text-sm text-red-500 mt-2 bg-red-50 p-2 rounded-md">
                        {formErrors.email}
                      </p>
                    )}
                  </div>
                </div>
              </form>
            </Tabs.Item>

            {/* Location Tab */}
            <Tabs.Item
              title="Location"
              icon={HiOutlineLocationMarker}
              active={activeTab === "location"}
            >
              <div className="p-2">
                <Suspense fallback={<LocationFallback />}>
                  <LocationTab
                    formData={formData}
                    formErrors={formErrors}
                    onLocationUpdate={handleLocationUpdate}
                    mapCenter={mapCenter}
                  />
                </Suspense>
              </div>
            </Tabs.Item>

            {/* Opening Hours Tab */}
            <Tabs.Item
              title="Opening Hours"
              icon={HiOutlineClock}
              active={activeTab === "hours"}
            >
              <div className="p-2">
                <OpeningHoursEditor
                  openingHours={openingHours}
                  setOpeningHours={setOpeningHours}
                />
              </div>
            </Tabs.Item>
          </Card>
        </div>
      </div>
    </div>
  );
}
