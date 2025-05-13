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
  Dropdown,
  Datepicker,
  Label
} from "flowbite-react";
import {
  HiOutlineExclamationCircle,
  HiCurrencyDollar,
  HiDocumentReport
} from "react-icons/hi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactPaginate from "react-paginate";
import { FaCheckCircle, FaTimesCircle, FaReceipt } from "react-icons/fa";
import { AiOutlineSearch } from "react-icons/ai";
import { useSelector } from "react-redux";
import paymentService from "../service/paymentService";
import paymentReportService from "../service/paymentReportService";

export default function DashPaymentManagement() {
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const { currentUser } = useSelector((state) => state.user);
  const [totalPayments, setTotalPayments] = useState(0);
  const [successfulPayments, setSuccessfulPayments] = useState(0);
  const [failedPayments, setFailedPayments] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState("ORDER");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [selectedEmail, setSelectedEmail] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("succeeded");
  const [reportTypes, setReportTypes] = useState([]);
  const [endDate, endStartDate] = useState(new Date());
  const [startDate, startEndDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7); // Set default end date to 7 days after start date
    return date;
  });

  // Debounce search input
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timerId);
  }, [search]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await paymentService.getAllPayments(currentUser.token);
      setTotalPayments(data.length);
      setSuccessfulPayments(data.filter(payment => payment.paymentStatus === 'succeeded').length);
      setFailedPayments(data.filter(payment => payment.paymentStatus !== 'succeeded').length);
      setTotalRevenue(data.reduce((sum, payment) => sum + payment.amount, 0));
      setPayments(data);
      setFilteredPayments(data);

      if (data.length > 0) {
        setSelectedOrderId(data[0].orderId);
        setSelectedEmail(data[0].customerEmail);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error(error.message || "Error fetching payments");
    } finally {
      setLoading(false);
    }
  };

  const fetchReportTypes = async () => {
    try {
      const types = await paymentReportService.getAvailableReportTypes(currentUser.token);
      setReportTypes(types);
    } catch (error) {
      console.error("Error fetching report types:", error);
      toast.error("Failed to load report types");
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchPayments();
      fetchReportTypes();
    }
  }, [currentUser]);

  // Filter payments based on search term
  useEffect(() => {
    if (debouncedSearch.trim() === '') {
      setFilteredPayments(payments);
    } else {
      const searchTerm = debouncedSearch.toLowerCase();
      const filtered = payments.filter(payment => {
        const orderId = payment.orderId?.toLowerCase() || '';
        const email = payment.customerEmail?.toLowerCase() || '';
        const paymentId = payment.paymentStatus === 'succeeded'
          ? payment.stripePaymentId?.toLowerCase() || ''
          : 'n/a';

        return (
          orderId.includes(searchTerm) ||
          email.includes(searchTerm) ||
          paymentId.includes(searchTerm)
        );
      });
      setFilteredPayments(filtered);
    }
  }, [debouncedSearch, payments]);

  const [pageNumber, setPageNumber] = useState(0);
  const paymentsPerPage = 7;
  const pageCount = Math.ceil(filteredPayments.length / paymentsPerPage);

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };

  const displayPayments = filteredPayments
    .slice(pageNumber * paymentsPerPage, (pageNumber + 1) * paymentsPerPage)
    .map((payment) => (
      <Table.Row key={payment.stripePaymentId} className="bg-white dark:border-gray-700 dark:bg-gray-800">
        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
          {payment.orderId}
        </Table.Cell>
        <Table.Cell>{payment.customerEmail}</Table.Cell>
        <Table.Cell className="font-semibold">${payment.amount.toFixed(2)}</Table.Cell>
        <Table.Cell>
          <Badge color={payment.paymentStatus === 'succeeded' ? "success" : "failure"}>
            {payment.paymentStatus === 'succeeded' ? (
              <><FaCheckCircle className="mr-1" />Success</>
            ) : (
              <><FaTimesCircle className="mr-1" />Failed</>
            )}
          </Badge>
        </Table.Cell>
        <Table.Cell>
          {new Date(payment.paymentDate).toLocaleString()}
        </Table.Cell>
        <Table.Cell className="font-mono text-sm">
          {payment.paymentStatus === 'succeeded' ? payment.stripePaymentId : "N/A"}
        </Table.Cell>
      </Table.Row>
    ));

  const generateReport = async () => {
    setIsDownloading(true);
    try {
      let reportBlob;
      let filename = "payment-report";

      switch(reportType) {
        case "ORDER":
          if (!selectedOrderId) throw new Error("Please select an order");
          reportBlob = await paymentReportService.generatePaymentReportByOrder(selectedOrderId, currentUser.token);
          filename = `payment-receipt-${selectedOrderId}.pdf`;
          break;
        case "USER":
          if (!selectedEmail) throw new Error("Please select an email");
          reportBlob = await paymentReportService.generatePaymentReportByUser(selectedEmail, currentUser.token);
          filename = `user-payments-${selectedEmail}.pdf`;
          break;
        case "DATE_RANGE":
          if (startDate > endDate) throw new Error("Start date must be before end date");
          reportBlob = await paymentReportService.generatePaymentReportByDateRange(startDate, endDate, currentUser.token);
          filename = `payments-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.pdf`;
          break;
        case "STATUS":
          reportBlob = await paymentReportService.generatePaymentReportByStatus(selectedStatus, currentUser.token);
          filename = `payments-by-status-${selectedStatus}.pdf`;
          break;
        default:
          throw new Error("Invalid report type");
      }

      if (reportBlob instanceof Blob) {
        paymentReportService.downloadPdfReport(reportBlob, filename);
        toast.success("Report downloaded successfully");
      } else {
        throw new Error("Failed to generate report");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error(error.message || "Error generating report");
    } finally {
      setIsDownloading(false);
      setShowReportModal(false);
    }
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
              Payment Management Dashboard
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium uppercase text-gray-500">Total Payments</p>
                    <h5 className="text-3xl font-bold text-gray-800 dark:text-white">{totalPayments}</h5>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100">
                    <HiCurrencyDollar className="text-blue-500 text-2xl" />
                  </div>
                </div>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium uppercase text-gray-500">Successful Payments</p>
                    <h5 className="text-3xl font-bold text-green-600">{successfulPayments}</h5>
                  </div>
                  <div className="p-3 rounded-full bg-green-100">
                    <FaCheckCircle className="text-green-500 text-2xl" />
                  </div>
                </div>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium uppercase text-gray-500">Failed Payments</p>
                    <h5 className="text-3xl font-bold text-red-600">{failedPayments}</h5>
                  </div>
                  <div className="p-3 rounded-full bg-red-100">
                    <FaTimesCircle className="text-red-500 text-2xl" />
                  </div>
                </div>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium uppercase text-gray-500">Total Revenue</p>
                    <h5 className="text-3xl font-bold text-purple-600">${totalRevenue.toFixed(2)}</h5>
                  </div>
                  <div className="p-3 rounded-full bg-purple-100">
                    <FaReceipt className="text-purple-500 text-2xl" />
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-grow md:max-w-md">
                <TextInput
                  type="text"
                  placeholder="Search by order ID, email or payment ID"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  rightIcon={AiOutlineSearch}
                  className="w-full"
                />
              </div>

              <div className="flex flex-wrap gap-4 ml-auto">
                <Button
                  gradientDuoTone="cyanToBlue"
                  className="flex items-center"
                  onClick={() => setShowReportModal(true)}
                >
                  <HiDocumentReport className="mr-2 h-5 w-5" />
                  Generate Report
                </Button>
              </div>
            </div>
          </div>

          {/* Report Generation Modal */}
          <Modal show={showReportModal} onClose={() => setShowReportModal(false)}>
            <Modal.Header>Generate Payment Report</Modal.Header>
            <Modal.Body>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="reportType" value="Report Type" />
                  <Dropdown
                    id="reportType"
                    label={reportType.replace("_", " ")}
                  >
                    {reportTypes.map((type) => (
                      <Dropdown.Item
                        key={type}
                        onClick={() => setReportType(type)}
                      >
                        {type.replace("_", " ")}
                      </Dropdown.Item>
                    ))}
                  </Dropdown>
                </div>

                {reportType === "ORDER" && (
                  <div>
                    <Label htmlFor="orderId" value="Order ID" />
                    <Dropdown
                      id="orderId"
                      label={selectedOrderId || "Select Order"}
                    >
                      {payments.map((payment) => (
                        <Dropdown.Item
                          key={payment.orderId}
                          onClick={() => setSelectedOrderId(payment.orderId)}
                        >
                          {payment.orderId}
                        </Dropdown.Item>
                      ))}
                    </Dropdown>
                  </div>
                )}

                {reportType === "USER" && (
                  <div>
                    <Label htmlFor="email" value="Customer Email" />
                    <Dropdown
                      id="email"
                      label={selectedEmail || "Select Email"}
                    >
                      {Array.from(new Set(payments.map(p => p.customerEmail))).map((email) => (
                        <Dropdown.Item
                          key={email}
                          onClick={() => setSelectedEmail(email)}
                        >
                          {email}
                        </Dropdown.Item>
                      ))}
                    </Dropdown>
                  </div>
                )}


                {reportType === "DATE_RANGE" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate" value="Start Date" />
                      <Datepicker
                        id="startDate"
                        defaultDate={startDate}
                        onSelectedDateChanged={(date) => {
                          console.log("Start date changed:", date);
                          setStartDate(date);
                        }}
                        showClearButton={false}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate" value="End Date" />
                      <Datepicker
                        id="endDate"
                        defaultDate={endDate}
                        onSelectedDateChanged={(date) => {
                          console.log("End date changed:", date);
                          setEndDate(date);
                        }}
                        showClearButton={false}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}

                {reportType === "STATUS" && (
                  <div>
                    <Label htmlFor="status" value="Payment Status" />
                    <Dropdown
                      id="status"
                      label={selectedStatus}
                    >
                      <Dropdown.Item onClick={() => setSelectedStatus("succeeded")}>
                        Succeeded
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => setSelectedStatus("failed")}>
                        Failed
                      </Dropdown.Item>
                    </Dropdown>
                  </div>
                )}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button
                gradientDuoTone="cyanToBlue"
                onClick={generateReport}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <>
                    <Spinner className="mr-2" size="sm" />
                    Generating...
                  </>
                ) : (
                  "Generate Report"
                )}
              </Button>
              <Button color="gray" onClick={() => setShowReportModal(false)}>
                Cancel
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Payments Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              {filteredPayments.length > 0 ? (
                <Table hoverable striped className="min-w-full divide-y divide-gray-200">
                  <Table.Head className="bg-gray-100 dark:bg-gray-700">
                    <Table.HeadCell>Order ID</Table.HeadCell>
                    <Table.HeadCell>Customer Email</Table.HeadCell>
                    <Table.HeadCell>Amount</Table.HeadCell>
                    <Table.HeadCell>Status</Table.HeadCell>
                    <Table.HeadCell>Date</Table.HeadCell>
                    <Table.HeadCell>Payment ID</Table.HeadCell>
                  </Table.Head>
                  <Table.Body className="divide-y">
                    {displayPayments}
                  </Table.Body>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <HiOutlineExclamationCircle className="w-16 h-16 text-gray-400" />
                  <h2 className="mt-2 text-xl font-semibold text-gray-700">No Payments Found</h2>
                  <p className="text-gray-500 mt-1">
                    {debouncedSearch.trim() ?
                      "No payments match your search criteria." :
                      "No payments available."
                    }
                  </p>
                </div>
              )}
            </div>

            {filteredPayments.length > 0 && (
              <div className="py-4 px-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <ReactPaginate
                  previousLabel={"Previous"}
                  nextLabel={"Next"}
                  pageCount={pageCount}
                  onPageChange={handlePageChange}
                  forcePage={pageNumber}
                  containerClassName="flex justify-center items-center space-x-1"
                  pageClassName="inline-flex"
                  pageLinkClassName="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700"
                  previousLinkClassName="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700"
                  nextLinkClassName="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700"
                  activeLinkClassName="px-3 py-2 text-blue-600 border border-blue-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700"
                  disabledLinkClassName="opacity-50 cursor-not-allowed"
                />
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}