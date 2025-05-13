import React, { useState, useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner";
import {
  Table,
  Button,
  TextInput,
  Badge,
  Modal,
  Spinner,
  Alert,
} from "flowbite-react";
import { HiEye, HiOutlineX, HiInformationCircle } from "react-icons/hi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactPaginate from "react-paginate";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaClipboardList,
  FaStore,
  FaListUl,
  FaSort,
  FaExclamationTriangle,
} from "react-icons/fa";
import { AiOutlineSearch } from "react-icons/ai";
import { menuCategoryService } from "../service/menuCategoryService";
import { restaurantService } from "../service/restaurantService";
import { useSelector } from "react-redux";
import { CreateCategoryModal } from "./sub-components/menu-item-category-management/CreateCategoryModal";
import { UpdateCategoryModal } from "./sub-components/menu-item-category-management/UpdateCategoryModal";
import { ViewCategoryModal } from "./sub-components/menu-item-category-management/ViewCategoryModal";
import { ReorderCategoriesModal } from "./sub-components/menu-item-category-management/ReorderCategoriesModal";

export default function DashMenuItemCategoryManagement() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [myRestaurant, setMyRestaurant] = useState(null);
  const [totalCategories, setTotalCategories] = useState(0);
  const [activeCategories, setActiveCategories] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const { currentUser } = useSelector((state) => state.user);

  const [pageNumber, setPageNumber] = useState(0);
  const categoriesPerPage = 5;

  useEffect(() => {
    if (currentUser?.token) {
      fetchMyRestaurant();
    }
  }, [currentUser]);

  useEffect(() => {
    if (myRestaurant?.id) {
      fetchCategories(myRestaurant.id);
    }
  }, [myRestaurant, search]);

  const fetchMyRestaurant = async () => {
    try {
      setLoading(true);
      const response = await restaurantService.getRestaurantsByUserId(
        currentUser.id,
        currentUser.token
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const restaurant = data[0];
          setMyRestaurant(restaurant);
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
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async (restaurantId) => {
    setLoading(true);
    try {
      const response = await menuCategoryService.getCategoriesByRestaurantId(
        restaurantId,
        currentUser.token
      );

      if (response.ok) {
        const data = await response.json();

        // Filter categories if search term exists
        const filteredData = search
          ? data.filter((cat) =>
              cat.name.toLowerCase().includes(search.toLowerCase())
            )
          : data;

        setCategories(filteredData);
        setTotalCategories(filteredData.length);
        setActiveCategories(filteredData.filter((cat) => cat.active).length);
      } else {
        toast.error("Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError(error.message);
      toast.error("Error loading categories");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryCreated = () => {
    if (myRestaurant?.id) {
      fetchCategories(myRestaurant.id);
    }
  };

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };

  const handleViewClick = (category) => {
    setSelectedCategory(category);
    setShowViewModal(true);
  };

  const handleUpdateClick = (category) => {
    setSelectedCategory(category);
    setShowUpdateModal(true);
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setDeleteModal(true);
  };

  const handleReorderClick = () => {
    if (myRestaurant?.id) {
      setShowReorderModal(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);
    try {
      const response = await menuCategoryService.deleteCategory(
        categoryToDelete.id,
        currentUser.token
      );

      if (response.ok) {
        toast.success("Category deleted successfully");
        fetchCategories(myRestaurant.id);
      } else {
        toast.error("Failed to delete category");
      }
    } catch (error) {
      toast.error("Error deleting category");
    } finally {
      setDeleteModal(false);
      setCategoryToDelete(null);
      setIsDeleting(false);
    }
  };

  const pageCount = Math.ceil(categories.length / categoriesPerPage);

  const displayCategories = categories
    .slice(pageNumber * categoriesPerPage, (pageNumber + 1) * categoriesPerPage)
    .map((category) => (
      <Table.Row
        key={category.id}
        className="bg-white dark:border-gray-700 dark:bg-gray-800"
      >
        <Table.Cell>{category.name}</Table.Cell>
        <Table.Cell>{category.description || "No description"}</Table.Cell>
        <Table.Cell>
          <Badge
            color={category.active ? "success" : "failure"}
            style={{
              fontSize: "1.2rem",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {category.active ? (
              <FaCheckCircle color="green" size={20} />
            ) : (
              <FaTimesCircle color="red" size={20} />
            )}
          </Badge>
        </Table.Cell>
        <Table.Cell className="text-center">
          {category.displayOrder || "Not set"}
        </Table.Cell>
        <Table.Cell>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              color="purple"
              onClick={() => handleViewClick(category)}
            >
              <HiEye className="mr-2 h-5 w-5" />
              View
            </Button>
            <Button
              color="green"
              size="sm"
              outline
              onClick={() => handleUpdateClick(category)}
            >
              <FaClipboardList className="mr-2 h-5 w-5" />
              Update
            </Button>
            <Button
              color="failure"
              size="sm"
              outline
              onClick={() => handleDeleteClick(category)}
            >
              <HiOutlineX className="mr-2 h-5 w-5" />
              Delete
            </Button>
          </div>
        </Table.Cell>
      </Table.Row>
    ));

  if (loading && !myRestaurant) {
    return <LoadingSpinner />;
  }

  if (!myRestaurant) {
    return (
      <div className="p-4">
        <Alert color="info" icon={HiInformationCircle}>
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
      <>
        <div className="p-3 md:mx-auto">
          <div className="flex-wrap flex gap-4 justify-center">
            <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-gray-500 text-md uppercase">
                    Total Categories
                  </h3>
                  <p className="text-2xl">{totalCategories}</p>
                </div>
                <FaListUl className="bg-yellow-500 text-white text-5xl p-3 shadow-lg rounded-lg" />
              </div>
            </div>
            <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-gray-500 text-md uppercase">
                    Active Categories
                  </h3>
                  <p className="text-2xl">{activeCategories}</p>
                </div>
                <FaListUl className="bg-green-500 text-white text-5xl p-3 shadow-lg rounded-lg" />
              </div>
            </div>
            <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-gray-500 text-md uppercase">
                    Inactive Categories
                  </h3>
                  <p className="text-2xl">
                    {totalCategories - activeCategories}
                  </p>
                </div>
                <FaListUl className="bg-red-500 text-white text-5xl p-3 shadow-lg rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FaStore className="mr-2 text-blue-600" />
                {myRestaurant.name} - Menu Categories
              </h2>
            </div>
            <div className="flex gap-4">
              <Button
                outline
                gradientDuoTone="greenToBlue"
                onClick={() => setShowCreateModal(true)}
              >
                Add New Category
              </Button>

              <Button
                outline
                color="blue"
                onClick={handleReorderClick}
                disabled={categories.length < 2}
              >
                <FaSort className="mr-2" />
                Reorder Categories
              </Button>
            </div>
          </div>

          <div className="w-full md:max-w-md">
            <TextInput
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              rightIcon={AiOutlineSearch}
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : categories.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <Table.Head>
                <Table.HeadCell>Name</Table.HeadCell>
                <Table.HeadCell>Description</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
                <Table.HeadCell>Display Order</Table.HeadCell>
                <Table.HeadCell>Actions</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">{displayCategories}</Table.Body>
            </Table>
            {categories.length > 0 && pageCount > 1 && (
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
            <div className="inline-block p-3 bg-gray-100 rounded-full mb-4">
              <FaListUl size={30} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              No menu categories found
            </h3>
            <p className="text-gray-500 mt-2">
              {search
                ? "No categories match your search."
                : "This restaurant doesn't have any menu categories yet."}
            </p>
            <Button
              gradientDuoTone="greenToBlue"
              className="mt-4"
              onClick={() => setShowCreateModal(true)}
            >
              Add First Category
            </Button>
          </div>
        )}

        {/* Modals */}
        <CreateCategoryModal
          show={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCategoryCreated}
          token={currentUser.token}
          restaurantId={myRestaurant.id}
        />

        {selectedCategory && (
          <>
            <UpdateCategoryModal
              show={showUpdateModal}
              onClose={() => setShowUpdateModal(false)}
              onSuccess={() => fetchCategories(myRestaurant.id)}
              categoryData={selectedCategory}
              token={currentUser.token}
            />
            <ViewCategoryModal
              show={showViewModal}
              onClose={() => setShowViewModal(false)}
              categoryData={selectedCategory}
              token={currentUser.token}
            />
          </>
        )}

        {showReorderModal && (
          <ReorderCategoriesModal
            show={showReorderModal}
            onClose={() => setShowReorderModal(false)}
            onSuccess={() => fetchCategories(myRestaurant.id)}
            restaurantId={myRestaurant.id}
            restaurantName={myRestaurant.name}
            categories={categories}
            token={currentUser.token}
          />
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
                Are you sure you want to delete this category?
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
      </>
    </div>
  );
}
