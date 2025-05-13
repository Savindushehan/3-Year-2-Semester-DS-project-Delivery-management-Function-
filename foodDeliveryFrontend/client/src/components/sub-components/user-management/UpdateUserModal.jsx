import React, { useState, useEffect } from "react";
import {
  Button,
  Label,
  TextInput,
  Modal,
  Spinner,
  Checkbox,
  Alert,
  ToggleSwitch,
} from "flowbite-react";
import {
  HiUser,
  HiMail,
  HiLockClosed,
  HiPhone,
  HiLocationMarker,
  HiCheck,
  HiX,
  HiShieldCheck,
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
import PropTypes from "prop-types";

export const UpdateUserModal = ({
  show,
  onClose,
  onSuccess,
  token,
  userData,
}) => {
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
    verified: false, // Added for verification status
    disabled: false,
    enabled: false, // Added for enabled status
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

  // Track which fields have been modified
  const [modifiedFields, setModifiedFields] = useState({});

  // Initialize form data when userData changes
  useEffect(() => {
    if (userData && show) {
      // Convert roles array to Set
      const rolesSet = new Set(userData.roles || []);

      // Initialize location if available
      let locationData = null;
      if (userData.location?.coordinates) {
        locationData = {
          type: userData.location.type || "Point",
          coordinates: userData.location.coordinates,
          address: userData.location.address || userData.address,
        };
      }

      setFormData({
        username: userData.username || "",
        email: userData.email || "",
        password: "", // Don't populate password field
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        phoneNumber: userData.phoneNumber || "",
        address: userData.address || "",
        profilePicture:
          userData.profilePicture || userData.profilePictureUrl || "",
        roles: rolesSet,
        verified: userData.verified || false,
        enabled: userData.enabled || false,
        disabled: userData.disabled || false,
        identificationNumber: userData.identificationNumber || "",
        vehicleNumber: userData.vehicleNumber || "",
        location: {
          type: "Point",
          coordinates: userData.location?.coordinates || [0, 0],
        },
      });

      // Set image URL if available
      if (userData.profilePicture || userData.profilePictureUrl) {
        setImageFileUrl(userData.profilePicture || userData.profilePictureUrl);
      }

      // Set location data
      if (locationData) {
        setLocation(locationData);
      }

      // Reset modified fields tracking
      setModifiedFields({});
    }
  }, [userData, show]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update form data
    setFormData((prevData) => ({ ...prevData, [name]: value }));

    // Track that this field was modified
    setModifiedFields((prev) => ({ ...prev, [name]: true }));
  };

  // Handle toggle changes for boolean fields (verified and disabled)
  const handleToggleChange = (name) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: !prevData[name],
    }));

    // Track that this field was modified
    setModifiedFields((prev) => ({ ...prev, [name]: true }));
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

    // Track that roles were modified
    setModifiedFields({ ...modifiedFields, roles: true });
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

      // Track that profile picture was modified
      setModifiedFields({ ...modifiedFields, profilePicture: true });
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
          setModifiedFields({ ...modifiedFields, profilePicture: true });
        });
      }
    );
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Get only the modified fields
      const updatedData = {};

      // Add modified form fields
      Object.keys(modifiedFields).forEach((field) => {
        if (modifiedFields[field]) {
          if (field === "roles") {
            updatedData.roles = Array.from(formData.roles);
          } else {
            updatedData[field] = formData[field];
          }
        }
      });

      // Only include password if it was provided
      if (updatedData.password === "") {
        delete updatedData.password;
      }

      // Check if there are no changes
      if (Object.keys(updatedData).length === 0 && !location) {
        toast.info("No changes detected");
        setLoading(false);
        return;
      }

      // Add location data if it was set
      if (location && modifiedFields.location) {
        updatedData.location = {
          type: "Point",
          coordinates: location.coordinates,
          address: location.address,
        };
      }

      // Send API request
      const response = await authService.updateUser(
        userData.id,
        updatedData,
        token
      );
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
        throw new Error(data.message || "Failed to update user");
      }

      setSuccess(true);
      toast.success("User updated successfully!");

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
      verified: false,
      disabled: false,
      enabled: false,
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
    setModifiedFields({});
  };

  // Handle modal close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  console.log("Form Data:", formData);

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
          <h2 className="text-xl font-bold">Update User Information</h2>
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
            User updated successfully!
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Status Controls */}
          <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-blue-700">
              <HiShieldCheck className="mr-2" size={20} />
              Account Status Controls
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Verification Status */}
              <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                <div className="flex items-center">
                  {formData.verified ? (
                    <HiCheck className="text-green-500" size={20} />
                  ) : (
                    <HiX className="text-red-500" size={20} />
                  )}
                  <Label className="ml-2 font-medium">
                    Account Verification
                  </Label>
                </div>
                <ToggleSwitch
                  id="verified-toggle"
                  checked={formData.verified}
                  onChange={() => handleToggleChange("verified")}
                  color={formData.verified ? "success" : undefined}
                />
              </div>

              {/* Enabled/Disabled Status */}
              <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                <div className="flex items-center">
                  {!formData.disabled ? (
                    <HiCheck className="text-green-500" size={20} />
                  ) : (
                    <HiX className="text-red-500" size={20} />
                  )}
                  <Label className="ml-2 font-medium">Account Status</Label>
                </div>
                <ToggleSwitch
                  id="enabled-toggle"
                  checked={!formData.disabled}
                  onChange={() => handleToggleChange("disabled")}
                  color={!formData.disabled ? "success" : undefined}
                />
                <Label htmlFor="enabled-toggle" className="ml-2">
                  {!formData.disabled ? "Enabled" : "Disabled"}
                </Label>
              </div>
            </div>
          </div>
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
                  <Label htmlFor="username" value="Username" />
                </div>
                <TextInput
                  id="username"
                  name="username"
                  type="text"
                  icon={HiUser}
                  placeholder="johnsmith"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>

              <div>
                <div className="mb-2 block">
                  <Label htmlFor="email" value="Email" />
                </div>
                <TextInput
                  id="email"
                  name="email"
                  type="email"
                  icon={HiMail}
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled // Email is usually not updated
                />
              </div>

              <div>
                <div className="mb-2 block">
                  <Label
                    htmlFor="password"
                    value="Password (leave empty to keep unchanged)"
                  />
                </div>
                <TextInput
                  id="password"
                  name="password"
                  type="password"
                  icon={HiLockClosed}
                  placeholder="New password (optional)"
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

                                // Mark fields as modified
                                setModifiedFields({
                                  ...modifiedFields,
                                  address: true,
                                  location: true,
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
                  <Label value="User Roles" />
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
              Updating User...
            </>
          ) : (
            "Update User"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

UpdateUserModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  token: PropTypes.string.isRequired,
  userData: PropTypes.shape({
    id: PropTypes.string.isRequired,
    username: PropTypes.string,
    email: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    phoneNumber: PropTypes.string,
    address: PropTypes.string,
    profilePictureUrl: PropTypes.string,
    roles: PropTypes.arrayOf(PropTypes.string),
    verified: PropTypes.bool,
    disabled: PropTypes.bool,
    enabled: PropTypes.bool,
    identificationNumber: PropTypes.string,
    vehicleNumber: PropTypes.string,
    location: PropTypes.shape({
      type: PropTypes.string,
      coordinates: PropTypes.arrayOf(PropTypes.number),
      address: PropTypes.string,
    }),
  }).isRequired,
};
UpdateUserModal.defaultProps = {
  onSuccess: () => {},
};
