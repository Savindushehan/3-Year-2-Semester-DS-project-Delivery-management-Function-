import React from "react";
import { Button, Label, Modal, Badge, Table } from "flowbite-react";
import {
  HiX,
  HiEye,
  HiOutlineInformationCircle,
  HiDocumentText,
  HiLocationMarker,
} from "react-icons/hi";
import { FaCheckCircle, FaTimesCircle, FaStore } from "react-icons/fa";
import { GiCook } from "react-icons/gi";

export const ViewCuisineModal = ({ show, onClose, cuisineData }) => {
  if (!cuisineData) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <Modal show={show} onClose={onClose} size="xxl" popup={false}>
      <Modal.Header className="border-b border-gray-200 bg-gray-50">
        <div className="flex items-center">
          <div className="p-2 bg-purple-100 rounded-full mr-3">
            <HiEye className="text-purple-600" size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            Cuisine Type Details
          </h3>
        </div>
      </Modal.Header>

      <Modal.Body className="px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Image and Basic Info */}
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center bg-gray-50 p-4 rounded-lg">
              <div className="w-48 h-48 mb-4">
                <img
                  src={
                    cuisineData.iconUrl ||
                    "https://via.placeholder.com/200?text=No+Image"
                  }
                  alt={cuisineData.name || "Cuisine"}
                  className="rounded-lg w-full h-full object-cover border-4 border-purple-100 shadow-md"
                />
              </div>
              <h2 className="text-xl font-bold text-center">
                {cuisineData.name}
              </h2>
              <Badge
                color={cuisineData.active ? "success" : "failure"}
                className="mt-2 px-3 py-1.5 text-sm font-medium"
              >
                {cuisineData.active ? (
                  <div className="flex items-center">
                    <FaCheckCircle className="mr-2" /> Active
                  </div>
                ) : (
                  <div className="flex items-center">
                    <FaTimesCircle className="mr-2" /> Inactive
                  </div>
                )}
              </Badge>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 flex items-center mb-2">
                <HiOutlineInformationCircle className="mr-2 text-purple-500" />{" "}
                Basic Info
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">ID:</span>
                  <span className="ml-2 font-medium">
                    {cuisineData.id || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Created:</span>
                  <span className="ml-2 font-medium">
                    {formatDate(cuisineData.createdAt)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Last Updated:</span>
                  <span className="ml-2 font-medium">
                    {formatDate(cuisineData.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column - Description and Stats */}
          <div className="space-y-4 md:col-span-2">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 flex items-center mb-2">
                <HiDocumentText className="mr-2 text-purple-500" /> Description
              </h3>
              <p className="text-gray-600 whitespace-pre-wrap">
                {cuisineData.description || "No description available."}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 flex items-center mb-3">
                <FaStore className="mr-2 text-purple-500" /> Associated
                Restaurants
              </h3>

              {cuisineData?.restaurants &&
              cuisineData?.restaurants.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <Table.Head>
                      <Table.HeadCell>Restaurant Name</Table.HeadCell>
                      <Table.HeadCell>Location</Table.HeadCell>
                      <Table.HeadCell>Status</Table.HeadCell>
                    </Table.Head>
                    <Table.Body className="divide-y">
                      {cuisineData?.restaurants.map((restaurant) => (
                        <Table.Row key={restaurant.id} className="bg-white">
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900">
                            <div className="flex items-center">
                              {restaurant.imageUrl && (
                                <img
                                  src={restaurant.imageUrl}
                                  alt={restaurant.name}
                                  className="w-8 h-8 rounded-full mr-2 object-cover"
                                />
                              )}
                              {restaurant.name}
                            </div>
                          </Table.Cell>
                          <Table.Cell>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${restaurant.latitude},${restaurant.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                              title="Open in Google Maps"
                            >
                              <HiLocationMarker className="mr-1" />
                              {restaurant.formattedAddress || "N/A"}
                            </a>
                          </Table.Cell>
                          <Table.Cell>
                            <Badge
                              color={restaurant.enabled ? "success" : "failure"}
                              className="px-2 py-1 text-xs"
                            >
                              {restaurant.enabled ? "Active" : "Inactive"}
                            </Badge>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No restaurants are currently associated with this cuisine
                  type.
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="border-t border-gray-200 bg-gray-50">
        <Button color="gray" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
