import React, { useState, useEffect } from "react";
import {
  Button,
  Label,
  Modal,
  TextInput,
  Textarea,
  ToggleSwitch,
  Spinner,
  Alert
} from "flowbite-react";
import { toast } from "react-toastify";
import { cuisineTypeService } from "../../../service/cuisineService";
import { 
  HiX, 
  HiUpload,
  HiPhotograph,
  HiMenuAlt2,
  HiDocumentText,
  HiCheck
} from "react-icons/hi";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable
} from "firebase/storage";
import { app } from "../../../firebase";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { GiCook } from "react-icons/gi";

export const CreateCuisineModal = ({ show, onClose, onSuccess, token }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    iconUrl: "",
    active: true
  });
  
  const [file, setFile] = useState(null);
  const [fileUploadProgress, setFileUploadProgress] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(null);
  const [fileUploading, setFileUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleToggleActive = () => {
    setFormData({
      ...formData,
      active: !formData.active
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const maxSize = 2 * 1024 * 1024; // 2MB

      if (selectedFile.size > maxSize) {
        setFileUploadError("File size should be less than 2MB");
        setFile(null);
        return;
      }

      if (!selectedFile.type.startsWith("image/")) {
        setFileUploadError("Please select an image file");
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setFileUploadError(null);
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // Auto-upload image when file is selected
  useEffect(() => {
    if (file) {
      handleFileUpload();
    }
  }, [file]);

  const handleFileUpload = async () => {
    if (!file) {
      setFileUploadError("Please select a file to upload");
      return;
    }
    
    setFileUploading(true);
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, `cuisineIcons/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFileUploadProgress(Math.round(progress));
      },
      (error) => {
        setFileUploadError("Error uploading file: " + error.message);
        setFileUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData({
            ...formData,
            iconUrl: downloadURL
          });
          setFileUploading(false);
          toast.success("Image uploaded successfully");
        });
      }
    );
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Cuisine name is required";
      valid = false;
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
      valid = false;
    }
    
    if (!formData.iconUrl) {
      newErrors.iconUrl = "Please upload an image for the cuisine type";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await cuisineTypeService.createCuisineType(formData, token);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update restaurant");
      }
      
      setSuccess(true);
      toast.success("Cuisine type created successfully");
      
      // Reset form after a short delay
      setTimeout(() => {
        setFormData({
          name: "",
          description: "",
          iconUrl: "",
          active: true
        });
        setFile(null);
        setImagePreview(null);
        setSuccess(false);
        
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      toast.error(error.message || "An error occurred while creating cuisine type");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset state when modal closes
  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      iconUrl: "",
      active: true
    });
    setFile(null);
    setImagePreview(null);
    setFileUploadProgress(0);
    setFileUploading(false);
    setFileUploadError(null);
    setErrors({});
    setSuccess(false);
    onClose();
  };

  return (
    <Modal
      show={show}
      onClose={handleClose}
      size="lg"
      popup={false}
    >
      <Modal.Header className="border-b border-gray-200 bg-gray-50">
        <div className="flex items-center">
          <div className="p-2 bg-yellow-100 rounded-full mr-3">
            <GiCook className="text-yellow-600" size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Create Cuisine Type</h3>
        </div>
      </Modal.Header>
      
      <Modal.Body className="px-6">
        {fileUploadError && (
          <Alert color="failure" className="mb-4">
            {fileUploadError}
          </Alert>
        )}

        {success && (
          <Alert color="success" className="mb-4">
            Cuisine type created successfully!
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Image Upload */}
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-48 h-48">
                  {fileUploading && (
                    <CircularProgressbar
                      value={fileUploadProgress || 0}
                      text={`${fileUploadProgress}%`}
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
                          stroke: `rgba(234, 179, 8, ${fileUploadProgress / 100})`,
                        },
                        text: {
                          fill: '#ca8a04',
                          fontSize: '20px',
                          fontWeight: 'bold'
                        },
                      }}
                    />
                  )}
                  <img
                    src={imagePreview || "https://via.placeholder.com/200?text=Cuisine+Image"}
                    alt="Cuisine"
                    className={`rounded-lg w-full h-full object-cover border-4 ${
                      imagePreview ? 'border-yellow-200' : 'border-gray-200'
                    } shadow-md ${fileUploading && "opacity-60"}`}
                  />
                </div>
                <div className="mt-4 w-full">
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="image"
                    className="flex items-center justify-center px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg cursor-pointer hover:bg-yellow-100 dark:bg-gray-700 dark:text-yellow-400 dark:hover:bg-gray-600 w-full transition-all duration-200"
                  >
                    <HiPhotograph className="mr-2" size={20} /> 
                    {file ? "Change Image" : "Choose Image"}
                  </label>
                  {errors.iconUrl && (
                    <p className="text-red-500 text-sm mt-1">{errors.iconUrl}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right Column - Form Fields */}
            <div className="space-y-4">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="name" value="Cuisine Name" className="font-medium" />
                </div>
                <TextInput
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter cuisine name"
                  icon={HiMenuAlt2}
                  required
                  className="w-full"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="description" value="Description" className="font-medium" />
                </div>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter cuisine description"
                  required
                  rows={5}
                  className="w-full focus:border-yellow-500"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>
              
              <div className="flex items-center gap-2 pt-2">
                <ToggleSwitch
                  id="active"
                  checked={formData.active}
                  onChange={handleToggleActive}
                  label="Active Status"
                />
                <span className={`ml-2 text-sm font-medium ${formData.active ? 'text-green-600' : 'text-red-600'}`}>
                  {formData.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </form>
      </Modal.Body>

      <Modal.Footer className="border-t border-gray-200 bg-gray-50 flex justify-between">
        <Button color="gray" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          gradientDuoTone="greenToBlue"
          disabled={isSubmitting || fileUploading}
          onClick={handleSubmit}
          className="px-5"
        >
          {isSubmitting ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Creating...
            </>
          ) : (
            <>
              <HiCheck className="mr-2 h-5 w-5" />
              Create Cuisine
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};