import React from "react";
import { useState, useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner";
import {
  Table,
  Button,
  TextInput,
  Badge,
  Modal,
  Spinner,
  Card,
} from "flowbite-react";
import {
  HiEye,
  HiOutlineX,
  HiOutlinePlus,
  HiDocumentReport,
  HiOutlineExclamationCircle,
  HiMail,
  HiPhone,
} from "react-icons/hi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactPaginate from "react-paginate";
import {
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaClipboardList,
  FaStore,
  FaPencilAlt,
  FaTrashAlt,
} from "react-icons/fa";
import { AiOutlineSearch } from "react-icons/ai";
import Select from "react-select";
import { CreateRestaurantModal } from "./sub-components/restaurant-management/CreateRestaurantModal";
import { useSelector } from "react-redux";
import { restaurantService } from "../service/restaurantService";
import { UpdateRestaurantModal } from "./sub-components/restaurant-management/UpdateRestaurantModal";
import { ViewRestaurantModal } from "./sub-components/restaurant-management/ViewRestaurantModal";

export default function DashRestaurantManagement() {
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [totalRestaurants, setTotalRestaurants] = useState(0);
  const [activeRestaurants, setActiveRestaurants] = useState(0);
  const [inactiveRestaurants, setInactiveRestaurants] = useState(0);
  const [viewModal, setViewModal] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedRestaurantForReport, setSelectedRestaurantForReport] =
    useState(null);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const response = await restaurantService.getAllRestaurants(
        currentUser.token
      );
      if (response.status === 200) {
        const data = await response.json();
        setTotalRestaurants(data.length);
        setActiveRestaurants(
          data.filter((restaurant) => restaurant.enabled).length
        );
        setInactiveRestaurants(
          data.filter((restaurant) => !restaurant.enabled).length
        );
        setRestaurants(data);
        setFilteredRestaurants(data);
        setLoading(false);
      } else {
        toast.error("Failed to fetch restaurants");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      toast.error("Error fetching restaurants");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchRestaurants();
    }
  }, [currentUser]);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredRestaurants(restaurants);
    } else {
      const filtered = restaurants.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(search.toLowerCase()) ||
          restaurant.email.toLowerCase().includes(search.toLowerCase()) ||
          restaurant.phoneNumber.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredRestaurants(filtered);
    }
  }, [search, restaurants]);

  const [pageNumber, setPageNumber] = useState(0);
  const restaurantsPerPage = 7; // Increased from 5 to 7

  const pageCount = Math.ceil(filteredRestaurants.length / restaurantsPerPage);

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };

  const handleRestaurantCreated = () => {
    fetchRestaurants();
    setShowCreateModal(false);
    toast.success("Restaurant created successfully", {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 2000,
    });
  };

  const handleDisplayViewModal = (restaurant) => {
    setViewModal(true);
    setSelectedRestaurant(restaurant);
  };

  const handleEditClick = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowUpdateModal(true);
  };

  const handleRestaurantUpdated = () => {
    fetchRestaurants();
    setShowUpdateModal(false);
    toast.success("Restaurant updated successfully");
  };

  const handleDeleteClick = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRestaurant) return;

    setIsDeleting(true);
    try {
      // This is a placeholder - implement actual delete logic
      // await restaurantService.deleteRestaurant(selectedRestaurant.id, currentUser.token);

      toast.success("Restaurant deleted successfully");
      fetchRestaurants();
    } catch (error) {
      toast.error("Failed to delete restaurant");
    } finally {
      setIsDeleting(false);
      setDeleteModal(false);
    }
  };

  const displayRestaurants = filteredRestaurants
    .slice(
      pageNumber * restaurantsPerPage,
      (pageNumber + 1) * restaurantsPerPage
    )
    .map((restaurant) => (
      <Table.Row
        key={restaurant?.id || restaurant?._id}
        className="bg-white dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
          <div className="flex items-center">
            {restaurant.restaurantImageUrl ? (
              <img
                src={restaurant.restaurantImageUrl}
                alt={restaurant.name}
                className="h-10 w-10 rounded-full mr-3 object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                <FaStore className="text-gray-500" />
              </div>
            )}
            <span>{restaurant.name}</span>
          </div>
        </Table.Cell>
        <Table.Cell>{restaurant.email}</Table.Cell>
        <Table.Cell>{restaurant.phoneNumber}</Table.Cell>
        <Table.Cell>
          <Button
            color="purple"
            size="sm"
            onClick={() => handleDisplayViewModal(restaurant)}
            className="flex items-center"
          >
            <HiEye className="mr-1" />
            View
          </Button>
        </Table.Cell>
        <Table.Cell>
          <div className="flex justify-center">
            <Badge
              color={restaurant.enabled ? "success" : "failure"}
              className="flex items-center justify-center px-3 py-1.5 rounded-lg"
            >
              {restaurant.enabled ? (
                <>
                  <FaCheckCircle className="mr-1" />
                  Active
                </>
              ) : (
                <>
                  <FaTimesCircle className="mr-1" />
                  Inactive
                </>
              )}
            </Badge>
          </div>
        </Table.Cell>
        <Table.Cell>
          <div className="flex items-center space-x-2">
            <Button
              color="success"
              size="sm"
              onClick={() => handleEditClick(restaurant)}
              className="flex items-center"
            >
              <FaPencilAlt className="mr-1" />
              Edit
            </Button>
            <Button
              color="failure"
              size="sm"
              onClick={() => handleDeleteClick(restaurant)}
              className="flex items-center"
            >
              <FaTrashAlt className="mr-1" />
              Delete
            </Button>
          </div>
        </Table.Cell>
      </Table.Row>
    ));

  return (
    <div className="px-4 py-6 max-w-screen-2xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              Restaurant Management Dashboard
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium uppercase text-gray-500">
                      Total Restaurants
                    </p>
                    <h5 className="text-3xl font-bold text-gray-800 dark:text-white">
                      {totalRestaurants}
                    </h5>
                  </div>
                  <div className="p-3 rounded-full bg-yellow-100">
                    <FaStore className="text-yellow-500 text-2xl" />
                  </div>
                </div>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium uppercase text-gray-500">
                      Active Restaurants
                    </p>
                    <h5 className="text-3xl font-bold text-green-600">
                      {activeRestaurants}
                    </h5>
                  </div>
                  <div className="p-3 rounded-full bg-green-100">
                    <FaStore className="text-green-500 text-2xl" />
                  </div>
                </div>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium uppercase text-gray-500">
                      Inactive Restaurants
                    </p>
                    <h5 className="text-3xl font-bold text-red-600">
                      {inactiveRestaurants}
                    </h5>
                  </div>
                  <div className="p-3 rounded-full bg-red-100">
                    <FaStore className="text-red-500 text-2xl" />
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* Create Button */}
              <Button
                gradientDuoTone="purpleToBlue"
                className="flex items-center"
                onClick={() => setShowCreateModal(true)}
              >
                <HiOutlinePlus className="mr-2 h-5 w-5" />
                New Restaurant
              </Button>

              {/* Search Input */}
              <div className="flex-grow md:max-w-md">
                <TextInput
                  type="text"
                  placeholder="Search by name, email or phone"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  rightIcon={AiOutlineSearch}
                  className="w-full"
                />
              </div>

              <div className="flex flex-wrap gap-4 ml-auto">
                {/* Restaurant selector */}
                <div className="w-48">
                  <Select
                    placeholder="Filter by restaurant"
                    isSearchable
                    isClearable
                    options={restaurants.map((restaurant) => ({
                      value: restaurant.id || restaurant._id,
                      label: restaurant.name,
                    }))}
                    onChange={(selected) =>
                      setSelectedRestaurantForReport(selected)
                    }
                    styles={{
                      control: (baseStyles) => ({
                        ...baseStyles,
                        backgroundColor: "white",
                        borderColor: "#D1D5DB",
                      }),
                      option: (baseStyles, { isFocused }) => ({
                        ...baseStyles,
                        backgroundColor: isFocused ? "#E5E7EB" : "white",
                        color: "black",
                      }),
                    }}
                  />
                </div>

                {/* Generate Report Button */}
                <Button
                  gradientDuoTone="cyanToBlue"
                  className="flex items-center"
                  onClick={async () => {
                    if (!selectedRestaurantForReport) {
                      toast.warning("Please select a restaurant first");
                      return;
                    }

                    setIsDownloading(true);
                    try {
                      const response =
                        await restaurantService.generateRestaurantReport(
                          selectedRestaurantForReport.value,
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
                        a.download = `restaurant-report-${selectedRestaurantForReport.label}.pdf`;
                        document.body.appendChild(a);
                        a.click();

                        // Clean up
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);

                        toast.success("Report downloaded successfully");
                      } else {
                        throw new Error(
                          `Failed to download report: ${response.status}`
                        );
                      }
                    } catch (error) {
                      console.error(error);
                      toast.error("Failed to download report");
                    } finally {
                      setIsDownloading(false);
                    }
                  }}
                  disabled={isDownloading || !selectedRestaurantForReport}
                >
                  {isDownloading ? (
                    <>
                      <Spinner className="mr-2" size="sm" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <HiDocumentReport className="mr-2 h-5 w-5" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Restaurants Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              {filteredRestaurants.length > 0 ? (
                <Table
                  hoverable
                  striped
                  className="min-w-full divide-y divide-gray-200"
                >
                  <Table.Head className="bg-gray-100 dark:bg-gray-700">
                    <Table.HeadCell className="px-6 py-3">Name</Table.HeadCell>
                    <Table.HeadCell className="px-6 py-3">Email</Table.HeadCell>
                    <Table.HeadCell className="px-6 py-3">Phone</Table.HeadCell>
                    <Table.HeadCell className="px-6 py-3">
                      Details
                    </Table.HeadCell>
                    <Table.HeadCell className="px-6 py-3">
                      Status
                    </Table.HeadCell>
                    <Table.HeadCell className="px-6 py-3">
                      Actions
                    </Table.HeadCell>
                  </Table.Head>
                  <Table.Body className="divide-y">
                    {displayRestaurants}
                  </Table.Body>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <HiOutlineExclamationCircle className="w-16 h-16 text-gray-400" />
                  <h2 className="mt-2 text-xl font-semibold text-gray-700">
                    No Restaurants Found
                  </h2>
                  <p className="text-gray-500 mt-1">
                    No restaurants match your current search criteria.
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {filteredRestaurants.length > 0 && (
              <div className="py-4 px-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <ReactPaginate
                  previousLabel={"Previous"}
                  nextLabel={"Next"}
                  pageCount={pageCount}
                  onPageChange={handlePageChange}
                  forcePage={pageNumber}
                  containerClassName="flex justify-center items-center space-x-1"
                  pageClassName="inline-flex"
                  pageLinkClassName="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                  previousLinkClassName="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                  nextLinkClassName="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                  activeLinkClassName="px-3 py-2 text-blue-600 border border-blue-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                  disabledLinkClassName="opacity-50 cursor-not-allowed"
                />
              </div>
            )}
          </Card>

          {/* Delete Confirmation Modal */}
          <Modal
            show={deleteModal}
            size="md"
            popup
            onClose={() => setDeleteModal(false)}
          >
            <Modal.Header />
            <Modal.Body>
              <div className="text-center">
                <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-red-500" />
                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                  Are you sure you want to delete this restaurant?
                  <p className="mt-2 text-sm font-semibold text-gray-800">
                    {selectedRestaurant?.name}
                  </p>
                </h3>
                <div className="flex justify-center gap-4">
                  <Button
                    color="failure"
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Yes, delete it"}
                  </Button>
                  <Button color="gray" onClick={() => setDeleteModal(false)}>
                    No, cancel
                  </Button>
                </div>
              </div>
            </Modal.Body>
          </Modal>

          {/* Other Modals */}
          <CreateRestaurantModal
            show={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleRestaurantCreated}
            token={currentUser.token}
          />

          <UpdateRestaurantModal
            show={showUpdateModal}
            onClose={() => setShowUpdateModal(false)}
            restaurant={selectedRestaurant}
            onSuccess={handleRestaurantUpdated}
            token={currentUser.token}
          />

          <ViewRestaurantModal
            show={viewModal}
            onClose={() => setViewModal(false)}
            restaurant={selectedRestaurant}
            token={currentUser.token}
          />
        </>
      )}
    </div>
  );
}
