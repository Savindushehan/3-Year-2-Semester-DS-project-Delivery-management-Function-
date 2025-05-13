import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  TextInput,
  Label,
  Textarea,
  Checkbox,
  Select,
  Spinner,
  Radio,
  Card,
} from "flowbite-react";
import { 
  HiOutlinePhotograph, 
  HiOutlineExclamation,
  HiOutlineCurrencyDollar,
  HiOutlineTag,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineCollection,
  HiOutlineStar,
  HiOutlineCalendar,
  HiOutlineShoppingCart,
  HiOutlineViewGrid,
  HiOutlinePencilAlt,
  HiOutlineFire,
  HiOutlineCheck
} from "react-icons/hi";
import { toast } from "react-toastify";
import { menuItemService } from "../../../service/menuItemService";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../../../firebase";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function UpdateMenuItemModal({
  show,
  onClose,
  onSuccess,
  menuItem,
  token,
  categories,
}) {
  const [formData, setFormData] = useState({
    restaurantId: "",
    categoryId: "",
    name: "",
    description: "",
    price: "",
    available: true,
    imageUrl: "",
    itemType: "FOOD",
    dietaryType: "NONE",
    glutenFree: false,
    preparationTimeMinutes: "",
    spicy: false,
    quantity: "",
    unit: "ITEMS",
    expiryDate: "",
    onPromotion: false,
    discountedPrice: "",
    addOns: [],
  });
  
  const [currentAddOn, setCurrentAddOn] = useState({
    name: "",
    description: "",
    price: "",
    available: true,
    multiple: false,
    required: false,
    maxQuantity: 1,
  });
  
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageProgress, setImageProgress] = useState(0);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Load menu item data when modal opens
  useEffect(() => {
    if (show && menuItem) {
      // Determine the dietary type based on existing flags
      let dietaryType = "NONE";
      if (menuItem.vegetarian) dietaryType = "VEGETARIAN";
      else if (menuItem.nonVegetarian) dietaryType = "NON_VEGETARIAN";
      else if (menuItem.vegan) dietaryType = "VEGAN";

      setFormData({
        restaurantId: menuItem.restaurantId,
        categoryId: menuItem.categoryId || "",
        name: menuItem.name || "",
        description: menuItem.description || "",
        price: menuItem.price?.toString() || "",
        available: menuItem.available !== false,
        imageUrl: menuItem.imageUrl || "",
        itemType: menuItem.itemType || "FOOD",
        dietaryType: dietaryType,
        glutenFree: menuItem.glutenFree || false,
        preparationTimeMinutes: menuItem.preparationTimeMinutes?.toString() || "",
        spicy: menuItem.spicy || false,
        quantity: menuItem.quantity?.toString() || "",
        unit: menuItem.unit || "ITEMS",
        expiryDate: menuItem.expiryDate || "",
        onPromotion: menuItem.onPromotion || false,
        discountedPrice: menuItem.discountedPrice?.toString() || "",
        addOns: menuItem.addOns || [],
      });
      
      // Set image preview from existing image
      if (menuItem.imageUrl) {
        setImagePreview(menuItem.imageUrl);
      } else {
        setImagePreview(null);
      }
      
      setImage(null);
      setImageProgress(0);
      setImageUploading(false);
      setImageError(null);
      setFormErrors({});
    }
  }, [show, menuItem]);

  useEffect(() => {
    if (image) {
      uploadImage();
    }
  }, [image]);

  useEffect(() => {
    if (!formData.onPromotion) {
      setFormData((prev) => ({ ...prev, discountedPrice: "" }));
    }
  }, [formData.onPromotion]);

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

  const handleAddOnChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentAddOn({
      ...currentAddOn,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleAddAddOn = () => {
    if (!currentAddOn.name.trim()) {
      toast.error("Add-on name is required");
      return;
    }

    if (
      !currentAddOn.price ||
      isNaN(currentAddOn.price) ||
      parseFloat(currentAddOn.price) < 0
    ) {
      toast.error("Add-on price must be a positive number");
      return;
    }

    const newAddOn = {
      ...currentAddOn,
      price: parseFloat(currentAddOn.price),
      maxQuantity: parseInt(currentAddOn.maxQuantity),
    };

    setFormData({
      ...formData,
      addOns: [...formData.addOns, newAddOn],
    });

    setCurrentAddOn({
      name: "",
      description: "",
      price: "",
      available: true,
      multiple: false,
      required: false,
      maxQuantity: 1,
    });
  };

  const handleRemoveAddOn = (index) => {
    const updatedAddOns = formData.addOns.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      addOns: updatedAddOns,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setImageError("File size should be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setImageError("Please select an image file");
        return;
      }
      setImage(file);
      setImageError(null);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    setImageUploading(true);
    const storage = getStorage(app);
    const fileName = new Date().getTime() + image.name;
    const storageRef = ref(storage, `menuItemImages/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, image);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImageProgress(Math.round(progress));
      },
      (error) => {
        setImageError("Error uploading image: " + error.message);
        setImageUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData((prev) => ({
            ...prev,
            imageUrl: downloadURL,
          }));
          setImageUploading(false);
          toast.success("Image uploaded successfully");
        });
      }
    );
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Menu item name is required";
    }

    if (!formData.categoryId) {
      errors.categoryId = "Category is required";
    }

    if (!formData.price) {
      errors.price = "Price is required";
    } else if (isNaN(formData.price) || parseFloat(formData.price) < 0) {
      errors.price = "Price must be a positive number";
    }

    if (formData.onPromotion && !formData.discountedPrice) {
      errors.discountedPrice =
        "Promotion price is required when item is on promotion";
    } else if (
      formData.onPromotion &&
      (isNaN(formData.discountedPrice) ||
        parseFloat(formData.discountedPrice) <= 0)
    ) {
      errors.discountedPrice = "Promotion price must be a positive number";
    } else if (
      formData.onPromotion &&
      parseFloat(formData.discountedPrice) >= parseFloat(formData.price)
    ) {
      errors.discountedPrice =
        "Promotion price must be lower than regular price";
    }

    if (
      formData.preparationTimeMinutes &&
      (isNaN(formData.preparationTimeMinutes) ||
        parseInt(formData.preparationTimeMinutes) < 0)
    ) {
      errors.preparationTimeMinutes =
        "Preparation time must be a positive number";
    }

    if (formData.itemType === "GROCERY") {
      if (!formData.quantity) {
        errors.quantity = "Quantity is required for grocery items";
      } else if (isNaN(formData.quantity) || parseInt(formData.quantity) <= 0) {
        errors.quantity = "Quantity must be a positive number";
      }

      if (!formData.expiryDate) {
        errors.expiryDate = "Expiration date is required for grocery items";
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day
        const expDate = new Date(formData.expiryDate);
        if (expDate < today) {
          errors.expiryDate = "Expiration date cannot be in the past";
        }
      }
    }

    return errors;
  };

  const preventNegativeInput = (e) => {
    if (e.key === "-" || e.key === "e") {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please correct the form errors");
      return;
    }

    if (imageUploading) {
      toast.warning("Please wait for image upload to complete");
      return;
    }

    try {
      setSubmitting(true);

      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        preparationTimeMinutes: formData.preparationTimeMinutes
          ? parseInt(formData.preparationTimeMinutes)
          : null,
        onPromotion: formData.onPromotion,
        discountedPrice: formData.onPromotion
          ? parseFloat(formData.discountedPrice)
          : null,
      };

      if (formData.itemType === "GROCERY") {
        submitData.quantity = parseInt(formData.quantity);
        submitData.unit = formData.unit;
        submitData.expiryDate = formData.expiryDate;

        if (!formData.expiryDate) {
          setFormErrors((prev) => ({
            ...prev,
            expiryDate: "Expiration date is required for grocery items",
          }));
          toast.error("Expiration date is required for grocery items");
          setSubmitting(false);
          return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expDate = new Date(formData.expiryDate);

        if (expDate < today) {
          setFormErrors((prev) => ({
            ...prev,
            expiryDate: "Expiration date cannot be in the past",
          }));
          toast.error("Expiration date cannot be in the past");
          setSubmitting(false);
          return;
        }
      } else {
        delete submitData.quantity;
        delete submitData.unit;
        delete submitData.expiryDate;
      }

      if (formData.dietaryType === "VEGETARIAN") {
        submitData.vegetarian = true;
        submitData.nonVegetarian = false;
        submitData.vegan = false;
      } else if (formData.dietaryType === "NON_VEGETARIAN") {
        submitData.vegetarian = false;
        submitData.nonVegetarian = true;
        submitData.vegan = false;
      } else if (formData.dietaryType === "VEGAN") {
        submitData.vegetarian = false;
        submitData.nonVegetarian = false;
        submitData.vegan = true;
      } else {
        submitData.vegetarian = false;
        submitData.nonVegetarian = false;
        submitData.vegan = false;
      }

      delete submitData.dietaryType;

      const response = await menuItemService.updateMenuItem(
        menuItem.id,
        submitData,
        token
      );

      if (response.ok) {
        onSuccess();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to update menu item");
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onClose={onClose} size="6xl" popup={false} >
      <Modal.Header className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
        <span className="flex items-center gap-2 text-xl text-white">
          <HiOutlinePencilAlt className="w-6 h-6" />
          Update Menu Item
        </span>
      </Modal.Header>

      <Modal.Body className="px-5 py-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Card */}
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4 flex items-center gap-2">
              <HiOutlineDocumentText className="text-blue-600" /> 
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="col-span-1 md:col-span-2">
                <Label htmlFor="name" value="Menu Item Name *" className="text-gray-700 font-medium flex items-center gap-1" />
                <TextInput
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter item name"
                  required
                  color={formErrors.name ? "failure" : undefined}
                  className="mt-1"
                  sizing="md"
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="categoryId" value="Category *" className="text-gray-700 font-medium flex items-center gap-1">
                  <HiOutlineCollection size={18} className="text-blue-500" />
                </Label>
                <Select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  required
                  color={formErrors.categoryId ? "failure" : undefined}
                  className="mt-1"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
                {formErrors.categoryId && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.categoryId}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="itemType" value="Item Type *" className="text-gray-700 font-medium flex items-center gap-1">
                  <HiOutlineViewGrid size={18} className="text-blue-500" />
                </Label>
                <Select
                  id="itemType"
                  name="itemType"
                  value={formData.itemType}
                  onChange={handleInputChange}
                  className="mt-1"
                >
                  <option value="FOOD">Food</option>
                  <option value="DRINK">Drink</option>
                  <option value="DESSERT">Dessert</option>
                  <option value="GROCERY">Grocery</option>
                </Select>
              </div>

              <div className="col-span-1 md:col-span-2">
                <Label htmlFor="description" value="Description" className="text-gray-700 font-medium flex items-center gap-1">
                  <HiOutlineDocumentText size={18} className="text-blue-500" />
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your menu item"
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          </Card>

          {/* Pricing Card */}
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4 flex items-center gap-2">
              <HiOutlineCurrencyDollar className="text-green-600" /> 
              Pricing & Availability
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="price" value="Price *" className="text-gray-700 font-medium flex items-center gap-1">
                  <HiOutlineCurrencyDollar size={18} className="text-green-500" />
                </Label>
                <TextInput
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  required
                  color={formErrors.price ? "failure" : undefined}
                  className="mt-1"
                />
                {formErrors.price && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>
                )}
              </div>

              {formData.itemType !== "GROCERY" && (
                <div>
                  <Label
                    htmlFor="preparationTimeMinutes"
                    value="Preparation Time (minutes)"
                    className="text-gray-700 font-medium flex items-center gap-1"
                  >
                    <HiOutlineClock size={18} className="text-blue-500" />
                  </Label>
                  <TextInput
                    id="preparationTimeMinutes"
                    name="preparationTimeMinutes"
                    type="number"
                    value={formData.preparationTimeMinutes}
                    onChange={handleInputChange}
                    placeholder="e.g., 15"
                    color={
                      formErrors.preparationTimeMinutes ? "failure" : undefined
                    }
                    className="mt-1"
                  />
                  {formErrors.preparationTimeMinutes && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.preparationTimeMinutes}
                    </p>
                  )}
                </div>
              )}

              {/* Promotion section with better styling */}
              <div className="col-span-1 md:col-span-2">
                <div className={`flex flex-col space-y-4 p-4 rounded-lg border transition-colors duration-300 ${formData.onPromotion ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="onPromotion"
                      name="onPromotion"
                      checked={formData.onPromotion}
                      onChange={handleInputChange}
                      className="text-green-600"
                    />
                    <Label
                      htmlFor="onPromotion"
                      value="On Promotion"
                      className={`font-medium flex items-center gap-1 ${formData.onPromotion ? 'text-green-700' : 'text-gray-700'}`}
                    >
                      <HiOutlineTag size={18} className={formData.onPromotion ? 'text-green-600' : 'text-gray-500'} />
                    </Label>
                  </div>

                  {formData.onPromotion && (
                    <div className="pl-7 animate-fadeIn">
                      <Label htmlFor="discountedPrice" value="Promotion Price *" className="text-gray-700" />
                      <TextInput
                        id="discountedPrice"
                        name="discountedPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        max={formData.price || undefined}
                        value={formData.discountedPrice}
                        onChange={handleInputChange}
                        onKeyDown={preventNegativeInput}
                        placeholder="0.00"
                        required
                        color={formErrors.discountedPrice ? "failure" : undefined}
                        className="mt-1"
                      />
                      {formErrors.discountedPrice && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.discountedPrice}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors duration-200">
                  <Checkbox
                    id="available"
                    name="available"
                    checked={formData.available}
                    onChange={handleInputChange}
                  />
                  <Label
                    htmlFor="available"
                    className="font-medium text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <HiOutlineCheck size={18} />
                    Item is available for ordering
                  </Label>
                </div>
              </div>
            </div>
          </Card>

          {/* Grocery-specific fields in a card */}
          {formData.itemType === "GROCERY" && (
            <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4 flex items-center gap-2">
                <HiOutlineShoppingCart className="text-amber-600" /> 
                Grocery Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <Label htmlFor="quantity" value="Quantity *" className="text-gray-700 font-medium" />
                  <TextInput
                    id="quantity"
                    name="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="Enter quantity"
                    required
                    color={formErrors.quantity ? "failure" : undefined}
                    className="mt-1"
                  />
                  {formErrors.quantity && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.quantity}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="unit" value="Unit" className="text-gray-700 font-medium" />
                  <Select
                    id="unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="mt-1"
                  >
                    <option value="ITEMS">Items</option>
                    <option value="KG">Kilograms (kg)</option>
                    <option value="G">Grams (g)</option>
                    <option value="L">Liters (L)</option>
                    <option value="ML">Milliliters (ml)</option>
                    <option value="PACK">Pack</option>
                    <option value="BOX">Box</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="expiryDate" value="Expiration Date *" className="text-gray-700 font-medium flex items-center gap-1">
                    <HiOutlineCalendar size={18} className="text-amber-500" />
                  </Label>
                  <TextInput
                    id="expiryDate"
                    name="expiryDate"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    required
                    color={formErrors.expiryDate ? "failure" : undefined}
                    className="mt-1"
                  />
                  {formErrors.expiryDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.expiryDate}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Add-Ons Card (only for non-grocery items) */}
          {formData.itemType !== "GROCERY" && (
            <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4 flex items-center gap-2">
                <HiOutlinePencilAlt className="text-indigo-600" /> 
                Add-Ons
              </h2>

              {/* List of existing add-ons */}
              {formData.addOns?.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-medium mb-3 text-gray-700 flex items-center gap-1">
                    <HiOutlineCollection size={16} className="text-indigo-500" />
                    Current Add-Ons
                  </h4>
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th className="px-4 py-3">Name</th>
                          <th className="px-4 py-3">Price</th>
                          <th className="px-4 py-3">Required</th>
                          <th className="px-4 py-3">Multiple</th>
                          <th className="px-4 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.addOns.map((addOn, index) => (
                          <tr key={addOn.id || index} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium">{addOn.name}</td>
                            <td className="px-4 py-3 text-green-700">
                              ${parseFloat(addOn.price).toFixed(2)}
                            </td>
                            <td className="px-4 py-3">
                              {addOn.required ? 
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Yes</span> : 
                                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">No</span>}
                            </td>
                            <td className="px-4 py-3">
                              {addOn.multiple ? 
                                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">Yes</span> : 
                                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">No</span>}
                            </td>
                            <td className="px-4 py-3">
                              <Button
                                color="failure"
                                size="xs"
                                onClick={() => handleRemoveAddOn(index)}
                                className="transition-all duration-200"
                              >
                                Remove
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Add new add-on form */}
              <div className="border-t pt-4">
                <h4 className="text-md font-medium mb-4 text-gray-700 flex items-center gap-1">
                  <HiOutlinePencilAlt size={16} className="text-indigo-500" />
                  Add New Add-On
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="addOnName" value="Name *" className="text-gray-700" />
                    <TextInput
                      id="addOnName"
                      name="name"
                      value={currentAddOn.name}
                      onChange={handleAddOnChange}
                      placeholder="e.g., Extra Cheese"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="addOnPrice" value="Price *" className="text-gray-700 flex items-center gap-1">
                      <HiOutlineCurrencyDollar size={16} className="text-green-500" />
                    </Label>
                    <TextInput
                      id="addOnPrice"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={currentAddOn.price}
                      onChange={handleAddOnChange}
                      onKeyDown={preventNegativeInput}
                      placeholder="0.00"
                      className="mt-1"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <Label htmlFor="addOnDescription" value="Description" className="text-gray-700" />
                    <TextInput
                      id="addOnDescription"
                      name="description"
                      value={currentAddOn.description}
                      onChange={handleAddOnChange}
                      placeholder="Optional description"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="addOnMaxQuantity"
                      value="Max Quantity"
                      className="text-gray-700"
                    />
                    <TextInput
                      id="addOnMaxQuantity"
                      name="maxQuantity"
                      type="number"
                      min="1"
                      max="100"
                      value={currentAddOn.maxQuantity}
                      onChange={handleAddOnChange}
                      placeholder="1"
                      className="mt-1"
                    />
                  </div>

                  <div className="flex items-end space-x-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="addOnRequired"
                        name="required"
                        checked={currentAddOn.required}
                        onChange={handleAddOnChange}
                      />
                      <Label htmlFor="addOnRequired" value="Required" className="text-gray-700" />
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="addOnMultiple"
                        name="multiple"
                        checked={currentAddOn.multiple}
                        onChange={handleAddOnChange}
                      />
                      <Label htmlFor="addOnMultiple" value="Multiple" className="text-gray-700" />
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="addOnAvailable"
                        name="available"
                        checked={currentAddOn.available}
                        onChange={handleAddOnChange}
                      />
                      <Label htmlFor="addOnAvailable" value="Available" className="text-gray-700" />
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <Button
                      color="success"
                      size="sm"
                      onClick={handleAddAddOn}
                      className="mt-2 transition-all duration-200 hover:shadow-md"
                    >
                      <HiOutlinePencilAlt className="mr-2 h-5 w-5" />
                      Add to List
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Dietary Options Card */}
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4 flex items-center gap-2">
              <HiOutlineStar className="text-purple-600" /> 
              Dietary Options
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-gray-700 font-medium">Dietary Type</Label>
                <div className="flex flex-col space-y-3 p-4 border rounded-md bg-white">
                  <div className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded-md transition-colors">
                    <Radio
                      id="none"
                      name="dietaryType"
                      value="NONE"
                      checked={formData.dietaryType === "NONE"}
                      onChange={handleInputChange}
                    />
                    <Label htmlFor="none" value="None" className="cursor-pointer" />
                  </div>

                  <div className="flex items-center gap-2 hover:bg-green-50 p-2 rounded-md transition-colors">
                    <Radio
                      id="vegetarian"
                      name="dietaryType"
                      value="VEGETARIAN"
                      checked={formData.dietaryType === "VEGETARIAN"}
                      onChange={handleInputChange}
                    />
                    <Label htmlFor="vegetarian" value="Vegetarian" className="text-green-700 cursor-pointer" />
                  </div>

                  <div className="flex items-center gap-2 hover:bg-red-50 p-2 rounded-md transition-colors">
                    <Radio
                      id="nonVegetarian"
                      name="dietaryType"
                      value="NON_VEGETARIAN"
                      checked={formData.dietaryType === "NON_VEGETARIAN"}
                      onChange={handleInputChange}
                    />
                    <Label htmlFor="nonVegetarian" value="Non-Vegetarian" className="text-red-700 cursor-pointer" />
                  </div>

                  <div className="flex items-center gap-2 hover:bg-emerald-50 p-2 rounded-md transition-colors">
                    <Radio
                      id="vegan"
                      name="dietaryType"
                      value="VEGAN"
                      checked={formData.dietaryType === "VEGAN"}
                      onChange={handleInputChange}
                    />
                    <Label htmlFor="vegan" value="Vegan" className="text-emerald-700 cursor-pointer" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-gray-700 font-medium">Additional Dietary Information</Label>
                <div className="flex flex-col space-y-3 p-4 border rounded-md bg-white">
                  <div className="flex items-center gap-2 hover:bg-orange-50 p-2 rounded-md transition-colors">
                    <Checkbox
                      id="glutenFree"
                      name="glutenFree"
                      checked={formData.glutenFree}
                      onChange={handleInputChange}
                    />
                    <Label htmlFor="glutenFree" value="Gluten-Free" className="cursor-pointer" />
                  </div>

                  <div className="flex items-center gap-2 hover:bg-red-50 p-2 rounded-md transition-colors">
                    <Checkbox
                      id="spicy"
                      name="spicy"
                      checked={formData.spicy}
                      onChange={handleInputChange}
                    />
                    <Label htmlFor="spicy" value="Spicy" className="flex items-center gap-1 cursor-pointer">
                      <HiOutlineFire className="text-red-500" /> 
                      <span>Spicy</span>
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Image Upload Card */}
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4 flex items-center gap-2">
              <HiOutlinePhotograph className="text-cyan-600" /> 
              Menu Item Image
            </h2>

            <div className="flex flex-col items-center">
              <div className="mb-4 relative w-full h-60 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden flex justify-center items-center bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
                {imageUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-10">
                    <div className="w-24 h-24">
                      <CircularProgressbar
                        value={imageProgress}
                        text={`${imageProgress}%`}
                        styles={{
                          path: {
                            stroke: `rgba(62, 152, 199, ${
                              imageProgress / 100
                            })`,
                          },
                          trail: {
                            stroke: "rgba(255, 255, 255, 0.3)",
                          },
                          text: {
                            fill: "#fff",
                            fontSize: "20px",
                            fontWeight: "bold",
                          },
                        }}
                      />
                    </div>
                  </div>
                )}

                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Menu item preview"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="text-center p-6">
                    <HiOutlinePhotograph className="mx-auto h-16 w-16 text-gray-400" />
                    <p className="mt-4 text-base text-gray-600 font-medium">
                      Click to upload an image
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      PNG, JPG, JPEG up to 5MB
                    </p>
                  </div>
                )}

                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              {imageError && (
                <div className="w-full flex items-center gap-2 text-sm text-red-600 bg-red-100 p-3 rounded-md">
                  <HiOutlineExclamation className="h-5 w-5 flex-shrink-0" />
                  <span>{imageError}</span>
                </div>
              )}
            </div>
          </Card>
        </form>
      </Modal.Body>

      <Modal.Footer className="border-t space-x-3 bg-gray-50">
        <Button
          gradientDuoTone="cyanToBlue"
          onClick={handleSubmit}
          disabled={submitting || imageUploading}
          className="transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 px-6"
          size="lg"
        >
          {submitting ? (
            <>
              <Spinner size="sm" className="mr-2" light={true} />
              Updating...
            </>
          ) : (
            <>
              <HiOutlinePencilAlt className="mr-2 h-5 w-5" />
              Update Menu Item
            </>
          )}
        </Button>
        <Button 
          color="gray" 
          onClick={onClose}
          className="transition-all duration-300 hover:bg-gray-200 px-6"
          size="lg"
        >
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}