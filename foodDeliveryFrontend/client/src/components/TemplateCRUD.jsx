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
} from "flowbite-react";
import { HiEye, HiOutlineX } from "react-icons/hi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactPaginate from "react-paginate";
import {
  FaUsers,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaClipboardList,
  FaThumbsUp,
} from "react-icons/fa";
import { AiOutlineSearch } from "react-icons/ai";
import { RiGovernmentLine } from "react-icons/ri";
import Select from "react-select";
export default function DashReports() {
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [totalDistricts, setTotalDistricts] = useState(0);
  const [totalActiveDistricts, setTotalActiveDistricts] = useState(0);
  const [totalInactiveDistricts, setTotalInactiveDistricts] = useState(0);
  const [totalCities, setTotalCities] = useState(0);
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const fetchDistricts = async () => {
    try {
      const res = await fetch("/api/district/get");
      const data = await res.json();
      if (res.ok) {
        const filteredDistricts = data.districts.filter((district) => {
          return district.name.toLowerCase().includes(search.toLowerCase());
        });
        const selectDistricts = filteredDistricts.map((district) => ({
          value: district._id,
          label: district.name,
        }));
        setSelectedDistrict(selectDistricts);
        setDistricts(filteredDistricts);
        setTotalDistricts(data.totalDistricts);
        setTotalActiveDistricts(data.totalActiveDistricts);
        setTotalInactiveDistricts(data.totalInactiveDistricts);
        setTotalCities(data.totalCities);
      } else {
        setError(data.message);
      }
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistricts();
  }, [search]);

  const [pageNumber, setPageNumber] = useState(0);
  const districtsPerPage = 5;

  const pageCount = Math.ceil(districts.length / districtsPerPage);

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };

  const displayDistrict = districts
    .slice(pageNumber * districtsPerPage, (pageNumber + 1) * districtsPerPage)
    .map((district) => (
      <Table.Body className="divide-y">
        <Table.Row
          key={district._id}
          className="bg-white dark:border-gray-700 dark:bg-gray-800"
        >
          <Table.Cell>{district.name}</Table.Cell>
          <Table.Cell>
            <Button size="sm" color="gray">
              <HiEye className="mr-2 h-5 w-5" />
              View
            </Button>
          </Table.Cell>
          <Table.Cell>
            {
              <Badge
                color={
                  district.isActive === true
                    ? "success"
                    : district.isActive === false
                    ? "failure"
                    : "yellow"
                }
                style={{
                  fontSize: "1.2rem",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  display: "flex", // Use flexbox
                  alignItems: "center", // Center vertically
                  justifyContent: "center", // Center horizontally
                }}
              >
                {district.isActive ? (
                  <FaCheckCircle color="green" size={20} /> // Checkmark icon for verified
                ) : (
                  <FaTimesCircle color="red" size={20} /> // Cross icon for not verified
                )}
              </Badge>
            }
          </Table.Cell>
          <Table.Cell>
            <Button size="sm" color="gray">
              <HiEye className="mr-2 h-5 w-5" />
              View
            </Button>
          </Table.Cell>
          <Table.Cell>
            <div className="flex items-center space-x-4">
              <Button color="green" type="submit" outline>
                <FaClipboardList className="mr-2 h-5 w-5" />
                Update
              </Button>
              <Button size="sm" color="failure" disabled={isDeleting} outline>
                <HiOutlineX className="mr-2 h-5 w-5" />
                Delete
              </Button>
            </div>
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    ));
  const [downloadDistricts, setDownloadDistricts] = useState(null);
  const [downloadDistrictID, setDownloadDistrictID] = useState(null);
  const handleDistrictChange = (district) => {
    setDownloadDistricts(district);
    setDownloadDistrictID(district._id);
  };
  const generateDistrictReport = async () => {};
  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      <ToastContainer />
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="p-3 md:mx-auto">
            <div className=" flex-wrap flex gap-4 justify-center">
              <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
                <div className="flex justify-between">
                  <div className="">
                    <h3 className="text-gray-500 text-md uppercase">
                      Total Districts
                    </h3>
                    <p className="text-2xl">{totalDistricts}</p>
                  </div>
                  <RiGovernmentLine className="bg-yellow-500 text-white  text-5xl p-3 shadow-lg" />
                </div>
              </div>
              <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
                <div className="flex justify-between">
                  <div className="">
                    <h3 className="text-gray-500 text-md uppercase">
                      Active Districts
                    </h3>
                    <p className="text-2xl">{totalActiveDistricts}</p>
                  </div>
                  <RiGovernmentLine className="bg-green-500 text-white  text-5xl p-3 shadow-lg" />
                </div>
              </div>
              <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
                <div className="flex justify-between">
                  <div className="">
                    <h3 className="text-gray-500 text-md uppercase">
                      Inactive Districts
                    </h3>
                    <p className="text-2xl">{totalInactiveDistricts}</p>
                  </div>
                  <RiGovernmentLine className="bg-red-500 text-white text-5xl p-3 shadow-lg" />
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className=" flex items-center mb-2">
              <Button
                outline
                gradientDuoTone="greenToBlue"
                className="ml-4 mr-5"
              >
                Add New District
              </Button>
              <TextInput
                type="text"
                placeholder="Search by district name"
                onChange={(e) => setSearch(e.target.value)}
                rightIcon={AiOutlineSearch}
                className="ml-1 bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-80 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb"
              />
              <Select
                className="ml-4"
                placeholder="Select a Supplier"
                isSearchable
                onChange={handleDistrictChange}
                isClearable
                value={downloadDistricts}
                options={selectedDistrict}
                styles={{
                  control: (provided) => ({
                    ...provided,
                    width: "200px",
                  }),
                  option: (provided) => ({
                    ...provided,
                    color: "black",
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: "black",
                  }),
                }}
              />
              <Button
                outline
                gradientDuoTone="greenToBlue"
                className=" ml-4"
                disabled={!downloadDistricts || isDownloading}
                onClick={() => generateDistrictReport()}
              >
                {isDownloading ? (
                  <Spinner className="animate-spin" color="white" size="sm" />
                ) : (
                  "Download District Report"
                )}
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {districts.length > 0 ? (
              <Table>
                <Table.Head>
                  <Table.HeadCell>Name</Table.HeadCell>
                  <Table.HeadCell>Cities</Table.HeadCell>
                  <Table.HeadCell>District Active Status</Table.HeadCell>
                  <Table.HeadCell>Waste Drivers Assigned</Table.HeadCell>
                  <Table.HeadCell>Actions</Table.HeadCell>
                </Table.Head>
                {displayDistrict}
              </Table>
            ) : (
              <p>No Reports Available</p>
            )}
            <div className="mt-9 center">
              <ReactPaginate
                previousLabel={"Previous"}
                nextLabel={"Next"}
                pageCount={pageCount}
                onPageChange={handlePageChange}
                containerClassName={"pagination flex justify-center"}
                previousLinkClassName={
                  "inline-flex items-center px-4 py-2 border border-gray-300 rounded-l-md bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }
                nextLinkClassName={
                  "inline-flex items-center px-4 py-2 border border-gray-300 rounded-r-md bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }
                disabledClassName={"opacity-50 cursor-not-allowed"}
                activeClassName={"bg-indigo-500 text-white"}
              />
            </div>
          </div>

          {/** View More Modal */}

          {/** Delete Report Modal */}

          {/** Verify Modal */}
        </>
      )}
    </div>
  );
}
