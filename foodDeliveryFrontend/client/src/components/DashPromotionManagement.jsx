import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  TextInput,
  Badge,
  Modal,
  Spinner,
  Alert,
  Tooltip
} from "flowbite-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactPaginate from "react-paginate";
import {
  FaPercent,
  FaTag,
  FaRegCalendarAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaPlusCircle,
  FaEdit,
  FaTrashAlt,
  FaStore,
  FaEye
} from "react-icons/fa";
import { AiOutlineSearch } from "react-icons/ai";
import { useSelector } from "react-redux";
import { promotionService } from "../service/promotionService";
import { restaurantService } from "../service/restaurantService";
import LoadingSpinner from "./LoadingSpinner";
import CreatePromotionModal from "./sub-components/promotion-management/CreatePromotionModal";
import UpdatePromotionModal from "./sub-components/promotion-management/UpdatePromotionModal";
import ViewPromotionModal from "./sub-components/promotion-management/ViewPromotionModal";

export default function DashPromotionManagement() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [promotions, setPromotions] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [totalPromotions, setTotalPromotions] = useState(0);
  const [activePromotions, setActivePromotions] = useState(0);
  const [expiredPromotions, setExpiredPromotions] = useState(0);
  const [search, setSearch] = useState("");
  const [filteredPromotions, setFilteredPromotions] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [promotionToDelete, setPromotionToDelete] = useState(null);
  const { currentUser } = useSelector((state) => state.user);

  const [pageNumber, setPageNumber] = useState(0);
  const promotionsPerPage = 5;

  useEffect(() => {
    if (currentUser?.token) {
      fetchRestaurantInfo();
    }
  }, [currentUser]);

  useEffect(() => {
    if (restaurant?.id) {
      fetchPromotions();
    }
  }, [restaurant]);

  useEffect(() => {
    if (promotions.length > 0) {
      const filtered = search
        ? promotions.filter(
            promo =>
              promo.code.toLowerCase().includes(search.toLowerCase()) ||
              promo.description.toLowerCase().includes(search.toLowerCase())
          )
        : promotions;
      setFilteredPromotions(filtered);
      setPageNumber(0);
    }
  }, [search, promotions]);

  const fetchRestaurantInfo = async () => {
    try {
      const response = await restaurantService.getRestaurantsByUserId(
        currentUser.id,
        currentUser.token
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setRestaurant(data[0]);
        } else {
          toast.info(
            "You don't have any restaurants assigned to you. Please contact the system administrator."
          );
        }
      } else {
        toast.error("Failed to fetch restaurant details");
      }
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      setError(error.message);
    }
  };

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const response = await promotionService.getPromotionsByRestaurantId(
        restaurant.id,
        currentUser.token
      );

      if (response.ok) {
        const data = await response.json();
        setPromotions(data);
        
        // Calculate statistics
        const now = new Date();
        const active = data.filter(
          promo => 
            new Date(promo.endDate) > now && 
            new Date(promo.startDate) <= now
        ).length;
        
        const expired = data.filter(
          promo => new Date(promo.endDate) < now
        ).length;
        
        setTotalPromotions(data.length);
        setActivePromotions(active);
        setExpiredPromotions(expired);
      } else {
        const errorText = await response.text();
        console.error("Failed to fetch promotions:", errorText);
        setPromotions([]);
      }
    } catch (error) {
      console.error("Error fetching promotions:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };

  const handleViewClick = (promotion) => {
    setSelectedPromotion(promotion);
    setShowViewModal(true);
  };

  const handleUpdateClick = (promotion) => {
    setSelectedPromotion(promotion);
    setShowUpdateModal(true);
  };

  const handleDeleteClick = (promotion) => {
    setPromotionToDelete(promotion);
    setDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!promotionToDelete) return;

    setIsDeleting(true);
    try {
      const response = await promotionService.deletePromotion(
        promotionToDelete.id,
        currentUser.token
      );

      if (response.ok) {
        toast.success("Promotion deleted successfully");
        fetchPromotions();
      } else {
        const errorText = await response.text();
        toast.error("Failed to delete promotion: " + errorText);
      }
    } catch (error) {
      toast.error("Error deleting promotion");
    } finally {
      setDeleteModal(false);
      setPromotionToDelete(null);
      setIsDeleting(false);
    }
  };

  const handlePromotionCreated = () => {
    setShowCreateModal(false);
    fetchPromotions();
    toast.success("Promotion created successfully");
  };

  const handlePromotionUpdated = () => {
    setShowUpdateModal(false);
    fetchPromotions();
    toast.success("Promotion updated successfully");
  };

  const getPromotionStatus = (promotion) => {
    // First, check if promotion has been manually deactivated
    if (promotion.active === false) {
      return { status: "inactive", label: "Inactive", color: "gray" };
    }
  
    // If not manually deactivated, check date-based status
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
  
    if (startDate > now) {
      return { status: "upcoming", label: "Upcoming", color: "warning" };
    } else if (endDate < now) {
      return { status: "expired", label: "Expired", color: "failure" };
    } else {
      return { status: "active", label: "Active", color: "success" };
    }
  };

  const pageCount = Math.ceil(filteredPromotions.length / promotionsPerPage);
  const displayedPromotions = filteredPromotions
    .slice(pageNumber * promotionsPerPage, (pageNumber + 1) * promotionsPerPage);

  if (loading && !restaurant) {
    return <LoadingSpinner />;
  }

  if (!restaurant) {
    return (
      <div className="p-4">
        <Alert color="info" icon={FaExclamationTriangle}>
          <span className="font-medium">No restaurant found!</span> You don't
          have any restaurants assigned to your account. Please contact the
          system administrator.
        </Alert>
      </div>
    );
  }

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      <ToastContainer />
      
      {/* Stats Cards */}
      <div className="p-3 md:mx-auto">
        <div className="flex-wrap flex gap-4 justify-center">
          <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
            <div className="flex justify-between">
              <div>
                <h3 className="text-gray-500 text-md uppercase">
                  Total Promotions
                </h3>
                <p className="text-2xl">{totalPromotions}</p>
              </div>
              <FaTag className="bg-blue-500 text-white text-5xl p-3 shadow-lg rounded-lg" />
            </div>
          </div>
          <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
            <div className="flex justify-between">
              <div>
                <h3 className="text-gray-500 text-md uppercase">
                  Active Promotions
                </h3>
                <p className="text-2xl">{activePromotions}</p>
              </div>
              <FaTag className="bg-green-500 text-white text-5xl p-3 shadow-lg rounded-lg" />
            </div>
          </div>
          <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
            <div className="flex justify-between">
              <div>
                <h3 className="text-gray-500 text-md uppercase">
                  Expired Promotions
                </h3>
                <p className="text-2xl">{expiredPromotions}</p>
              </div>
              <FaRegCalendarAlt className="bg-red-500 text-white text-5xl p-3 shadow-lg rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
              <FaStore className="mr-2 text-blue-600" />
              {restaurant.name} - Promotions & Discounts
            </h2>
          </div>
          <div>
            <Button
              outline
              gradientDuoTone="greenToBlue"
              onClick={() => setShowCreateModal(true)}
            >
              <FaPlusCircle className="mr-2" />
              Create Promotion
            </Button>
          </div>
        </div>

        <div className="w-full md:max-w-md">
          <TextInput
            type="text"
            placeholder="Search promotions by code or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            rightIcon={AiOutlineSearch}
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filteredPromotions.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <Table.Head>
              <Table.HeadCell>Code</Table.HeadCell>
              <Table.HeadCell>Description</Table.HeadCell>
              <Table.HeadCell>Discount</Table.HeadCell>
              <Table.HeadCell>Valid Period</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {displayedPromotions.map((promotion) => {
                const { status, label, color } = getPromotionStatus(promotion);
                return (
                  <Table.Row
                    key={promotion.id}
                    className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
                    <Table.Cell className="font-medium">
                      {promotion.code}
                    </Table.Cell>
                    <Table.Cell className="max-w-xs truncate">
                      <Tooltip content={promotion.description}>
                        {promotion.description}
                      </Tooltip>
                    </Table.Cell>
                    <Table.Cell>
                      {promotion.discountPercentage}%
                      <div className="text-xs text-gray-500">
                        (max ${promotion.maxDiscount})
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="text-xs">
                        <div className="mb-1">
                          Start: {new Date(promotion.startDate).toLocaleDateString()}
                        </div>
                        <div>
                          End: {new Date(promotion.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge
                        color={color}
                        className="px-2.5 py-1.5 rounded-full text-xs font-medium"
                      >
                        {label}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          color="purple"
                          onClick={() => handleViewClick(promotion)}
                        >
                          <FaEye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                        <Button
                          color="success"
                          size="sm"
                          outline
                          onClick={() => handleUpdateClick(promotion)}
                        >
                          <FaEdit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          color="failure"
                          size="sm"
                          outline
                          onClick={() => handleDeleteClick(promotion)}
                        >
                          <FaTrashAlt className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
          
          {filteredPromotions.length > 0 && pageCount > 1 && (
            <div className="py-4 mt-4 border-t border-gray-200 dark:border-gray-700">
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
                activeLinkClassName="!bg-blue-50 !text-blue-600 !border-blue-300 dark:!bg-gray-700 dark:!text-white"
                disabledLinkClassName="opacity-50 cursor-not-allowed"
                breakLabel="..."
                breakLinkClassName="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-10">
          <div className="inline-block p-3 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
            <FaTag size={30} className="text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            No promotions found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {search ? 
              "No promotions match your search." : 
              "This restaurant doesn't have any promotions yet."}
          </p>
          <Button
            gradientDuoTone="greenToBlue"
            className="mt-4"
            onClick={() => setShowCreateModal(true)}
          >
            <FaPlusCircle className="mr-2" />
            Create First Promotion
          </Button>
        </div>
      )}

      {/* Modals */}
      <CreatePromotionModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handlePromotionCreated}
        restaurantId={restaurant.id}
        token={currentUser.token}
      />

      {selectedPromotion && (
        <>
          <UpdatePromotionModal
            show={showUpdateModal}
            onClose={() => setShowUpdateModal(false)}
            onSuccess={handlePromotionUpdated}
            promotion={selectedPromotion}
            token={currentUser.token}
          />
          <ViewPromotionModal
            show={showViewModal}
            onClose={() => setShowViewModal(false)}
            promotion={selectedPromotion}
          />
        </>
      )}

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
            <FaExclamationTriangle className="mx-auto mb-4 h-14 w-14 text-red-500" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this promotion?
            </h3>
            <div className="flex justify-center gap-4">
              <Button
                color="failure"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Deleting...
                  </>
                ) : (
                  "Yes, delete it"
                )}
              </Button>
              <Button color="gray" onClick={() => setDeleteModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}