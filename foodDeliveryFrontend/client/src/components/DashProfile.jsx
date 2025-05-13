import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Button,
  Modal,
  TextInput,
  Label,
  Card,
  Badge,
  Spinner,
} from "flowbite-react";
import {
  HiOutlineExclamationCircle,
  HiLocationMarker,
  HiMail,
  HiUser,
  HiPhone,
  HiIdentification,
  HiKey,
} from "react-icons/hi";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import {
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signOutSuccess,
  updateStart,
  updateSuccess,
  updateFailure,
} from "../redux/user/userSlice";
import { app } from "../firebase";
import { CircularProgressbar } from "react-circular-progressbar";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { LoadScript } from "@react-google-maps/api";
import { ToastContainer, toast } from "react-toastify";
import "react-circular-progressbar/dist/styles.css";
import "react-toastify/dist/ReactToastify.css";
import { authService } from "../service/authService";

export default function DashProfile() {
  const { currentUser, loading } = useSelector((state) => state.user);
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [imageFileUploading, setImageFileUploading] = useState(false);
  const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [value, setValue] = useState(null);
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [originalData, setOriginalData] = useState({});
  const filePickerRef = useRef();
  const dispatch = useDispatch();

  const fetchUserDetails = async () => {
    setIsLoading(true);
    try {
      const response = await authService.getUserDetails(currentUser.token);

      if (response.status === 401) {
        toast.error("Unauthorized access. Please log in again.");
        return;
      }

      if (response.status === 500) {
        toast.error("Internal server error. Please try again later.");
        return;
      }

      const data = await response.json();
      if (response.ok) {
        const userData = {
          username: data.username || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          profilePicture: data.profilePictureUrl || "",
          address: data.address || "",
        };
        setFormData(userData);
        setOriginalData(userData);
        if (data.locationType === "Point" && data.latitude && data.longitude) {
          setLocation({
            type: "Point",
            coordinates: [data.longitude, data.latitude],
            address: data.address || "Selected location",
          });
        }
        setIsLoading(false);
      } else {
        toast.error(data.message || "Failed to load profile");
      }
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      toast.error("Failed to load profile information");
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize formData with current user details
  useEffect(() => {
    if (currentUser?.token) {
      fetchUserDetails();
    } else {
      setIsLoading(false);
    }
  }, [currentUser]);

  const handleEventChange = (e) => {
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

  useEffect(() => {
    if (imageFile) {
      uploadImage();
    }
  }, [imageFile]);

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      phoneNumber: "",
      firstName: "",
      lastName: "",
      profilePicture: "",
      address: "",
    });
    setImageFile(null);
    setImageFileUrl(null);
    setImageUploadProgress(null);
    setImageUploadError(null);
    setLocation(null);
    setValue(null);
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateUserSuccess(null);

    // Compare formData with originalData to find changed fields
    const changedFields = {};
    let hasChanges = false;

    Object.keys(formData).forEach((key) => {
      if (formData[key] !== originalData[key]) {
        changedFields[key] = formData[key];
        hasChanges = true;
      }
    });

    // Check if profile picture was updated
    if (formData.profilePicture !== originalData.profilePicture) {
      changedFields.profilePicture = formData.profilePicture;
      hasChanges = true;
    }

    if (!hasChanges) {
      toast.info("No changes detected");
      return;
    }

    if (imageFileUploading) {
      toast.error("Please wait for image to upload before submitting");
      return;
    }

    // Add location data if it was changed
    if (location) {
      changedFields.location = {
        type: "Point",
        coordinates: location.coordinates,
        address: location.address,
      };
    }

    try {
      dispatch(updateStart());
      const res = await authService.updateUserDetails(
        changedFields,
        currentUser.token
      );
      if (res.status === 401) {
        toast.error("Unauthorized access. Please log in again.");
        return;
      }
      if (res.status === 500) {
        toast.error("Internal server error. Please try again later.");
        return;
      }
      if (res.status === 400) {
        const errorData = await res.json();
        toast.error(errorData.message || "Bad request");
        return;
      }
      if (res.status === 403) {
        const errorData = await res.json();
        toast.error(errorData.message || "Forbidden access");
        return;
      }
      if (!res.ok) {
        const errorData = await res.json();
        dispatch(updateFailure(errorData.message));
        toast.error(errorData.message || "Failed to update profile");
      } else {
        const data = await res.json();
        // dispatch(updateSuccess(data));
        fetchUserDetails(); // This will refresh originalData too
        resetForm();
        toast.success("Profile updated successfully");
        setUpdateUserSuccess("Profile updated successfully");
      }
    } catch (error) {
      dispatch(updateFailure(error.message));
      resetForm();
      toast.error("Failed to update profile");
    }
  };

  const handleDeleteUser = async () => {
    setShowModal(false);
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/users/profile`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        dispatch(deleteUserFailure(errorData.message));
        toast.error(errorData.message || "Failed to delete account");
      } else {
        dispatch(deleteUserSuccess());
        dispatch(signOutSuccess());
        toast.success("Account deleted successfully");
      }
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
      toast.error("Failed to delete account");
    }
  };

  const handleSignout = async () => {
    try {
      const res = await authService.logout(currentUser.token);
      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to sign out");
        return;
      }
      dispatch(signOutSuccess());
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center p-8">
        <Alert color="warning">
          You must be logged in to view your profile
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner size="xl" />
        <p className="ml-2">Loading profile information...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 w-full">
      <ToastContainer position="top-right" autoClose={3000} />

      <Card className="mb-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex flex-col items-center">
            <div
              className="relative w-36 h-36 cursor-pointer shadow-md overflow-hidden rounded-full mb-4"
              onClick={() => filePickerRef.current.click()}
            >
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
                      stroke: `rgba(62,152,199,${imageUploadProgress / 100})`,
                    },
                  }}
                />
              )}
              <img
                src={
                  imageFileUrl ||
                  formData.profilePicture ||
                  "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg"
                }
                alt="user"
                className={`rounded-full w-full h-full object-cover border-4 border-gray-200 ${
                  imageUploadProgress &&
                  imageUploadProgress < 100 &&
                  "opacity-60"
                }`}
              />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleEventChange}
              ref={filePickerRef}
              hidden
            />
            <Button size="xs" onClick={() => filePickerRef.current.click()}>
              Change Photo
            </Button>
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">
              {formData.firstName || "User"} {formData.lastName || ""}
            </h1>
            <div className="flex flex-wrap gap-2 mb-3">
              {currentUser.roles &&
                currentUser.roles.map((role) => (
                  <Badge key={role} color="info" className="text-xs">
                    {role.replace("ROLE_", "")}
                  </Badge>
                ))}
            </div>
            <p className="text-gray-500 mb-2">
              Username: {formData.username || "Not set"}
            </p>
            {currentUser.enabled === false && (
              <Alert color="warning" className="mb-2">
                Your account is not verified. Please check your email to verify
                your account.
              </Alert>
            )}
          </div>
        </div>
      </Card>

      {imageUploadError && (
        <Alert color="failure" className="mb-4">
          {imageUploadError}
        </Alert>
      )}

      <Card>
        <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="mb-4">
                <Label htmlFor="firstName" value="First Name" />
                <TextInput
                  icon={HiUser}
                  type="text"
                  id="firstName"
                  placeholder="John"
                  value={formData.firstName || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-4">
                <Label htmlFor="email" value="Email Address" />
                <TextInput
                  icon={HiMail}
                  type="email"
                  id="email"
                  placeholder="john@example.com"
                  value={formData.email || ""}
                  onChange={handleChange}
                  disabled
                />
              </div>

              <div className="mb-4">
                <Label htmlFor="phoneNumber" value="Phone Number" />
                <TextInput
                  icon={HiPhone}
                  type="tel"
                  id="phoneNumber"
                  placeholder="+1 123 456 7890"
                  value={formData.phoneNumber || ""}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <div className="mb-4">
                <Label htmlFor="lastName" value="Last Name" />
                <TextInput
                  icon={HiUser}
                  type="text"
                  id="lastName"
                  placeholder="Doe"
                  value={formData.lastName || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-4">
                <Label htmlFor="username" value="Username" />
                <TextInput
                  icon={HiUser}
                  type="text"
                  id="username"
                  value={formData.username || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-4">
                <Label htmlFor="address" value="Address" />
                <TextInput
                  icon={HiLocationMarker}
                  type="text"
                  id="address"
                  placeholder="123 Main St, City"
                  value={formData.address || ""}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <Label htmlFor="location" value="Your Location" />
            <div className="mt-1">
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
                    placeholder: "Search for your address...",
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
              {(location?.address || formData.address) && (
                <div className="mt-2 flex items-center text-sm text-blue-600">
                  <HiLocationMarker className="mr-1" />
                  <span>{location?.address || formData.address}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap justify-between mt-4">
            <div className="flex space-x-4">
              <Button
                type="submit"
                gradientDuoTone="purpleToBlue"
                disabled={isLoading || imageFileUploading}
              >
                {isLoading ? "Saving..." : "Update Profile"}
              </Button>
              <Button color="light" onClick={() => fetchUserDetails()}>
                Cancel
              </Button>
            </div>

            <div className="flex space-x-4 mt-4 sm:mt-0">
              <Button
                color="failure"
                outline
                onClick={() => setShowModal(true)}
              >
                Delete Account
              </Button>
              <Button color="gray" outline onClick={handleSignout}>
                Sign Out
              </Button>
            </div>
          </div>
        </form>

        {updateUserSuccess && (
          <Alert color="success" className="mt-4">
            {updateUserSuccess}
          </Alert>
        )}
      </Card>

      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
              Are you sure you want to delete your account?
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              This action cannot be undone. All your data will be permanently
              removed.
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <Button color="failure" onClick={handleDeleteUser}>
              Yes, Delete Account
            </Button>
            <Button color="gray" onClick={() => setShowModal(false)}>
              No, Cancel
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
