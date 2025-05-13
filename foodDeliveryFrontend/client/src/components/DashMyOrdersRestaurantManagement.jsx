import React, { useState, useEffect } from "react";
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
} from "flowbite-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  HiOutlineRefresh,
  HiOutlineSearch,
  HiOutlineEye,
  HiFilter,
  HiInformationCircle,
  HiOutlineSortAscending,
  HiOutlineSortDescending,
  HiCheck,
  HiX,
  HiOutlineClock,
  HiOutlineClipboardCheck,
  HiOutlineClipboardList,
  HiOutlineTruck,
  HiOutlineLocationMarker,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineUser,
} from "react-icons/hi";
import {
  FaReceipt,
  FaShoppingBag,
  FaUtensils,
  FaRegCalendarAlt,
  FaMoneyBillWave,
} from "react-icons/fa";
import { orderService } from "../service/orderService";
import { restaurantService } from "../service/restaurantService";
import ReactPaginate from "react-paginate";
import LoadingSpinner from "./LoadingSpinner";
import UpdateOrderStatusDropdown from "./sub-components/order-management/UpdateOrderStatusDropdown";
import OrderStatusTimeline from "./sub-components/order-management/OrderStatusTimeline";

export default function DashMyOrdersRestaurantManagement() {
  const { currentUser } = useSelector((state) => state.user);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [currentTab, setCurrentTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [pageNumber, setPageNumber] = useState(0);
  const itemsPerPage = 5;
  
  // Order status counts
  const [totalOrders, setTotalOrders] = useState(0);
  const [activeOrders, setActiveOrders] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);

  // Status workflows and display configs
  const statusWorkflow = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["PREPARING", "CANCELLED"],
    PREPARING: ["READY_FOR_PICKUP", "CANCELLED"],
    READY_FOR_PICKUP: ["OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"],
    OUT_FOR_DELIVERY: ["DELIVERED", "CANCELLED"],
    DELIVERED: [],
    CANCELLED: [],
  };

  const statusColors = {
    PENDING: "warning",
    CONFIRMED: "info",
    PREPARING: "purple",
    READY_FOR_PICKUP: "success",
    OUT_FOR_DELIVERY: "indigo",
    DELIVERED: "success",
    CANCELLED: "failure",
  };

  const statusIcons = {
    PENDING: <HiOutlineClock className="mr-1" />,
    CONFIRMED: <HiOutlineClipboardCheck className="mr-1" />,
    PREPARING: <FaUtensils className="mr-1" />,
    READY_FOR_PICKUP: <HiOutlineClipboardList className="mr-1" />,
    OUT_FOR_DELIVERY: <HiOutlineTruck className="mr-1" />,
    DELIVERED: <HiCheck className="mr-1" />,
    CANCELLED: <HiX className="mr-1" />,
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleString("en-US", options);
  };

  // Calculate total pages for pagination
  const pageCount = Math.ceil(filteredOrders.length / itemsPerPage);
  const displayOrders = filteredOrders.slice(
    pageNumber * itemsPerPage,
    (pageNumber + 1) * itemsPerPage
  );

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };

  // Fetch restaurant information and then orders
  useEffect(() => {
    if (currentUser?.token) {
      fetchRestaurant();
    }
  }, [currentUser]);

  // Fetch orders when restaurant ID is available
  useEffect(() => {
    if (restaurant?.id && currentUser?.token) {
      fetchOrders();
    }
  }, [restaurant]);

  // Filter orders when tab changes or search term changes
  useEffect(() => {
    filterOrders();
  }, [orders, currentTab, searchTerm]);

  const fetchRestaurant = async () => {
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
          setError("No restaurant found for your account");
        }
      } else {
        setError("Failed to fetch restaurant details");
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrdersByRestaurantId(
        restaurant.id,
        currentUser.token
      );

      if (response.ok) {
        const data = await response.json();
        // Sort by date desc by default
        const sortedOrders = data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sortedOrders);
        setFilteredOrders(sortedOrders);
        setTotalOrders(sortedOrders.length);
        
        // Calculate active and completed orders
        const active = sortedOrders.filter(order => 
          ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'].includes(order.status)
        ).length;
        setActiveOrders(active);
        
        const completed = sortedOrders.filter(order => 
          order.status === 'DELIVERED'
        ).length;
        setCompletedOrders(completed);
        
      } else {
        throw new Error("Failed to fetch orders");
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
      toast.error(`Failed to load orders: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    if (!orders.length) return;
    
    let result = [...orders];

    // Filter by tab/status
    if (currentTab !== "all") {
      if (currentTab === "active") {
        result = result.filter((order) =>
          [
            "PENDING",
            "CONFIRMED",
            "PREPARING",
            "READY_FOR_PICKUP",
            "OUT_FOR_DELIVERY",
          ].includes(order.status)
        );
      } else if (currentTab === "completed") {
        result = result.filter((order) => order.status === "DELIVERED");
      } else if (currentTab === "cancelled") {
        result = result.filter((order) => order.status === "CANCELLED");
      } else {
        // Filter by specific status
        result = result.filter((order) => order.status === currentTab);
      }
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (order) =>
          order.id.toLowerCase().includes(search) ||
          order.contactInfo.name.toLowerCase().includes(search) ||
          order.contactInfo.phone.includes(search) ||
          order.status.toLowerCase().includes(search) ||
          (order.deliveryAddress &&
            `${order.deliveryAddress.street} ${order.deliveryAddress.city}`
              .toLowerCase()
              .includes(search))
      );
    }

    // Sort by date
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    setFilteredOrders(result);
    setPageNumber(0); // Reset to first page when filters change
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setCurrentTab("all");
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Handle status update from the separate component
  const handleStatusUpdated = (orderId, newStatus) => {
    // Update orders list
    const updatedOrders = orders.map((order) =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);

    // Update selected order if needed
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }

    // Update counts after status change
    const active = updatedOrders.filter(order => 
      ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'].includes(order.status)
    ).length;
    setActiveOrders(active);
    
    const completed = updatedOrders.filter(order => 
      order.status === 'DELIVERED'
    ).length;
    setCompletedOrders(completed);
  };

  // Order status badge component for consistency
  const OrderStatusBadge = ({ status }) => (
    <Badge color={statusColors[status] || "gray"} className="whitespace-nowrap">
      {statusIcons[status]}
      {status.replace("_", " ")}
    </Badge>
  );

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
                  Total Orders
                </h3>
                <p className="text-2xl">{totalOrders}</p>
              </div>
              <FaReceipt className="bg-blue-500 text-white text-5xl p-3 shadow-lg rounded-lg" />
            </div>
          </div>
          <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
            <div className="flex justify-between">
              <div>
                <h3 className="text-gray-500 text-md uppercase">
                  Active Orders
                </h3>
                <p className="text-2xl">{activeOrders}</p>
              </div>
              <HiOutlineClock className="bg-yellow-500 text-white text-5xl p-3 shadow-lg rounded-lg" />
            </div>
          </div>
          <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
            <div className="flex justify-between">
              <div>
                <h3 className="text-gray-500 text-md uppercase">
                  Completed Orders
                </h3>
                <p className="text-2xl">{completedOrders}</p>
              </div>
              <HiCheck className="bg-green-500 text-white text-5xl p-3 shadow-lg rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Header and Filters */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
              <FaReceipt className="mr-2 text-blue-600" />
              {restaurant.name} - Orders Management
            </h2>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Button
              outline
              gradientDuoTone="purpleToBlue"
              onClick={fetchOrders}
              disabled={loading}
              className="w-full md:w-auto"
            >
              <HiOutlineRefresh className={`mr-2 h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              Refresh Orders
            </Button>
          </div>
        </div>

        {/* Enhanced Filter Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="col-span-1 md:col-span-2">
            <TextInput
              type="text"
              placeholder="Search orders by ID, customer name, phone..."
              value={searchTerm}
              onChange={handleSearchChange}
              icon={HiOutlineSearch}
              className="w-full"
            />
          </div>

          <div className="flex gap-2">
            <Dropdown
              label={
                <div className="flex items-center">
                  <HiFilter className="mr-2" />
                  {currentTab === "all"
                    ? "All Orders"
                    : currentTab === "active"
                    ? "Active Orders"
                    : currentTab === "completed"
                    ? "Completed Orders"
                    : currentTab === "cancelled"
                    ? "Cancelled Orders"
                    : `${currentTab} Orders`}
                </div>
              }
              color="light"
              className="w-full"
            >
              <Dropdown.Item onClick={() => setCurrentTab("all")}>
                All Orders
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={() => setCurrentTab("active")}>
                Active Orders
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setCurrentTab("PENDING")}>
                {statusIcons["PENDING"]} Pending Orders
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setCurrentTab("CONFIRMED")}>
                {statusIcons["CONFIRMED"]} Confirmed Orders
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setCurrentTab("PREPARING")}>
                {statusIcons["PREPARING"]} Preparing Orders
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setCurrentTab("READY_FOR_PICKUP")}>
                {statusIcons["READY_FOR_PICKUP"]} Ready For Pickup
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setCurrentTab("OUT_FOR_DELIVERY")}>
                {statusIcons["OUT_FOR_DELIVERY"]} Out For Delivery
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={() => setCurrentTab("completed")}>
                {statusIcons["DELIVERED"]} Completed Orders
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setCurrentTab("cancelled")}>
                {statusIcons["CANCELLED"]} Cancelled Orders
              </Dropdown.Item>
            </Dropdown>

            <Button
              color="light"
              onClick={toggleSortOrder}
              className="whitespace-nowrap"
            >
              {sortOrder === "desc" ? (
                <HiOutlineSortDescending className="mr-1" />
              ) : (
                <HiOutlineSortAscending className="mr-1" />
              )}
              {sortOrder === "desc" ? "Newest" : "Oldest"}
            </Button>

            {(searchTerm || currentTab !== "all") && (
              <Button color="light" onClick={resetFilters}>
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Orders Display Section */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <Table.Head>
                  <Table.HeadCell>Customer</Table.HeadCell>
                  <Table.HeadCell>Date</Table.HeadCell>
                  <Table.HeadCell>Total</Table.HeadCell>
                  <Table.HeadCell>Status</Table.HeadCell>
                  <Table.HeadCell>Actions</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {displayOrders.map((order) => (
                    <Table.Row
                      key={order.id}
                      className="bg-white dark:border-gray-700 dark:bg-gray-800"
                    >
                      <Table.Cell>
                        <div className="flex flex-col">
                          <span>{order.contactInfo.name}</span>
                          <span className="text-xs text-gray-500">
                            {order.contactInfo.phone}
                          </span>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="whitespace-nowrap">
                          {formatDate(order.createdAt)}
                        </div>
                      </Table.Cell>
                      <Table.Cell className="font-medium">
                        ${order.total.toFixed(2)}
                      </Table.Cell>
                      <Table.Cell>
                        <OrderStatusBadge status={order.status} />
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="xs"
                            color="info"
                            onClick={() => openOrderDetails(order)}
                          >
                            <HiOutlineEye className="mr-1 h-4 w-4" />
                            View
                          </Button>

                          {/* Using our new component here */}
                          <UpdateOrderStatusDropdown 
                            order={order}
                            statusWorkflow={statusWorkflow}
                            statusIcons={statusIcons}
                            statusColors={statusColors}
                            token={currentUser.token}
                            onStatusUpdated={handleStatusUpdated}
                            size="xs"
                          />
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>

              {/* ReactPaginate Pagination - Style matching menu items */}
              {filteredOrders.length > itemsPerPage && (
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
                <FaReceipt
                  size={30}
                  className="text-gray-400 dark:text-gray-500"
                />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                No orders found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                {searchTerm || currentTab !== "all"
                  ? "No orders match your filter criteria."
                  : "Your restaurant hasn't received any orders yet."}
              </p>
              {(searchTerm || currentTab !== "all") && (
                <Button color="light" className="mt-4" onClick={resetFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <Modal
          show={isModalOpen}
          size="3xl"
          onClose={() => setIsModalOpen(false)}
          dismissible
        >
          <Modal.Header className="text-xl">
            Order Details #{selectedOrder.id.substring(0, 8)}...
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-6">
              {/* Order Status and Actions with new visual timeline */}
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Current Status
                    </div>
                    <OrderStatusBadge status={selectedOrder.status} />
                  </div>

                  {/* Use our new component with showAsButton=true for better modal appearance */}
                  <UpdateOrderStatusDropdown 
                    order={selectedOrder}
                    statusWorkflow={statusWorkflow}
                    statusIcons={statusIcons}
                    statusColors={statusColors}
                    token={currentUser.token}
                    onStatusUpdated={handleStatusUpdated}
                    size="sm"
                    showAsButton={true}
                  />
                </div>
                
                {/* Visual timeline of order status */}
                <div className="mt-4 mb-2 relative pt-6 pb-2">
                  <OrderStatusTimeline status={selectedOrder.status} />
                </div>
              </div>

              {/* Order Info and Customer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <h5 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white mb-2 flex items-center">
                    <FaRegCalendarAlt className="mr-2" />
                    Order Information
                  </h5>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 dark:text-gray-400">
                        Order ID:
                      </span>
                      <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {selectedOrder.id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        Date:
                      </span>
                      <span>{formatDate(selectedOrder.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        Payment Method:
                      </span>
                      <Badge color="purple" className="capitalize">
                        <FaMoneyBillWave className="mr-1" />
                        {selectedOrder.paymentMethod}
                      </Badge>
                    </div>
                    {selectedOrder.promotionCode && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">
                          Promotion Code:
                        </span>
                        <Badge color="success">
                          {selectedOrder.promotionCode}
                        </Badge>
                      </div>
                    )}
                  </div>
                </Card>

                <Card>
                  <h5 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white mb-2 flex items-center">
                    <HiOutlineUser className="mr-2" />
                    Customer Information
                  </h5>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <HiOutlineUser className="text-gray-500" />
                      <span>{selectedOrder.contactInfo.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiOutlinePhone className="text-gray-500" />
                      <span>{selectedOrder.contactInfo.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiOutlineMail className="text-gray-500" />
                      <span>{selectedOrder.contactInfo.email}</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Delivery Address */}
              <Card>
                <h5 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white mb-2 flex items-center">
                  <HiOutlineLocationMarker className="mr-2" />
                  Delivery Address
                </h5>
                <div className="text-sm">
                  <div>{selectedOrder.deliveryAddress.street}</div>
                  <div>
                    {selectedOrder.deliveryAddress.city},{" "}
                    {selectedOrder.deliveryAddress.state}{" "}
                    {selectedOrder.deliveryAddress.zipCode}
                  </div>
                </div>
                {selectedOrder.deliveryInstructions && (
                  <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                    <div className="font-medium">Delivery Instructions:</div>
                    <div className="italic">
                      {selectedOrder.deliveryInstructions}
                    </div>
                  </div>
                )}
              </Card>

              {/* Order Items */}
              <Card>
                <h5 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white mb-2 flex items-center">
                  <FaShoppingBag className="mr-2" />
                  Order Items
                </h5>
                <div className="overflow-x-auto">
                  <Table hoverable>
                    <Table.Head>
                      <Table.HeadCell>Item</Table.HeadCell>
                      <Table.HeadCell>Price</Table.HeadCell>
                      <Table.HeadCell>Quantity</Table.HeadCell>
                      <Table.HeadCell>Total</Table.HeadCell>
                    </Table.Head>
                    <Table.Body className="divide-y">
                      {selectedOrder.items.map((item, index) => (
                        <Table.Row key={index}>
                          <Table.Cell className="font-medium">
                            {item.name}
                          </Table.Cell>
                          <Table.Cell>${item.price.toFixed(2)}</Table.Cell>
                          <Table.Cell>{item.quantity}</Table.Cell>
                          <Table.Cell className="font-medium">
                            ${item.itemTotal.toFixed(2)}
                          </Table.Cell>
                        </Table.Row>
                      ))}
                      {selectedOrder.items.some(
                        (item) => item.addOns && item.addOns.length > 0
                      ) && (
                        <Table.Row>
                          <Table.Cell
                            colSpan={4}
                            className="bg-gray-50 dark:bg-gray-700 text-sm"
                          >
                            Add-ons included in item prices
                          </Table.Cell>
                        </Table.Row>
                      )}
                    </Table.Body>
                  </Table>
                </div>

                {/* Order Summary */}
                <div className="mt-4 border-t pt-4 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Subtotal:
                    </span>
                    <span>${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Tax:
                    </span>
                    <span>${selectedOrder.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Delivery Fee:
                    </span>
                    <span>${selectedOrder.deliveryFee.toFixed(2)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                      <span>Discount:</span>
                      <span>-${selectedOrder.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg mt-1 pt-1 border-t border-gray-200 dark:border-gray-700">
                    <span>Total:</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      ${selectedOrder.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              gradientDuoTone="purpleToBlue" 
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}