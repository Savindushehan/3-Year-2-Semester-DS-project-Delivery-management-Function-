import React, { useState } from 'react';
import {
  Modal,
  Button,
  Label,
  TextInput,
  Textarea,
  Spinner,
  ToggleSwitch,
  Card
} from "flowbite-react";
import { toast } from "react-toastify";
import { promotionService } from "../../../service/promotionService";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  FaTag,
  FaPercent,
  FaCalendarAlt,
  FaShoppingCart,
  FaInfoCircle,
  FaDollarSign,
  FaUserClock,
  FaIdCard
} from "react-icons/fa";

export default function CreatePromotionModal({ show, onClose, onSuccess, restaurantId, token }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    restaurantId: restaurantId,
    code: "",
    description: "",
    discountPercentage: 10,
    maxDiscount: 25,
    minOrderAmount: 0,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    maxUses: 100,
    oneTimeUsePerUser: true
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.code) {
      newErrors.code = "Promotion code is required";
    } else if (!/^[A-Z0-9]{4,10}$/.test(formData.code)) {
      newErrors.code = "Code must be 4-10 characters, uppercase letters and numbers only";
    }
    
    if (!formData.description) {
      newErrors.description = "Description is required";
    } else if (formData.description.length > 200) {
      newErrors.description = "Description must be less than 200 characters";
    }
    
    if (formData.discountPercentage < 0 || formData.discountPercentage > 100) {
      newErrors.discountPercentage = "Discount must be between 0% and 100%";
    }
    
    if (formData.maxDiscount < 0) {
      newErrors.maxDiscount = "Maximum discount must be a positive number";
    }
    
    if (formData.minOrderAmount < 0) {
      newErrors.minOrderAmount = "Minimum order amount must be a positive number";
    }
    
    if (formData.startDate >= formData.endDate) {
      newErrors.endDate = "End date must be after start date";
    }
    
    if (formData.maxUses < 1) {
      newErrors.maxUses = "Maximum uses must be at least 1";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let parsedValue = value;
    
    if (name === 'code') {
      parsedValue = value.toUpperCase();
    } else if (type === 'number') {
      parsedValue = parseFloat(value);
      if (isNaN(parsedValue)) parsedValue = 0;
    }
    
    setFormData({ ...formData, [name]: parsedValue });
  };

  const handleToggleChange = (checked) => {
    setFormData({ ...formData, oneTimeUsePerUser: checked });
  };

  const handleStartDateChange = (date) => {
    setFormData({ ...formData, startDate: date });
    // If end date is before new start date, update it
    if (formData.endDate < date) {
      setFormData({ 
        ...formData, 
        startDate: date, 
        endDate: new Date(date.getTime() + 24 * 60 * 60 * 1000) // start date + 1 day
      });
    }
  };

  const handleEndDateChange = (date) => {
    setFormData({ ...formData, endDate: date });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await promotionService.createPromotion(formData, token);
      
      if (response.ok) {
        setFormData({}); // Reset form data
        onSuccess();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to create promotion");
      }
    } catch (error) {
      toast.error("Error creating promotion: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onClose={onClose} size="4xl">
      <Modal.Header className="bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="text-white flex items-center">
          <FaTag className="mr-2" />
          <span className="font-bold">Create New Promotion</span>
        </div>
      </Modal.Header>
      <Modal.Body className="space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Form introduction */}
        <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg border-l-4 border-blue-500">
          <div className="flex">
            <FaInfoCircle className="text-blue-500 dark:text-blue-400 mt-1 mr-2 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300">Promotion Details</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Create a promotional discount that customers can use during checkout. All fields marked with * are required.
              </p>
            </div>
          </div>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Basic Information Section */}
          <Card>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <FaIdCard className="mr-2 text-blue-600" />
              Basic Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="code" value="Promotion Code *" className="flex items-center">
                  <FaTag className="mr-2 text-blue-500" size={14} />
                  <span>Promotion Code</span>
                </Label>
                <TextInput
                  id="code"
                  name="code"
                  placeholder="SUMMER25"
                  value={formData.code}
                  onChange={handleChange}
                  color={errors.code ? "failure" : "gray"}
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-gray-500">
                  4-10 characters, uppercase letters and numbers only
                </p>
                {errors.code && (
                  <p className="mt-1 text-xs text-red-500">{errors.code}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="description" value="Description *" className="flex items-center">
                  <FaInfoCircle className="mr-2 text-blue-500" size={14} />
                  <span>Description</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={3}
                  placeholder="Summer discount - 25% off all orders"
                  value={formData.description}
                  onChange={handleChange}
                  color={errors.description ? "failure" : "gray"}
                  className="mt-1"
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-500">{errors.description}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Customers will see this description at checkout. Max 200 characters.
                </p>
              </div>
            </div>
          </Card>

          {/* Discount Details Section */}
          <Card>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <FaPercent className="mr-2 text-green-600" />
              Discount Details
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discountPercentage" value="Discount Percentage *" className="flex items-center">
                    <FaPercent className="mr-2 text-green-500" size={14} />
                    <span>Percentage</span>
                  </Label>
                  <div className="flex items-center mt-1">
                    <TextInput
                      id="discountPercentage"
                      name="discountPercentage"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discountPercentage}
                      onChange={handleChange}
                      color={errors.discountPercentage ? "failure" : "gray"}
                      className="flex-1"
                    />
                    <span className="ml-2 text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-md">%</span>
                  </div>
                  {errors.discountPercentage && (
                    <p className="mt-1 text-xs text-red-500">{errors.discountPercentage}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="maxDiscount" value="Maximum Discount *" className="flex items-center">
                    <FaDollarSign className="mr-2 text-green-500" size={14} />
                    <span>Maximum Amount</span>
                  </Label>
                  <div className="flex items-center mt-1">
                    <span className="text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-l-md">$</span>
                    <TextInput
                      id="maxDiscount"
                      name="maxDiscount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.maxDiscount}
                      onChange={handleChange}
                      color={errors.maxDiscount ? "failure" : "gray"}
                      className="flex-1 rounded-l-none"
                    />
                  </div>
                  {errors.maxDiscount && (
                    <p className="mt-1 text-xs text-red-500">{errors.maxDiscount}</p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="minOrderAmount" value="Minimum Order Amount *" className="flex items-center">
                  <FaShoppingCart className="mr-2 text-green-500" size={14} />
                  <span>Minimum Order</span>
                </Label>
                <div className="flex items-center mt-1">
                  <span className="text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-l-md">$</span>
                  <TextInput
                    id="minOrderAmount"
                    name="minOrderAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minOrderAmount}
                    onChange={handleChange}
                    color={errors.minOrderAmount ? "failure" : "gray"}
                    className="flex-1 rounded-l-none"
                  />
                </div>
                {errors.minOrderAmount && (
                  <p className="mt-1 text-xs text-red-500">{errors.minOrderAmount}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  The minimum order total required to use this promotion
                </p>
              </div>
            </div>
          </Card>

          {/* Validity Period Section */}
          <Card>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <FaCalendarAlt className="mr-2 text-purple-600" />
              Validity Period
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate" value="Start Date *" className="flex items-center">
                  <FaCalendarAlt className="mr-2 text-purple-500" size={14} />
                  <span>Start Date & Time</span>
                </Label>
                <div className="w-full mt-1 relative">
                  <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3 pointer-events-none z-10">
                    <FaCalendarAlt className="text-gray-500" size={16} />
                  </div>
                  <DatePicker
                    id="startDate"
                    selected={formData.startDate}
                    onChange={handleStartDateChange}
                    showTimeSelect
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className={`w-full rounded-lg border text-sm focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 pl-10 ${
                      errors.startDate ? 'border-red-500' : 'border-gray-300'
                    } p-2.5`}
                  />
                </div>
                {errors.startDate && (
                  <p className="mt-1 text-xs text-red-500">{errors.startDate}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="endDate" value="End Date *" className="flex items-center">
                  <FaCalendarAlt className="mr-2 text-red-500" size={14} />
                  <span>End Date & Time</span>
                </Label>
                <div className="w-full mt-1 relative">
                  <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3 pointer-events-none z-10">
                    <FaCalendarAlt className="text-gray-500" size={16} />
                  </div>
                  <DatePicker
                    id="endDate"
                    selected={formData.endDate}
                    onChange={handleEndDateChange}
                    showTimeSelect
                    dateFormat="MMMM d, yyyy h:mm aa"
                    minDate={formData.startDate}
                    className={`w-full rounded-lg border text-sm focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 pl-10 ${
                      errors.endDate ? 'border-red-500' : 'border-gray-300'
                    } p-2.5`}
                  />
                </div>
                {errors.endDate && (
                  <p className="mt-1 text-xs text-red-500">{errors.endDate}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Usage Limits Section */}
          <Card>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <FaUserClock className="mr-2 text-orange-600" />
              Usage Limits
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="maxUses" value="Maximum Uses *" className="flex items-center">
                  <FaShoppingCart className="mr-2 text-orange-500" size={14} />
                  <span>Total Usage Limit</span>
                </Label>
                <TextInput
                  id="maxUses"
                  name="maxUses"
                  type="number"
                  min="1"
                  value={formData.maxUses}
                  onChange={handleChange}
                  color={errors.maxUses ? "failure" : "gray"}
                  className="mt-1"
                />
                {errors.maxUses && (
                  <p className="mt-1 text-xs text-red-500">{errors.maxUses}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Maximum number of times this promotion can be used across all customers
                </p>
              </div>
              
              <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <ToggleSwitch
                  checked={formData.oneTimeUsePerUser}
                  onChange={handleToggleChange}
                  label={
                    <div className="ml-2">
                      <span className="font-medium text-gray-900 dark:text-white">One-time use per user</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        When enabled, each customer can only use this promotion code once
                      </p>
                    </div>
                  }
                />
              </div>
            </div>
          </Card>
        </form>
      </Modal.Body>
      <Modal.Footer className="flex justify-between">
        <Button color="gray" onClick={onClose}>
          Cancel
        </Button>
        <Button
          gradientDuoTone="greenToBlue"
          onClick={handleSubmit}
          disabled={loading}
          className="px-8"
        >
          {loading ? (
            <>
              <Spinner size="sm" className="mr-3" />
              Creating...
            </>
          ) : (
            <>
              <FaTag className="mr-2" />
              Create Promotion
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}