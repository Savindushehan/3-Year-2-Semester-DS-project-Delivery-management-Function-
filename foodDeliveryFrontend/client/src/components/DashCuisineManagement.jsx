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
} from "react-icons/hi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactPaginate from "react-paginate";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaClipboardList,
  FaStore,
} from "react-icons/fa";
import { AiOutlineSearch } from "react-icons/ai";
import Select from "react-select";
import { cuisineTypeService } from "../service/cuisineService";
import { GiCook } from "react-icons/gi";
import { useSelector } from "react-redux";
import { CreateCuisineModal } from "./sub-components/cuisine-management/CreateCuisineModal";
import { UpdateCuisineModal } from "./sub-components/cuisine-management/UpdateCuisineModal";
import { ViewCuisineModal } from "./sub-components/cuisine-management/ViewCuisineModal";
import { ManageRestaurantsModal } from "./sub-components/cuisine-management/ManageRestaurantsModal";

export default function DashCuisineManagement() {
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [totalCuisines, setTotalCuisines] = useState(0);
  const [totalActiveCuisines, setTotalActiveCuisines] = useState(0);
  const [totalInactiveCuisines, setTotalInactiveCuisines] = useState(0);
  const [cuisines, setCuisines] = useState([]);
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedViewCuisine, setSelectedViewCuisine] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState(null);
  const [showManageRestaurantsModal, setShowManageRestaurantsModal] = useState(false);
  
  const handleUpdateClick = (cuisine) => {
    setSelectedCuisine(cuisine);
    setShowUpdateModal(true);
  };
  
  const handleManageRestaurantsClick = (cuisine) => {
    setSelectedCuisine(cuisine);
    setShowManageRestaurantsModal(true);
  };
  
  const fetchCuisines = async () => {
    setLoading(true);
    try {
      const response = await cuisineTypeService.getAllCuisineTypes(
        currentUser.token
      );
      const data = await response.json();
      if (response.status === 200) {
        setCuisines(data);
        setTotalCuisines(data.length);
        setTotalActiveCuisines(
          data.filter((cuisine) => cuisine.active).length
        );
        setTotalInactiveCuisines(
          data.filter((cuisine) => !cuisine.active).length
        );
        setLoading(false);
      }
      if (response.status === 404) {
        toast.error(data.message);
        setLoading(false);
      }
      if (response.status === 500) {
        toast.error(data.message);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      setError(error.message);
      toast.error("Something went wrong while fetching cuisines");
    }
  };

  useEffect(() => {
    fetchCuisines();
  }, [currentUser]);

  const [pageNumber, setPageNumber] = useState(0);
  const cuisinesPerPage = 7; // Increased from 5 to 7

  const pageCount = Math.ceil(cuisines.length / cuisinesPerPage);

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };

  const handleViewClick = (cuisine) => {
    setSelectedViewCuisine(cuisine);
    setShowViewModal(true);
  };
  
  // Filter cuisines based on search term
  const filteredCuisines = cuisines.filter(cuisine => 
    cuisine.name.toLowerCase().includes(search.toLowerCase())
  );

  const displayCuisines = filteredCuisines
    .slice(pageNumber * cuisinesPerPage, (pageNumber + 1) * cuisinesPerPage)
    .map((cuisine) => (
      <Table.Row 
        key={cuisine.id}
        className="bg-white dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <Table.Cell className="font-medium text-gray-900 dark:text-white">
          {cuisine.name}
          {cuisine.iconUrl && (
            <img 
              src={cuisine.iconUrl} 
              alt={cuisine.name} 
              className="w-6 h-6 rounded-full inline-block ml-2" 
            />
          )}
        </Table.Cell>
        <Table.Cell>
          <Button
            color="purple"
            size="sm"
            onClick={() => handleViewClick(cuisine)}
            className="flex items-center"
          >
            <HiEye className="mr-1" />
            View
          </Button>
        </Table.Cell>
        <Table.Cell>
          <div className="flex justify-center">
            <Badge
              color={cuisine.active ? "success" : "failure"}
              className="flex items-center justify-center px-3 py-1.5 rounded-lg"
            >
              {cuisine.active ? (
                <><FaCheckCircle className="mr-1" />Active</>
              ) : (
                <><FaTimesCircle className="mr-1" />Inactive</>
              )}
            </Badge>
          </div>
        </Table.Cell>

        <Table.Cell>
          <div className="flex justify-center">
            <Badge 
              color={cuisine.restaurants?.length > 0 ? "info" : "gray"}
              className="px-3 py-1.5 rounded-lg"
            >
              {cuisine.restaurants?.length || 0}
            </Badge>
          </div>
        </Table.Cell>

        <Table.Cell>
          <div className="flex items-center space-x-2">
            <Button
              color="success"
              size="sm"
              onClick={() => handleUpdateClick(cuisine)}
              className="flex items-center"
            >
              <FaClipboardList className="mr-1" />
              Edit
            </Button>
            <Button 
              color="purple"
              size="sm"
              onClick={() => handleManageRestaurantsClick(cuisine)}
              className="flex items-center"
            >
              <FaStore className="mr-1" />
              Restaurants
            </Button>
            <Button 
              color="failure" 
              size="sm"
              className="flex items-center"
            >
              <HiOutlineX className="mr-1" />
              Delete
            </Button>
          </div>
        </Table.Cell>
      </Table.Row>
    ));

  const handleCuisineCreated = () => {
    fetchCuisines();
    setShowCreateModal(false);
    toast.success("Cuisine created successfully!");
  };

  const handleCuisineUpdated = () => {
    fetchCuisines();
    setShowUpdateModal(false);
    toast.success("Cuisine updated successfully!");
  };

  const handleRestaurantsUpdated = () => {
    fetchCuisines();
    setShowManageRestaurantsModal(false);
  };

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
              Cuisine Management Dashboard
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium uppercase text-gray-500">Total Cuisines</p>
                    <h5 className="text-3xl font-bold text-gray-800 dark:text-white">{totalCuisines}</h5>
                  </div>
                  <div className="p-3 rounded-full bg-yellow-100">
                    <GiCook className="text-yellow-500 text-2xl" />
                  </div>
                </div>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium uppercase text-gray-500">Active Cuisines</p>
                    <h5 className="text-3xl font-bold text-green-600">{totalActiveCuisines}</h5>
                  </div>
                  <div className="p-3 rounded-full bg-green-100">
                    <GiCook className="text-green-500 text-2xl" />
                  </div>
                </div>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium uppercase text-gray-500">Inactive Cuisines</p>
                    <h5 className="text-3xl font-bold text-red-600">{totalInactiveCuisines}</h5>
                  </div>
                  <div className="p-3 rounded-full bg-red-100">
                    <GiCook className="text-red-500 text-2xl" />
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
                New Cuisine
              </Button>
              
              {/* Search Input */}
              <div className="flex-grow md:max-w-md">
                <TextInput
                  type="text"
                  placeholder="Search by cuisine name"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  rightIcon={AiOutlineSearch}
                  className="w-full"
                />
              </div>
              
              <div className="flex flex-wrap gap-4 ml-auto">
                {/* Cuisine selector */}
                <div className="w-48">
                  <Select
                    placeholder="Filter by cuisine"
                    isSearchable
                    options={cuisines.map(cuisine => ({
                      value: cuisine.id,
                      label: cuisine.name
                    }))}
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
                  onClick={() => {
                    setIsDownloading(true);
                    // Simulate report generation
                    setTimeout(() => {
                      setIsDownloading(false);
                      toast.success("Report downloaded successfully");
                    }, 1500);
                  }}
                  disabled={isDownloading}
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

          {/* Cuisine Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              {filteredCuisines.length > 0 ? (
                <Table hoverable striped className="min-w-full divide-y divide-gray-200">
                  <Table.Head className="bg-gray-100 dark:bg-gray-700">
                    <Table.HeadCell className="px-6 py-3">Name</Table.HeadCell>
                    <Table.HeadCell className="px-6 py-3">Details</Table.HeadCell>
                    <Table.HeadCell className="px-6 py-3">Status</Table.HeadCell>
                    <Table.HeadCell className="px-6 py-3">Restaurants</Table.HeadCell>
                    <Table.HeadCell className="px-6 py-3">Actions</Table.HeadCell>
                  </Table.Head>
                  <Table.Body className="divide-y">
                    {displayCuisines}
                  </Table.Body>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <HiOutlineExclamationCircle className="w-16 h-16 text-gray-400" />
                  <h2 className="mt-2 text-xl font-semibold text-gray-700">No Cuisines Found</h2>
                  <p className="text-gray-500 mt-1">No cuisines match your current search criteria.</p>
                </div>
              )}
            </div>
            
            {/* Pagination */}
            {filteredCuisines.length > 0 && (
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

          {/* Modals */}
          <CreateCuisineModal
            show={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleCuisineCreated}
            token={currentUser.token}
          />

          <UpdateCuisineModal
            show={showUpdateModal}
            onClose={() => setShowUpdateModal(false)}
            onSuccess={handleCuisineUpdated}
            cuisineData={selectedCuisine}
            token={currentUser.token}
          />

          <ViewCuisineModal
            show={showViewModal}
            onClose={() => setShowViewModal(false)}
            cuisineData={selectedViewCuisine}
          />

          <ManageRestaurantsModal
            show={showManageRestaurantsModal}
            onClose={() => setShowManageRestaurantsModal(false)}
            cuisineData={selectedCuisine}
            token={currentUser.token}
            onSuccess={handleRestaurantsUpdated}
          />
        </>
      )}
    </div>
  );
}