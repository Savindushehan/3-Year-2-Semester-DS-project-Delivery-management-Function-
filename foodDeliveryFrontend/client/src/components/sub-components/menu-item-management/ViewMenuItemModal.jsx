import React from "react";
import { Modal, Button, Badge, Card } from "flowbite-react";
import {
  HiCheck,
  HiX,
  HiOutlineClock,
  HiFire,
  HiCurrencyDollar,
  HiOutlineTag,
  HiOutlinePlusCircle,
  HiOutlineExclamation,
  HiOutlineInformationCircle,
  HiOutlinePhotograph,
  HiOutlineCalendar,
} from "react-icons/hi";
import { FaUtensils, FaLeaf, FaPlus } from "react-icons/fa";

export default function ViewMenuItemModal({
  show,
  onClose,
  menuItem,
  categoryName,
}) {
  if (!menuItem) return null;

  return (
    <Modal show={show} onClose={onClose} size="6xl">
      <Modal.Header className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md">
        <span className="flex items-center gap-2 text-xl font-semibold text-white">
          <HiOutlineInformationCircle className="h-6 w-6" />
          Menu Item Details: {menuItem.name}
        </span>
      </Modal.Header>
      <Modal.Body className="max-h-[80vh] overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Details */}
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <h3 className="text-2xl font-bold text-gray-800 mb-3 border-b pb-2">
                {menuItem.name}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge
                  color="info"
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium"
                >
                  <FaUtensils className="mr-1" />
                  {categoryName || "Uncategorized"}
                </Badge>

                <Badge
                  color="gray"
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium"
                >
                  {menuItem.itemType === "FOOD" && <FaUtensils className="mr-1" />}
                  {menuItem.itemType === "DRINK" && <span className="mr-1">🥤</span>}
                  {menuItem.itemType === "DESSERT" && <span className="mr-1">🍰</span>}
                  {menuItem.itemType === "GROCERY" && <span className="mr-1">🛒</span>}
                  {menuItem.itemType || "Unknown Type"}
                </Badge>
              </div>
            </div>

            {/* Price information with promotion if applicable */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl shadow-sm border border-gray-200 transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center mb-2">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <HiCurrencyDollar className="text-green-600 text-xl" />
                </div>
                <span className="font-semibold text-gray-700 text-lg">Price</span>
              </div>
              <div className="flex items-center gap-3 ml-1">
                {menuItem.onPromotion && menuItem.discountedPrice ? (
                  <>
                    <p className="text-2xl font-bold text-green-600">
                      ${parseFloat(menuItem.discountedPrice).toFixed(2)}
                    </p>
                    <p className="text-base font-medium text-gray-500 line-through">
                      ${parseFloat(menuItem.price).toFixed(2)}
                    </p>
                    <Badge color="success" className="flex items-center gap-1 px-3 py-1.5 ml-2 animate-pulse">
                      <HiOutlineTag className="mr-1" />
                      {Math.round(((menuItem.price - menuItem.discountedPrice) / menuItem.price) * 100)}% OFF
                    </Badge>
                  </>
                ) : (
                  <p className="text-2xl font-bold text-green-600">
                    ${parseFloat(menuItem.price).toFixed(2)}
                  </p>
                )}
              </div>
            </div>

            {menuItem.description && (
              <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-400 border-t border-r border-b">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                  <HiOutlineInformationCircle className="mr-2 text-blue-500" />
                  Description
                </h4>
                <p className="text-gray-600 italic pl-1">{menuItem.description}</p>
              </div>
            )}

            {/* Preparation time */}
            {menuItem.preparationTimeMinutes && (
              <div className="flex items-center bg-blue-50 p-4 rounded-xl border border-blue-200 shadow-sm hover:bg-blue-100 transition-colors duration-300">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <HiOutlineClock className="text-blue-600 text-xl" />
                </div>
                <span className="font-medium text-blue-800">
                  Preparation time: <span className="font-bold">{menuItem.preparationTimeMinutes} minutes</span>
                </span>
              </div>
            )}

            {/* Status */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                <HiOutlineInformationCircle className="mr-2 text-gray-500" />
                Status
              </h4>
              {menuItem.available ? (
                <Badge
                  color="success"
                  className="flex items-center w-fit px-4 py-2 text-sm font-medium"
                  size="xl"
                >
                  <HiCheck className="mr-1 h-5 w-5" />
                  Available for Order
                </Badge>
              ) : (
                <Badge
                  color="failure"
                  className="flex items-center w-fit px-4 py-2 text-sm font-medium"
                  size="xl"
                >
                  <HiX className="mr-1 h-5 w-5" />
                  Currently Unavailable
                </Badge>
              )}
            </div>

            {/* Dietary Information */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <h4 className="font-semibold text-gray-700 mb-3 border-b pb-2">
                Dietary Information
              </h4>
              <div className="flex flex-wrap gap-2 pt-1">
                {menuItem.vegetarian && (
                  <Badge
                    color="success"
                    className="flex items-center gap-1 px-3 py-2 text-sm"
                  >
                    <FaLeaf className="mr-1" />
                    Vegetarian
                  </Badge>
                )}
                {menuItem.nonVegetarian && (
                  <Badge
                    color="dark"
                    className="flex items-center gap-1 px-3 py-2 text-sm"
                  >
                    <FaUtensils className="mr-1" />
                    Non-Vegetarian
                  </Badge>
                )}
                {menuItem.vegan && (
                  <Badge
                    color="indigo"
                    className="flex items-center gap-1 px-3 py-2 text-sm"
                  >
                    <FaLeaf className="mr-1" />
                    Vegan
                  </Badge>
                )}
                {menuItem.glutenFree && (
                  <Badge
                    color="purple"
                    className="flex items-center gap-1 px-3 py-2 text-sm"
                  >
                    <HiCheck className="mr-1" />
                    Gluten-Free
                  </Badge>
                )}
                {menuItem.spicy && (
                  <Badge
                    color="red"
                    className="flex items-center gap-1 px-3 py-2 text-sm"
                  >
                    <HiFire className="mr-1" />
                    Spicy
                  </Badge>
                )}
                {!menuItem.vegetarian &&
                  !menuItem.nonVegetarian &&
                  !menuItem.vegan &&
                  !menuItem.glutenFree &&
                  !menuItem.spicy && (
                    <span className="text-gray-500 italic p-2">
                      No dietary information specified
                    </span>
                  )}
              </div>
            </div>
          </div>

          {/* Right Column - Image and Additional Info */}
          <div className="flex flex-col gap-6">
            {/* Image with enhanced presentation */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur-sm opacity-60 group-hover:opacity-80 transition duration-300"></div>
              <div className="relative h-80 rounded-xl overflow-hidden shadow-lg">
                {menuItem.imageUrl ? (
                  <img
                    src={menuItem.imageUrl}
                    alt={menuItem.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col items-center justify-center">
                    <HiOutlinePhotograph className="text-6xl text-gray-300 mb-4" />
                    <p className="text-gray-400 font-medium">No image available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Grocery specific information if applicable */}
            {menuItem.itemType === "GROCERY" && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-xl shadow-md border border-amber-200">
                <h4 className="font-semibold text-amber-800 mb-3 border-b pb-2 border-amber-200 flex items-center">
                  <span className="mr-2 text-xl">🛒</span>
                  Grocery Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-gray-500 text-sm mb-1">Quantity:</p>
                    <p className="font-semibold text-gray-800 text-lg">
                      {menuItem.quantity} {menuItem.unit?.toLowerCase()}
                    </p>
                  </div>
                  {menuItem.expiryDate && (
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-gray-500 text-sm mb-1 flex items-center">
                        <HiOutlineCalendar className="mr-1" />
                        Expires:
                      </p>
                      <p className="font-semibold text-gray-800 text-lg">
                        {new Date(menuItem.expiryDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Popularity score if available */}
            {menuItem.popularityScore !== undefined && (
              <div className="bg-white p-5 rounded-xl shadow-sm border border-purple-200 hover:shadow-md transition-shadow duration-300">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                  <span className="mr-2 text-xl">⭐</span>
                  Popularity
                </h4>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-4 mr-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full"
                      style={{ width: `${Math.min(100, menuItem.popularityScore * 10)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {menuItem.popularityScore}/10
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add-Ons Section with improved styling */}
        {menuItem.addOns && menuItem.addOns.length > 0 && (
          <div className="mt-10 pt-8 border-t-2 border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 pl-1">
              <div className="p-2 bg-indigo-100 rounded-full">
                <HiOutlinePlusCircle className="text-indigo-600 text-xl" />
              </div>
              Available Add-Ons
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {menuItem.addOns.map((addOn, index) => (
                <Card 
                  key={addOn.id || index} 
                  className="hover:shadow-lg transition-all duration-300 border border-gray-200 transform hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="text-lg font-semibold text-gray-800 mb-1">
                        {addOn.name}
                      </h5>
                      {addOn.description && (
                        <p className="text-sm text-gray-500 mb-3">
                          {addOn.description}
                        </p>
                      )}
                    </div>
                    <Badge 
                      color="success" 
                      className="font-medium px-3 py-1.5 text-sm bg-gradient-to-r from-green-500 to-emerald-500"
                    >
                      ${parseFloat(addOn.price).toFixed(2)}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                    {addOn.required && (
                      <Badge
                        color="indigo"
                        className="flex items-center gap-1 text-xs font-medium px-2.5 py-1"
                      >
                        <HiOutlineExclamation className="mr-1" />
                        Required
                      </Badge>
                    )}
                    {addOn.multiple && (
                      <Badge
                        color="info"
                        className="flex items-center gap-1 text-xs font-medium px-2.5 py-1"
                      >
                        <FaPlus className="mr-1" />
                        Multiple (Max: {addOn.maxQuantity || 1})
                      </Badge>
                    )}
                    {!addOn.available && (
                      <Badge
                        color="failure"
                        className="flex items-center gap-1 text-xs font-medium px-2.5 py-1"
                      >
                        <HiX className="mr-1" />
                        Unavailable
                      </Badge>
                    )}
                    {addOn.available && !addOn.required && !addOn.multiple && (
                      <Badge
                        color="gray"
                        className="flex items-center gap-1 text-xs font-medium px-2.5 py-1"
                      >
                        <HiCheck className="mr-1" />
                        Optional
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="border-t bg-gray-50">
        <Button
          color="gray"
          onClick={onClose}
          className="px-8 py-2.5 shadow-sm hover:shadow-md transition-all duration-300 font-medium rounded-lg hover:bg-gray-100"
          size="lg"
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}