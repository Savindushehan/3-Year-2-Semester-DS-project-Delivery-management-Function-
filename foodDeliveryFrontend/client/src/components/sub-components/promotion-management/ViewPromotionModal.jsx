import React from "react";
import { Modal, Button, Badge, Card } from "flowbite-react";
import {
  FaTag,
  FaPercent,
  FaCalendarAlt,
  FaInfoCircle,
  FaDollarSign,
  FaShoppingCart,
  FaUserCheck,
  FaHashtag,
  FaEye,
} from "react-icons/fa";

export default function ViewPromotionModal({ show, onClose, promotion }) {
  if (!promotion) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = () => {
    // First, check if promotion has been manually deactivated
    if (promotion.active === false) {
      return (
        <Badge color="gray" className="px-3 py-1.5 text-sm font-medium">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-gray-400 mr-1.5"></div>
            Inactive
          </div>
        </Badge>
      );
    }

    // If not manually deactivated, check date-based status
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);

    if (startDate > now) {
      return (
        <Badge color="warning" className="px-3 py-1.5 text-sm font-medium">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-yellow-300 mr-1.5 animate-pulse"></div>
            Upcoming
          </div>
        </Badge>
      );
    } else if (endDate < now) {
      return (
        <Badge color="failure" className="px-3 py-1.5 text-sm font-medium">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></div>
            Expired
          </div>
        </Badge>
      );
    } else {
      return (
        <Badge color="success" className="px-3 py-1.5 text-sm font-medium">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-400 mr-1.5 animate-pulse"></div>
            Active
          </div>
        </Badge>
      );
    }
  };
  return (
    <Modal show={show} onClose={onClose} size="3xl">
      <Modal.Header className="bg-gradient-to-r from-blue-500 to-indigo-600">
        <div className="text-white flex items-center">
          <FaEye className="mr-2" />
          <span className="font-bold">Promotion Details</span>
        </div>
      </Modal.Header>
      <Modal.Body className="space-y-6 max-h-[80vh] overflow-y-auto">
        <div className="space-y-6">
          {/* Header with Code and Status */}
          <Card className="border-0 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-2xl font-bold flex items-center">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg mr-3">
                  <FaHashtag
                    className="text-blue-600 dark:text-blue-400"
                    size={24}
                  />
                </div>
                <span className="text-gray-800 dark:text-white">
                  {promotion.code}
                </span>
              </div>
              <div>{getStatusBadge()}</div>
            </div>
          </Card>

          {/* Description */}
          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-start">
              <FaInfoCircle
                className="mt-1 mr-3 text-blue-500 flex-shrink-0"
                size={16}
              />
              <p className="text-gray-700 dark:text-gray-300">
                {promotion.description}
              </p>
            </div>
          </div>

          {/* Discount and Validity sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-800 dark:text-white">
                <FaPercent className="mr-2 text-green-600" />
                Discount Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
                    <FaPercent
                      className="text-green-600 dark:text-green-400"
                      size={12}
                    />
                  </div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    Discount:
                  </span>
                  <span className="text-xl ml-2 font-bold text-green-600 dark:text-green-400">
                    {promotion.discountPercentage}%
                  </span>
                </div>
                <div className="flex items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
                    <FaDollarSign
                      className="text-green-600 dark:text-green-400"
                      size={12}
                    />
                  </div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    Max Discount:
                  </span>
                  <span className="text-xl ml-2 font-bold text-gray-800 dark:text-gray-200">
                    ${promotion.maxDiscount.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
                    <FaShoppingCart
                      className="text-green-600 dark:text-green-400"
                      size={12}
                    />
                  </div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    Min Order:
                  </span>
                  <span className="ml-2 text-gray-800 dark:text-gray-200">
                    ${promotion.minOrderAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="shadow-sm">
              <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-800 dark:text-white">
                <FaCalendarAlt className="mr-2 text-indigo-600" />
                Validity Period
              </h3>
              <div className="space-y-3">
                <div className="flex flex-col border-b border-gray-200 dark:border-gray-700 pb-2">
                  <div className="flex items-center mb-1">
                    <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mr-3">
                      <FaCalendarAlt
                        className="text-indigo-600 dark:text-indigo-400"
                        size={12}
                      />
                    </div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      Starts:
                    </span>
                  </div>
                  <div className="ml-11 text-gray-800 dark:text-gray-200">
                    {formatDate(promotion.startDate)}
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center mb-1">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mr-3">
                      <FaCalendarAlt
                        className="text-red-600 dark:text-red-400"
                        size={12}
                      />
                    </div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      Ends:
                    </span>
                  </div>
                  <div className="ml-11 text-gray-800 dark:text-gray-200">
                    {formatDate(promotion.endDate)}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Usage Limits and How to Use sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-800 dark:text-white">
                <FaShoppingCart className="mr-2 text-orange-600" />
                Usage Limits
              </h3>
              <div className="space-y-3">
                <div className="flex items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mr-3">
                    <FaHashtag
                      className="text-orange-600 dark:text-orange-400"
                      size={12}
                    />
                  </div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    Maximum Uses:
                  </span>
                  <span className="ml-2 text-gray-800 dark:text-gray-200">
                    {promotion.maxUses} times
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mr-3">
                    <FaUserCheck
                      className="text-orange-600 dark:text-orange-400"
                      size={12}
                    />
                  </div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    One Time Use Per User:
                  </span>
                  <span className="ml-2 text-gray-800 dark:text-gray-200">
                    {promotion.oneTimeUsePerUser ? (
                      <Badge color="success" className="ml-1">
                        Yes
                      </Badge>
                    ) : (
                      <Badge color="gray" className="ml-1">
                        No
                      </Badge>
                    )}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="shadow-sm">
              <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-800 dark:text-white">
                <FaUserCheck className="mr-2 text-purple-600" />
                How to Use
              </h3>
              <div className="space-y-3">
                <p className="text-gray-700 dark:text-gray-300">
                  Customers can apply this code during checkout for orders above
                  ${promotion.minOrderAmount.toFixed(2)}.
                </p>
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border-l-4 border-blue-500 flex flex-col">
                  <span className="font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Promo Code:
                  </span>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {promotion.code}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="flex justify-between">
        <div></div> {/* Empty div for spacing */}
        <Button
          gradientDuoTone="purpleToBlue"
          onClick={onClose}
          className="px-6"
        >
          <FaEye className="mr-2" />
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
