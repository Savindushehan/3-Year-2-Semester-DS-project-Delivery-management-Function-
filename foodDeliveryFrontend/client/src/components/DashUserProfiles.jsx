import {
  Badge,
  Button,
  Modal,
  Select,
  Spinner,
  Table,
  TextInput,
  Card,
  Avatar,
} from "flowbite-react";
import { useEffect, useState } from "react";
import {
  HiEye,
  HiOutlineExclamationCircle,
  HiOutlineUserGroup,
  HiOutlineX,
  HiChartPie,
  HiClock,
  HiDocumentReport,
  HiOutlinePlus,
  HiOutlineRefresh,
  HiLocationMarker,
  HiPhone,
  HiMail,
  HiOutlineOfficeBuilding,
} from "react-icons/hi";
import { useSelector } from "react-redux";
import {
  FaCheck,
  FaCheckCircle,
  FaClipboardList,
  FaTimes,
  FaTimesCircle,
  FaUserTie,
  FaUtensils,
  FaStore,
} from "react-icons/fa";
import ReactSelect from "react-select";
import { ToastContainer, toast } from "react-toastify";
import { authService } from "../service/authService";
import { restaurantService } from "../service/restaurantService";
import { RiGovernmentLine } from "react-icons/ri";
import { AiOutlineSearch } from "react-icons/ai";
import LoadingSpinner from "./LoadingSpinner";
import ReactPaginate from "react-paginate";
import { UserDetailsModal } from "./sub-components/user-management/UserDetailsModal";
import { CreateUserModal } from "./sub-components/user-management/CreateUserModal";
import { UpdateUserModal } from "./sub-components/user-management/UpdateUserModal";
import { reportService } from "../service/userReportService";

export default function DashUserProfiles() {
  const { currentUser } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [totalUsers, setTotalUser] = useState(0);
  const [totalActiveUsers, setTotalActiveUsers] = useState(0);
  const [totalInActiveUsers, setTotalInActiveUsers] = useState(0);
  const [userToShow, setUserToShow] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserForReport, setSelectedUserForReport] = useState(null);
  const [userSelectOptions, setUserSelectOptions] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);

  // New state for restaurant-related features
  const [showRestaurantModal, setShowRestaurantModal] = useState(false);
  const [userRestaurants, setUserRestaurants] = useState([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [selectedUserForRestaurant, setSelectedUserForRestaurant] =
    useState(null);

  const fetchUser = async () => {
    try {
      const res = await authService.getAllUsers(currentUser.token);
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
        setFilteredUsers(data);
        // Calculate stats
        setTotalUser(data.length);
        const enabledUsers = data.filter((user) => user.enabled);
        setTotalActiveUsers(enabledUsers.length);
        const disabledUsers = data.filter((user) => user.disabled);
        setTotalInActiveUsers(disabledUsers.length);
      } else if (res.status === 401) {
        toast.error(data.message || "Unauthorized access");
      } else if (res.status === 500) {
        toast.error(data.message || "Internal server error");
      } else if (res.status === 400) {
        toast.error(data.message || "Bad request");
      }
    } catch (error) {
      console.log(error.message);
      toast.error("Error fetching users");
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setPageNumber(0);

    if (term.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.username?.toLowerCase().includes(term.toLowerCase()) ||
          user.email?.toLowerCase().includes(term.toLowerCase()) ||
          user.phoneNumber?.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  // Function to fetch restaurants by admin ID
  const fetchRestaurantsByAdmin = async (userId) => {
    setLoadingRestaurants(true);
    try {
      const response = await restaurantService.getAllRestaurants(
        currentUser.token
      );

      if (response.ok) {
        const data = await response.json();

        // Convert userId to string for proper comparison with adminIds array
        const userIdString = userId.toString();

        // Filter restaurants by checking if userId (as string) is in the adminIds array
        const userRestaurantsList = data.filter(
          (restaurant) =>
            restaurant.adminIds && restaurant.adminIds.includes(userIdString)
        );

        setUserRestaurants(userRestaurantsList);

        // For debugging - remove in production
        console.log("User ID:", userIdString);
        console.log("Filtered restaurants:", userRestaurantsList);
      } else {
        toast.error("Failed to fetch assigned restaurants");
        setUserRestaurants([]);
      }
    } catch (error) {
      toast.error("Error fetching restaurant data");
      setUserRestaurants([]);
    } finally {
      setLoadingRestaurants(false);
    }
  };
  
  const handleViewRestaurants = async (user) => {
    setSelectedUserForRestaurant(user);
    setShowRestaurantModal(true);
    await fetchRestaurantsByAdmin(user.id);
  };

  const extractUniqueRoles = (usersArray) => {
    const allRoles = new Set();

    usersArray.forEach((user) => {
      if (user.roles && Array.isArray(user.roles)) {
        user.roles.forEach((role) => {
          allRoles.add(role.replace("ROLE_", ""));
        });
      }
    });

    return Array.from(allRoles).map((role) => ({
      value: role,
      label: role,
    }));
  };

  const filterUsersByRole = (role) => {
    if (!role) {
      return users.map((user) => ({
        value: user.id,
        label: `${user.id} - ${user.username}`,
      }));
    }

    const filteredByRole = users.filter(
      (user) =>
        user.roles &&
        user.roles.some(
          (userRole) => userRole.replace("ROLE_", "") === role.value
        )
    );

    return filteredByRole.map((user) => ({
      value: user.id,
      label: `${user.id} - ${user.username}`,
    }));
  };

  const handleRoleChange = (option) => {
    setSelectedRole(option);
    setSelectedUserForReport(null);
  };

  useEffect(() => {
    if (currentUser?.roles?.[0] === "ROLE_ADMIN") {
      fetchUser();
      setLoading(false);
    }
  }, [currentUser]);

  const [pageNumber, setPageNumber] = useState(0);
  const userPerPage = 7; // Increased from 5 to 7

  const pageCount = Math.ceil(filteredUsers.length / userPerPage);

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };

  const handleViewMore = (user) => {
    setShowMore(true);
    setUserToShow(user);
    setShowModal(true);
  };

  const handleUserCreated = () => {
    fetchUser();
    setShowCreateModal(false);
    toast.success("User created successfully!");
  };

  const [selectedUser, setSelectedUser] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const handleUpdateClick = (user) => {
    setSelectedUser(user);
    setShowUpdateModal(true);
  };

  const handleUserUpdated = () => {
    fetchUser();
    setShowUpdateModal(false);
    setSelectedUser(null);
    toast.success("User updated successfully!");
  };

  useEffect(() => {
    if (users.length > 0) {
      const roleOpts = extractUniqueRoles(users);
      setRoleOptions(roleOpts);

      const userOpts = filterUsersByRole(selectedRole);
      setUserSelectOptions(userOpts);
    }
  }, [users, selectedRole]);

  const handleDownloadReport = async () => {
    if (!selectedUserForReport) {
      toast.error("Please select a user first");
      return;
    }

    setIsDownloading(true);
    try {
      const userId = selectedUserForReport.value;
      const pdfBlob = await reportService.generateUserReport(
        userId,
        currentUser.token
      );
      await reportService.downloadPdfReport(
        pdfBlob,
        `user-report-${userId}.pdf`
      );
      toast.success(
        `Report for ${selectedUserForReport.label} downloaded successfully`
      );
    } catch (error) {
      toast.error(
        "Failed to download report: " + (error.message || "Unknown error")
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRoleReport = async () => {
    if (!selectedRole) {
      toast.error("Please select a role first");
      return;
    }

    setIsDownloading(true);
    try {
      const roleName = `ROLE_${selectedRole.value}`;
      const pdfBlob = await reportService.generateRoleBasedReport(
        roleName,
        currentUser.token
      );
      await reportService.downloadPdfReport(pdfBlob, `Report-${roleName}.pdf`);
      toast.success(
        `Report for ${selectedRole.label} role generated successfully`
      );
    } catch (error) {
      toast.error(
        "Failed to generate role report: " + (error.message || "Unknown error")
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // Check if a user has the restaurant admin role
  const isRestaurantAdmin = (user) => {
    return user?.roles?.some((role) => role === "ROLE_RESTAURANT_ADMIN");
  };

  const displayUsers = filteredUsers
    .slice(pageNumber * userPerPage, (pageNumber + 1) * userPerPage)
    .map((user) => (
      <Table.Body className="divide-y" key={user.id}>
        <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
          <Table.Cell className="flex items-center space-x-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 dark:text-white truncate">
                {user.username}
              </p>
              {user.firstName && user.lastName && (
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {user.firstName} {user.lastName}
                </p>
              )}
            </div>
          </Table.Cell>
          <Table.Cell className="whitespace-nowrap">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {user.email || "—"}
            </span>
          </Table.Cell>
          <Table.Cell>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {user.phoneNumber || "N/A"}
            </span>
          </Table.Cell>
          <Table.Cell>
            <div className="flex flex-wrap gap-2">
              {user.roles?.map((role) => (
                <Badge
                  key={role}
                  color={
                    role.includes("ADMIN")
                      ? "indigo"
                      : role.includes("RESTAURANT")
                      ? "purple"
                      : role.includes("RIDER")
                      ? "blue"
                      : "info"
                  }
                  className="whitespace-nowrap"
                  size="sm"
                >
                  {role.replace("ROLE_", "")}
                </Badge>
              ))}
            </div>
          </Table.Cell>
          <Table.Cell>
            <div className="flex justify-center">
              <Badge
                color={user.enabled ? "success" : "failure"}
                className="flex items-center justify-center px-3 py-1.5 rounded-lg"
              >
                {user.enabled ? (
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
                color="light"
                size="sm"
                onClick={() => handleViewMore(user)}
                className="flex items-center"
              >
                <HiEye className="mr-1" />
                Details
              </Button>
              <Button
                color="success"
                size="sm"
                onClick={() => handleUpdateClick(user)}
                className="flex items-center"
              >
                <FaClipboardList className="mr-1" />
                Edit
              </Button>

              {/* Restaurant Admin button - only show for restaurant admins */}
              {isRestaurantAdmin(user) && (
                <Button
                  color="purple"
                  size="sm"
                  onClick={() => handleViewRestaurants(user)}
                  className="flex items-center"
                >
                  <FaStore className="mr-1" />
                  Restaurants
                </Button>
              )}
            </div>
          </Table.Cell>
        </Table.Row>
      </Table.Body>
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
              User Management Dashboard
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium uppercase text-gray-500">
                      Total Users
                    </p>
                    <h5 className="text-3xl font-bold text-gray-800 dark:text-white">
                      {totalUsers}
                    </h5>
                  </div>
                  <div className="p-3 rounded-full bg-yellow-100">
                    <HiOutlineUserGroup className="text-yellow-500 text-2xl" />
                  </div>
                </div>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium uppercase text-gray-500">
                      Active Users
                    </p>
                    <h5 className="text-3xl font-bold text-green-600">
                      {totalActiveUsers}
                    </h5>
                  </div>
                  <div className="p-3 rounded-full bg-green-100">
                    <FaCheckCircle className="text-green-500 text-2xl" />
                  </div>
                </div>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium uppercase text-gray-500">
                      Inactive Users
                    </p>
                    <h5 className="text-3xl font-bold text-red-600">
                      {totalInActiveUsers}
                    </h5>
                  </div>
                  <div className="p-3 rounded-full bg-red-100">
                    <FaTimesCircle className="text-red-500 text-2xl" />
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* Create User Button */}
              <Button
                gradientDuoTone="purpleToBlue"
                className="flex items-center"
                onClick={() => setShowCreateModal(true)}
              >
                <HiOutlinePlus className="mr-2 h-5 w-5" />
                New User
              </Button>

              {/* Search Input */}
              <div className="flex-grow md:max-w-md">
                <TextInput
                  type="text"
                  placeholder="Search by name, email or phone"
                  value={searchTerm}
                  onChange={handleSearch}
                  rightIcon={AiOutlineSearch}
                  className="w-full"
                />
              </div>

              <div className="flex flex-wrap gap-4 ml-auto">
                {/* Role selector */}
                <div className="w-48">
                  <ReactSelect
                    placeholder="Filter by role"
                    value={selectedRole}
                    onChange={handleRoleChange}
                    options={roleOptions}
                    isSearchable
                    isClearable
                    className="react-select-container"
                    classNamePrefix="react-select"
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

                {/* User selector */}
                <div className="w-64">
                  <ReactSelect
                    placeholder="Select a user for report"
                    value={selectedUserForReport}
                    onChange={(option) => setSelectedUserForReport(option)}
                    options={userSelectOptions}
                    isSearchable
                    isClearable
                    className="react-select-container"
                    classNamePrefix="react-select"
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
                    if (selectedUserForReport) {
                      handleDownloadReport();
                    } else if (selectedRole) {
                      handleRoleReport();
                    } else {
                      toast.error(
                        "Please select either a user or a role for report generation"
                      );
                    }
                  }}
                  disabled={
                    isDownloading || (!selectedUserForReport && !selectedRole)
                  }
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

          {/* Users Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              {filteredUsers.length > 0 ? (
                <Table
                  hoverable
                  striped
                  className="min-w-full divide-y divide-gray-200"
                >
                  <Table.Head className="bg-gray-100 dark:bg-gray-700">
                    <Table.HeadCell className="px-6 py-3">Name</Table.HeadCell>
                    <Table.HeadCell className="px-6 py-3">Email</Table.HeadCell>
                    <Table.HeadCell className="px-6 py-3">
                      Phone Number
                    </Table.HeadCell>
                    <Table.HeadCell className="px-6 py-3">Roles</Table.HeadCell>
                    <Table.HeadCell className="px-6 py-3">
                      Status
                    </Table.HeadCell>
                    <Table.HeadCell className="px-6 py-3">
                      Actions
                    </Table.HeadCell>
                  </Table.Head>
                  {displayUsers}
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <HiOutlineExclamationCircle className="w-16 h-16 text-gray-400" />
                  <h2 className="mt-2 text-xl font-semibold text-gray-700">
                    No Users Found
                  </h2>
                  <p className="text-gray-500 mt-1">
                    No users match your current search criteria.
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {filteredUsers.length > 0 && (
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
          {/* User Details Modal */}
          <UserDetailsModal
            showModal={showModal}
            setShowModal={setShowModal}
            user={userToShow}
          />

          {/* Create User Modal */}
          <CreateUserModal
            show={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleUserCreated}
            token={currentUser.token}
          />

          {/* Update User Modal */}
          <UpdateUserModal
            show={showUpdateModal}
            onClose={() => setShowUpdateModal(false)}
            onSuccess={handleUserUpdated}
            userData={selectedUser}
            token={currentUser.token}
          />

          {/* Restaurant Assignment Modal */}
          <Modal
            show={showRestaurantModal}
            onClose={() => setShowRestaurantModal(false)}
            size="6xl"
          >
            <Modal.Header>
              <div className="flex items-center space-x-2">
                <FaStore className="text-purple-600" />
                <span>
                  Assigned Restaurants for {selectedUserForRestaurant?.username}
                </span>
              </div>
            </Modal.Header>
            <Modal.Body>
              {loadingRestaurants ? (
                <div className="flex justify-center items-center p-8">
                  <Spinner size="xl" />
                </div>
              ) : userRestaurants.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userRestaurants.map((restaurant) => (
                    <Card key={restaurant.id} className="overflow-hidden">
                      <div className="flex">
                        <img
                          src={
                            restaurant.restaurantImageUrl ||
                            "https://via.placeholder.com/100?text=Restaurant"
                          }
                          alt={restaurant.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        <div className="ml-4">
                          <h5 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                            {restaurant.name}
                          </h5>

                          <div className="flex items-center space-x-1 text-sm text-gray-500 mt-1">
                            <HiLocationMarker />
                            <span className="truncate max-w-[200px]">
                              {restaurant.address}
                            </span>
                          </div>

                          <div className="flex items-center space-x-1 text-sm text-gray-500 mt-1">
                            <HiPhone />
                            <span>{restaurant.phoneNumber || "N/A"}</span>
                          </div>

                          <Badge
                            color={restaurant.enabled ? "success" : "failure"}
                            className="mt-2"
                          >
                            {restaurant.enabled ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="flex justify-center">
                    <FaStore className="text-gray-400 text-4xl mb-2" />
                  </div>
                  <h5 className="text-xl font-semibold text-gray-700 mb-1">
                    No Restaurants Found
                  </h5>
                  <p className="text-gray-500">
                    This user is not currently assigned to any restaurants.
                  </p>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                color="gray"
                onClick={() => setShowRestaurantModal(false)}
              >
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </div>
  );
}
