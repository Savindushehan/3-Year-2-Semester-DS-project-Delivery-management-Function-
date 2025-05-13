import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  Button,
  Card,
  Spinner,
  Table,
  Badge,
  TextInput,
  Dropdown,
  Alert,
  Modal,
  Tooltip,
} from "flowbite-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  HiPlusCircle,
  HiOutlineSearch,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineEye,
  HiFilter,
  HiInformationCircle,
  HiOutlineDownload,
  HiOutlineDocumentReport,
} from "react-icons/hi";
import {
  FaUtensils,
  FaStar,
  FaListAlt,
  FaEye,
  FaDollarSign,
  FaFileDownload,
  FaFileExcel,
  FaFilePdf,
  FaFileCsv,
} from "react-icons/fa";
import { restaurantService } from "../service/restaurantService";
import ReactPaginate from "react-paginate";
import ViewMenuItemModal from "./sub-components/menu-item-management/ViewMenuItemModal";
import CreateMenuItemModal from "./sub-components/menu-item-management/CreateMenuItemModal";
import { menuCategoryService } from "../service/menuCategoryService";
import { menuItemService } from "../service/menuItemService";
import DeleteMenuItemModal from "./sub-components/menu-item-management/DeleteMenuItemModal";
import UpdateMenuItemModal from "./sub-components/menu-item-management/UpdateMenuItemModal";
import LoadingSpinner from "./LoadingSpinner";

export default function DashMenuItems() {
  const { currentUser } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [categories, setCategories] = useState([]);
  const [pageNumber, setPageNumber] = useState(0);
  const [totalMenuItems, setTotalMenuItems] = useState(0);
  const [availableItems, setAvailableItems] = useState(0);
  const [downloadFormat, setDownloadFormat] = useState("csv");
  const [downloadLoading, setDownloadLoading] = useState(false);
  const itemsPerPage = 5;

  const pageCount = Math.ceil(filteredMenuItems.length / itemsPerPage);
  const displayMenuItems = filteredMenuItems.slice(
    pageNumber * itemsPerPage,
    (pageNumber + 1) * itemsPerPage
  );

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };

  // Fetch the restaurant associated with the current user
  useEffect(() => {
    if (currentUser?.token) {
      fetchUserRestaurant();
    }
  }, [currentUser]);

  // Fetch menu items when restaurant is loaded
  useEffect(() => {
    if (restaurant) {
      fetchMenuItems();
      fetchCategories();
    }
  }, [restaurant]);

  // Apply filters and search - Optimized with useMemo
  const filterMenuItems = useMemo(() => {
    if (!menuItems || !menuItems.length) return [];

    let results = [...menuItems];

    // Apply search
    if (search.trim()) {
      results = results.filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          (item.description &&
            item.description.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Apply category filter
    if (categoryFilter) {
      results = results.filter((item) => item.categoryId === categoryFilter);
    }

    // Apply availability filter
    if (availabilityFilter === "available") {
      results = results.filter((item) => item.available);
    } else if (availabilityFilter === "unavailable") {
      results = results.filter((item) => !item.available);
    }

    return results;
  }, [menuItems, search, categoryFilter, availabilityFilter]);

  // Update filtered items when filters change
  useEffect(() => {
    setFilteredMenuItems(filterMenuItems);
    setPageNumber(0); // Reset to first page when filters change
  }, [filterMenuItems]);

  const fetchUserRestaurant = async () => {
    try {
      setLoading(true);
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
        toast.error("Failed to fetch restaurant information");
      }
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    if (!restaurant?.id) return;

    setLoading(true);
    try {
      const response = await menuItemService.getMenuItemsByRestaurantId(
        restaurant.id,
        currentUser.token
      );
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data || []);
        setFilteredMenuItems(data || []);
        setTotalMenuItems(data?.length || 0);
        setAvailableItems(data?.filter((item) => item.available)?.length || 0);
      } else {
        const errorData = await response.json();
        toast.warning(errorData.error || "No menu items found");
        setMenuItems([]);
        setFilteredMenuItems([]);
        setTotalMenuItems(0);
        setAvailableItems(0);
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
      toast.error(`Error fetching menu items: ${error.message}`);
      setMenuItems([]);
      setFilteredMenuItems([]);
      setTotalMenuItems(0);
      setAvailableItems(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    if (!restaurant?.id || !currentUser?.token) return;

    try {
      const response = await menuCategoryService.getCategoriesByRestaurantId(
        restaurant.id,
        currentUser.token
      );

      if (response.ok) {
        const data = await response.json();

        // If we have categories, use them
        if (data && data.length > 0) {
          setCategories(data);
        } else {
          // No categories found
          setCategories([]);
          toast.info(
            "No menu categories found for this restaurant. Create some categories first."
          );
        }
      } else {
        // Handle error response
        const errorData = await response.json();
        console.error("Failed to fetch categories:", errorData);
        setCategories([]);
        toast.warning("Failed to load menu categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
      toast.error("Error loading menu categories");
    }
  };

  const handleCreateMenuItem = () => {
    setShowCreateModal(true);
  };

  const handleViewMenuItem = (menuItem) => {
    setSelectedMenuItem(menuItem);
    setShowViewModal(true);
  };

  const handleEditMenuItem = (menuItem) => {
    setSelectedMenuItem(menuItem);
    setShowUpdateModal(true);
  };

  const handleDeleteMenuItem = (menuItem) => {
    setSelectedMenuItem(menuItem);
    setShowDeleteModal(true);
  };

  const handleMenuItemCreated = () => {
    setShowCreateModal(false);
    fetchMenuItems();
    toast.success("Menu item created successfully");
  };

  const handleMenuItemUpdated = () => {
    setShowUpdateModal(false);
    fetchMenuItems();
    toast.success("Menu item updated successfully");
  };

  const confirmDelete = async () => {
    if (!selectedMenuItem) return;

    try {
      const response = await menuItemService.deleteMenuItem(
        selectedMenuItem.id,
        currentUser.token
      );

      if (response.ok) {
        toast.success("Menu item deleted successfully");
        fetchMenuItems();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to delete menu item");
      }
    } catch (error) {
      console.error("Error deleting menu item:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setShowDeleteModal(false);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("");
    setAvailabilityFilter("");
  };

  // New function to handle download modal
  const handleDownloadClick = () => {
    setShowDownloadModal(true);
  };

  // Download functionality - Simulated with a delay
  const handleDownload = async () => {
    try {
      setDownloadLoading(true);
      
      // Get items to download - either filtered or all
      const itemsToExport = filteredMenuItems.length > 0 ? filteredMenuItems : menuItems;
      
      // Get category name for the file name
      let categoryName = "all-menu-items";
      if (categoryFilter) {
        const selectedCategory = categories.find(c => c.id === categoryFilter);
        if (selectedCategory) {
          categoryName = selectedCategory.name.toLowerCase().replace(/\s+/g, '-');
        }
      }

      // Create filename based on restaurant, category and format
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `${restaurant?.name || 'restaurant'}-${categoryName}-${timestamp}.${downloadFormat}`;
      
      // Simulate download process with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Format data based on selected format
      let fileContent = '';
      let fileType = '';
      let dataUri = '';
      
      if (downloadFormat === 'csv') {
        // Create CSV content
        const headers = 'Name,Price,Category,Description,Availability\n';
        const rows = itemsToExport.map(item => {
          const category = categories.find(c => c.id === item.categoryId)?.name || 'Uncategorized';
          return `"${item.name}",${item.price},"${category}","${item.description || ''}",${item.available ? 'Available' : 'Unavailable'}`;
        }).join('\n');
        
        fileContent = headers + rows;
        fileType = 'text/csv';
      } else if (downloadFormat === 'json') {
        // Create JSON with category names included
        const formattedData = itemsToExport.map(item => ({
          ...item,
          categoryName: categories.find(c => c.id === item.categoryId)?.name || 'Uncategorized'
        }));
        
        fileContent = JSON.stringify(formattedData, null, 2);
        fileType = 'application/json';
      }
      
      // Create download link
      dataUri = `data:${fileType};charset=utf-8,${encodeURIComponent(fileContent)}`;
      
      // Create temporary link element and trigger download
      const link = document.createElement('a');
      link.href = dataUri;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Menu items exported successfully as ${downloadFormat.toUpperCase()}`);
      setShowDownloadModal(false);
    } catch (error) {
      console.error("Error exporting menu items:", error);
      toast.error(`Export failed: ${error.message}`);
    } finally {
      setDownloadLoading(false);
    }
  };

  if (loading && !restaurant) {
    return <LoadingSpinner />;
  }

  if (!restaurant) {
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
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Stats Cards */}
      <div className="p-3 md:mx-auto">
        <div className="flex-wrap flex gap-4 justify-center">
          <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
            <div className="flex justify-between">
              <div>
                <h3 className="text-gray-500 text-md uppercase">
                  Total Menu Items
                </h3>
                <p className="text-2xl">{totalMenuItems}</p>
              </div>
              <FaUtensils className="bg-yellow-500 text-white text-5xl p-3 shadow-lg rounded-lg" />
            </div>
          </div>
          <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
            <div className="flex justify-between">
              <div>
                <h3 className="text-gray-500 text-md uppercase">
                  Available Items
                </h3>
                <p className="text-2xl">{availableItems}</p>
              </div>
              <FaUtensils className="bg-green-500 text-white text-5xl p-3 shadow-lg rounded-lg" />
            </div>
          </div>
          <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
            <div className="flex justify-between">
              <div>
                <h3 className="text-gray-500 text-md uppercase">
                  Unavailable Items
                </h3>
                <p className="text-2xl">{totalMenuItems - availableItems}</p>
              </div>
              <FaUtensils className="bg-red-500 text-white text-5xl p-3 shadow-lg rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Header and Actions */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
              <FaUtensils className="mr-2 text-blue-600" />
              {restaurant.name} - Menu Items
            </h2>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Button
              outline
              gradientDuoTone="greenToBlue"
              onClick={handleCreateMenuItem}
              className="w-full md:w-auto"
            >
              <HiPlusCircle className="mr-2 h-5 w-5" />
              Add New Item
            </Button>
            
            {/* New Download Button */}
            <Button
              outline
              gradientDuoTone="purpleToBlue"
              onClick={handleDownloadClick}
              className="w-full md:w-auto"
              disabled={!menuItems.length}
            >
              <HiOutlineDownload className="mr-2 h-5 w-5" />
              Export Menu
            </Button>
          </div>
        </div>

        {/* Improved Filter Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="col-span-1 md:col-span-3 lg:col-span-1">
            <TextInput
              type="text"
              placeholder="Search menu items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={HiOutlineSearch}
              className="w-full"
            />
          </div>

          <div className="flex gap-2 col-span-1 md:col-span-2 lg:col-span-1">
            <Dropdown
              label={
                <div className="flex items-center">
                  <HiFilter className="mr-2" />
                  {categoryFilter
                    ? `Category: ${
                        categories.find((c) => c.id === categoryFilter)?.name ||
                        "Selected"
                      }`
                    : "Filter by Category"}
                </div>
              }
              color="light"
              className="w-full"
            >
              <Dropdown.Item onClick={() => setCategoryFilter("")}>
                All Categories
              </Dropdown.Item>
              <Dropdown.Divider />
              {categories.map((category) => (
                <Dropdown.Item
                  key={category.id}
                  onClick={() => setCategoryFilter(category.id)}
                >
                  {category.name}
                </Dropdown.Item>
              ))}
            </Dropdown>
            <Dropdown
              label={
                <div className="flex items-center">
                  <HiFilter className="mr-2" />
                  {availabilityFilter === "available"
                    ? "Available Items"
                    : availabilityFilter === "unavailable"
                    ? "Unavailable Items"
                    : "Filter by Availability"}
                </div>
              }
              color="light"
              className="w-full md:w-auto"
            >
              <Dropdown.Item onClick={() => setAvailabilityFilter("")}>
                All Items
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={() => setAvailabilityFilter("available")}>
                Available Only
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => setAvailabilityFilter("unavailable")}
              >
                Unavailable Only
              </Dropdown.Item>
            </Dropdown>
          </div>

          <div className="flex flex-wrap gap-2 col-span-1 md:col-span-3 lg:col-span-1">
            {(search || categoryFilter || availabilityFilter) && (
              <Button
                color="light"
                onClick={resetFilters}
                className="w-full md:w-auto mt-2 md:mt-0"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Menu Items Table */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {filteredMenuItems.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <Table.Head>
                  <Table.HeadCell>Image</Table.HeadCell>
                  <Table.HeadCell>Name</Table.HeadCell>
                  <Table.HeadCell>Price</Table.HeadCell>
                  <Table.HeadCell>Category</Table.HeadCell>
                  <Table.HeadCell>Status</Table.HeadCell>
                  <Table.HeadCell>Actions</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {displayMenuItems.map((item) => (
                    <Table.Row
                      key={item.id}
                      className="bg-white dark:border-gray-700 dark:bg-gray-800"
                    >
                      <Table.Cell>
                        <div className="h-14 w-14 rounded-md overflow-hidden">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                              <FaUtensils className="text-gray-400" />
                            </div>
                          )}
                        </div>
                      </Table.Cell>
                      <Table.Cell className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </Table.Cell>
                      <Table.Cell>${item.price?.toFixed(2) || "0.00"}</Table.Cell>
                      <Table.Cell>
                        {categories.find((c) => c.id === item.categoryId)
                          ?.name || "Uncategorized"}
                      </Table.Cell>
                      <Table.Cell>
                        <Badge
                          color={item.available ? "success" : "failure"}
                          style={{
                            fontSize: "1rem",
                            padding: "0.4rem 0.8rem",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {item.available ? "Available" : "Unavailable"}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            color="purple"
                            onClick={() => handleViewMenuItem(item)}
                          >
                            <HiOutlineEye className="mr-1 h-4 w-4" />
                            View
                          </Button>
                          <Button
                            color="green"
                            size="sm"
                            outline
                            onClick={() => handleEditMenuItem(item)}
                          >
                            <HiOutlinePencilAlt className="mr-1 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            color="failure"
                            size="sm"
                            outline
                            onClick={() => handleDeleteMenuItem(item)}
                          >
                            <HiOutlineTrash className="mr-1 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>

              {/* Pagination */}
              {filteredMenuItems.length > 0 && pageCount > 1 && (
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
              
              {/* Download summary card */}
              <Card className="mt-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div>
                    <h3 className="text-lg font-medium">Menu Export Options</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      Export your menu items in different formats for inventory, printing or integrations
                    </p>
                  </div>
                  <Button 
                    gradientDuoTone="purpleToBlue"
                    onClick={handleDownloadClick}
                    className="w-full sm:w-auto"
                  >
                    <HiOutlineDownload className="mr-2 h-5 w-5" />
                    Export Menu Items
                  </Button>
                </div>
              </Card>
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="inline-block p-3 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                <FaUtensils
                  size={30}
                  className="text-gray-400 dark:text-gray-500"
                />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                No menu items found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                {search || categoryFilter || availabilityFilter
                  ? "No items match your filter criteria."
                  : "This restaurant doesn't have any menu items yet."}
              </p>
              <Button
                gradientDuoTone="greenToBlue"
                className="mt-4"
                onClick={handleCreateMenuItem}
              >
                <HiPlusCircle className="mr-2" />
                Add First Menu Item
              </Button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <CreateMenuItemModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleMenuItemCreated}
        restaurantId={restaurant.id}
        token={currentUser.token}
        categories={categories}
      />

      <ViewMenuItemModal
        show={showViewModal}
        onClose={() => setShowViewModal(false)}
        menuItem={selectedMenuItem}
        categoryName={
          selectedMenuItem &&
          categories.find((c) => c.id === selectedMenuItem?.categoryId)?.name
        }
      />

      <DeleteMenuItemModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        menuItem={selectedMenuItem}
        onConfirm={confirmDelete}
        isDeleting={false}
      />

      <UpdateMenuItemModal
        show={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onSuccess={handleMenuItemUpdated}
        menuItem={selectedMenuItem}
        token={currentUser.token}
        categories={categories}
      />
      
      {/* Download Modal */}
      <Modal
        show={showDownloadModal}
        onClose={() => !downloadLoading && setShowDownloadModal(false)}
        dismissible={!downloadLoading}
      >
        <Modal.Header>
          Export Menu Items
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <p className="text-gray-700 dark:text-gray-300">
              Export your menu items to use in other applications or for record keeping.
              {categoryFilter && (
                <span className="block mt-2 font-medium">
                  Currently exporting items from category: {categories.find(c => c.id === categoryFilter)?.name || "Selected Category"}
                </span>
              )}
            </p>
            
            {/* Export format selection */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Select export format:
              </label>
              <div className="flex flex-wrap gap-4 mt-3">
                <div 
                  className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors
                    ${downloadFormat === 'csv' 
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30' 
                      : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'}
                  `}
                  onClick={() => setDownloadFormat('csv')}
                >
                  <FaFileCsv size={24} className={downloadFormat === 'csv' ? 'text-blue-600' : 'text-gray-500'} />
                  <div>
                    <div className={`font-medium ${downloadFormat === 'csv' ? 'text-blue-600 dark:text-blue-400' : ''}`}>CSV Format</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Compatible with Excel, Google Sheets</div>
                  </div>
                </div>
                
                <div 
                  className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors
                    ${downloadFormat === 'json' 
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30' 
                      : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'}
                  `}
                  onClick={() => setDownloadFormat('json')}
                >
                  <FaFileDownload size={24} className={downloadFormat === 'json' ? 'text-blue-600' : 'text-gray-500'} />
                  <div>
                    <div className={`font-medium ${downloadFormat === 'json' ? 'text-blue-600 dark:text-blue-400' : ''}`}>JSON Format</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">For developers and API integrations</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats summary */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Export Summary</h4>
              <ul className="space-y-1 text-sm">
                <li className="flex justify-between">
                  <span>Items to export:</span>
                  <span className="font-medium">{filteredMenuItems.length || menuItems.length}</span>
                </li>
                <li className="flex justify-between">
                  <span>Categories included:</span>
                  <span className="font-medium">
                    {categoryFilter ? '1' : categories.length || '0'}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Format:</span>
                  <span className="font-medium uppercase">{downloadFormat}</span>
                </li>
              </ul>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            gradientDuoTone="purpleToBlue"
            onClick={handleDownload}
            disabled={downloadLoading}
          >
            {downloadLoading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Preparing Download...
              </>
            ) : (
              <>
                <HiOutlineDownload className="mr-2 h-5 w-5" />
                Download {downloadFormat.toUpperCase()}
              </>
            )}
          </Button>
          <Button 
            color="gray" 
            onClick={() => setShowDownloadModal(false)}
            disabled={downloadLoading}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}