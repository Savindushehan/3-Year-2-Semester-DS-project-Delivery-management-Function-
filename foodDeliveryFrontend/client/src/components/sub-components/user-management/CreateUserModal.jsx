import React, { useState, useEffect } from "react";
import {
  Button,
  Label,
  TextInput,
  Modal,
  Spinner,
  Checkbox,
  Alert,
} from "flowbite-react";
import {
  HiUser,
  HiMail,
  HiLockClosed,
  HiPhone,
  HiLocationMarker,
} from "react-icons/hi";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { app } from "../../../firebase";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { LoadScript } from "@react-google-maps/api";
import { CircularProgressbar } from "react-circular-progressbar";
import { toast } from "react-toastify";
import "react-circular-progressbar/dist/styles.css";
import { authService } from "../../../service/authService";
import { format } from "date-fns";

export const CreateUserModal = ({ show, onClose, onSuccess, token }) => {
  // Form state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address: "",
    profilePicture: "",
    roles: new Set(),
    identificationNumber: "",
    vehicleNumber: "",
    location: {
      type: "Point",
      coordinates: [0, 0],
    },
  });

  // Google Places state
  const [value, setValue] = useState(null);
  const [location, setLocation] = useState(null);

  // Image upload state
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageFileUploading, setImageFileUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(null);

  // Form submission state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle checkbox changes for roles
  const handleRoleChange = (e) => {
    const { value, checked } = e.target;
    const updatedRoles = new Set(formData.roles);

    if (checked) {
      updatedRoles.add(value);
    } else {
      updatedRoles.delete(value);
    }

    setFormData({ ...formData, roles: updatedRoles });
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setImageUploadError("File size must be less than 2MB");
        return;
      }
      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file));
    }
  };

  // Upload image when file is selected
  useEffect(() => {
    if (imageFile) {
      uploadImage();
    }
  }, [imageFile]);

  // Image upload function
  const uploadImage = async () => {
    setImageFileUploading(true);
    setImageUploadError(null);
    const storage = getStorage(app);
    const fileName = new Date().getTime() + imageFile.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImageUploadProgress(progress.toFixed(0));
      },
      (error) => {
        setImageUploadError(
          "Could not upload image (File must be less than 2MB)"
        );
        setImageUploadProgress(null);
        setImageFile(null);
        setImageFileUrl(null);
        setImageFileUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageFileUrl(downloadURL);
          setFormData({ ...formData, profilePicture: downloadURL });
          setImageFileUploading(false);
        });
      }
    );
  };

  // Reset the form
  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      address: "",
      profilePicture: "",
      roles: new Set(),
      identificationNumber: "",
      vehicleNumber: "",
      location: {
        type: "Point",
        coordinates: [0, 0],
      },
    });
    setImageFile(null);
    setImageFileUrl(null);
    setImageUploadProgress(null);
    setValue(null);
    setLocation(null);
    setError(null);
    setSuccess(false);
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Check if at least one role is selected
      if (formData.roles.size === 0) {
        throw new Error("Please select at least one user role");
      }
      // Check if required fields are filled
      if (
        formData.username === "" ||
        formData.email === "" ||
        formData.password === ""
      ) {
        throw new Error("Please fill in all required fields");
      }

      if (formData.password.length < 8 || formData.password.length > 20) {
        throw new Error("Password must be at least 8 characters long");
      }

      if (formData.roles.has("ROLE_DRIVER") && formData.vehicleNumber === "") {
        throw new Error("Please fill in all required fields for driver role");
      }

      if (
        formData.roles.has("ROLE_DRIVER") &&
        formData.identificationNumber === ""
      ) {
        throw new Error("Please fill in all required fields for driver role");
      }

      if (
        formData.roles.has("ROLE_RESTAURANT_ADMIN") &&
        formData.identificationNumber === ""
      ) {
        throw new Error(
          "Please fill in all required fields for restaurant admin role"
        );
      }

      // Convert roles Set to array
      const payload = {
        ...formData,
        roles: Array.from(formData.roles),
      };

      // Add location data if it was set
      if (location) {
        payload.location = {
          type: "Point",
          coordinates: location.coordinates,
          address: location.address,
        };
      }

      // Send API request
      const response = await authService.createUser(payload, token);
      const data = await response.json();
      if (response.status === 400) {
        throw new Error(data.message || "Bad Request");
      }
      if (response.status === 401) {
        throw new Error(data.message || "Unauthorized");
      }
      if (response.status === 403) {
        throw new Error(data.message || "Forbidden");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create user");
      }

      setSuccess(true);
      toast.success("User created successfully!");

      // Call the onSuccess callback to refresh user list
      if (onSuccess) {
        onSuccess();
      }

      // Close the modal after a short delay
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1500);
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Conditional rendering for driver-specific fields
  const isDriver = formData.roles.has("ROLE_DRIVER");

  return (
    <Modal
      show={show}
      onClose={handleClose}
      size="5xl"
      popup={false}
    >
      <Modal.Header className="border-b border-gray-200 bg-gray-50">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-full mr-3">
            <HiUser className="text-blue-600" size={24} />
          </div>
          <h2 className="text-xl font-bold">Create New User</h2>
        </div>
      </Modal.Header>

      <Modal.Body>
        {error && (
          <Alert color="failure" className="mb-4">
            {error}
          </Alert>
        )}

        {success && (
          <Alert color="success" className="mb-4">
            User created successfully!
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-4">
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-32 h-32">
                  {imageUploadProgress && (
                    <CircularProgressbar
                      value={imageUploadProgress || 0}
                      text={`${imageUploadProgress}%`}
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
                          stroke: `rgba(62,152,199,${
                            imageUploadProgress / 100
                          })`,
                        },
                      }}
                    />
                  )}
                  <img
                    src={
                      imageFileUrl ||
                      "https://via.placeholder.com/128?text=User"
                    }
                    alt="Profile"
                    className={`rounded-full w-full h-full object-cover border-4 border-gray-200 ${
                      imageUploadProgress &&
                      imageUploadProgress < 100 &&
                      "opacity-60"
                    }`}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 block">
                  <Label htmlFor="profileImage" value="Profile Image" />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                    file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                {imageUploadError && (
                  <p className="text-red-500 text-sm mt-1">
                    {imageUploadError}
                  </p>
                )}
              </div>

              <div>
                <div className="mb-2 block">
                  <Label htmlFor="username" value="Username *" />
                </div>
                <TextInput
                  id="username"
                  name="username"
                  type="text"
                  icon={HiUser}
                  placeholder="johnsmith"
                  required
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>

              <div>
                <div className="mb-2 block">
                  <Label htmlFor="email" value="Email *" />
                </div>
                <TextInput
                  id="email"
                  name="email"
                  type="email"
                  icon={HiMail}
                  placeholder="john@example.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <div className="mb-2 block">
                  <Label htmlFor="password" value="Password *" />
                </div>
                <TextInput
                  id="password"
                  name="password"
                  type="password"
                  icon={HiLockClosed}
                  placeholder="********"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="firstName" value="First Name" />
                  </div>
                  <TextInput
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="lastName" value="Last Name" />
                  </div>
                  <TextInput
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Smith"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 block">
                  <Label htmlFor="phoneNumber" value="Phone Number" />
                </div>
                <TextInput
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  icon={HiPhone}
                  placeholder="1234567890"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="address" value="Address" />
                </div>
                <TextInput
                  id="address"
                  name="address"
                  type="text"
                  icon={HiLocationMarker}
                  placeholder="123 Main St, City"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div>
                <div className="mb-2 block">
                  <Label htmlFor="location" value="Location (Google Maps)" />
                </div>
                <LoadScript
                  googleMapsApiKey="AIzaSyCms2-r4afPJIKiStBZUNuRx_4BdU2p9ps"
                  libraries={["places"]}
                >
                  <GooglePlacesAutocomplete
                    apiKey="AIzaSyCms2-r4afPJIKiStBZUNuRx_4BdU2p9ps"
                    selectProps={{
                      value,
                      onChange: async (place) => {
                        setValue(place);

                        if (place?.value?.place_id) {
                          const geocoder = new window.google.maps.Geocoder();
                          geocoder.geocode(
                            { placeId: place.value.place_id },
                            (results, status) => {
                              if (status === "OK" && results[0]) {
                                const lat = results[0].geometry.location.lat();
                                const lng = results[0].geometry.location.lng();

                                setLocation({
                                  type: "Point",
                                  coordinates: [lng, lat], // [longitude, latitude]
                                  address: place.label,
                                });

                                // Update address field too
                                setFormData({
                                  ...formData,
                                  address: place.label,
                                });
                              } else {
                                console.error("Geocode failed:", status);
                              }
                            }
                          );
                        }
                      },
                      placeholder: "Search for an address...",
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
                </LoadScript>
                {location?.address && (
                  <div className="mt-2 flex items-center text-sm text-blue-600">
                    <HiLocationMarker className="mr-1" />
                    <span>{location.address}</span>
                  </div>
                )}
              </div>

              <div>
                <div className="mb-2 block">
                  <Label htmlFor="identificationNumber" value="ID Number" />
                </div>
                <TextInput
                  id="identificationNumber"
                  name="identificationNumber"
                  type="text"
                  placeholder="ID12345678"
                  value={formData.identificationNumber}
                  onChange={handleChange}
                />
              </div>

              <div>
                <div className="mb-2 block">
                  <Label value="User Roles *" />
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <Checkbox
                      id="customer-role"
                      value="ROLE_CUSTOMER"
                      checked={formData.roles.has("ROLE_CUSTOMER")}
                      onChange={handleRoleChange}
                    />
                    <Label htmlFor="customer-role" className="ml-2">
                      Customer
                    </Label>
                  </div>

                  <div className="flex items-center">
                    <Checkbox
                      id="driver-role"
                      value="ROLE_DRIVER"
                      checked={formData.roles.has("ROLE_DRIVER")}
                      onChange={handleRoleChange}
                    />
                    <Label htmlFor="driver-role" className="ml-2">
                      Delivery Driver
                    </Label>
                  </div>

                  <div className="flex items-center">
                    <Checkbox
                      id="restaurant-role"
                      value="ROLE_RESTAURANT_ADMIN"
                      checked={formData.roles.has("ROLE_RESTAURANT_ADMIN")}
                      onChange={handleRoleChange}
                    />
                    <Label htmlFor="restaurant-role" className="ml-2">
                      Restaurant Admin
                    </Label>
                  </div>

                  <div className="flex items-center">
                    <Checkbox
                      id="admin-role"
                      value="ROLE_ADMIN"
                      checked={formData.roles.has("ROLE_ADMIN")}
                      onChange={handleRoleChange}
                    />
                    <Label htmlFor="admin-role" className="ml-2">
                      Administrator
                    </Label>
                  </div>
                </div>
              </div>

              {/* Driver-specific fields */}
              {isDriver && (
                <div className="p-4 border border-blue-100 rounded-lg bg-blue-50">
                  <h3 className="text-lg font-medium mb-3 text-blue-700 flex items-center">
                    <HiUser className="mr-2" /> Driver Information
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <div className="mb-2 block">
                        <Label htmlFor="vehicleNumber" value="Vehicle Number" />
                      </div>
                      <TextInput
                        id="vehicleNumber"
                        name="vehicleNumber"
                        type="text"
                        placeholder="ABC-1234"
                        value={formData.vehicleNumber}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </Modal.Body>

      <Modal.Footer className="border-t border-gray-200 bg-gray-50 flex justify-between">
        <Button color="gray" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          color="blue"
          disabled={loading || imageFileUploading}
          onClick={handleSubmit}
        >
          {loading ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Creating User...
            </>
          ) : (
            "Create User"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
