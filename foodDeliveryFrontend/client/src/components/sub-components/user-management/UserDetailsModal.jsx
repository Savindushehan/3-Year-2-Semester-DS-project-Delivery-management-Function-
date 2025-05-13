import React, { useState } from "react";
import { Modal, Button, Badge } from "flowbite-react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  CreditCard,
  Truck,
  MapPin,
  Clock,
  AlertCircle,
  Info,
  Lock,
  ExternalLink,
} from "lucide-react";
import PropTypes from "prop-types";

export const UserDetailsModal = ({ showModal, setShowModal, user }) => {
  if (!user) return null;

  const userRole = user.roles?.[0] || "";
  const isDriver = userRole.includes("DRIVER");
  const isCustomer = userRole.includes("CUSTOMER");
  const isAdmin = userRole.includes("ADMIN");

  const renderInfoItem = (icon, label, value, fallback = "Not provided") => (
    <div className="flex items-center p-2 hover:bg-gray-100 rounded-md transition-colors">
      {icon}
      <strong className="min-w-24">{label}:</strong>
      <span className="ml-2 text-gray-700">{value || fallback}</span>
    </div>
  );

  const renderStatusItem = (condition, label, trueText, falseText) => (
    <div className="flex items-center p-2 hover:bg-gray-100 rounded-md transition-colors">
      {condition ? (
        <CheckCircle className="mr-2 text-green-500" size={18} />
      ) : (
        <XCircle className="mr-2 text-red-500" size={18} />
      )}
      <strong className="min-w-24">{label}:</strong>
      <span
        className={`ml-2 font-medium ${
          condition ? "text-green-600" : "text-red-600"
        }`}
      >
        {condition ? trueText : falseText}
      </span>
    </div>
  );

  return (
    <Modal 
      show={showModal} 
      onClose={() => setShowModal(false)} 
      size="xxl"
      className="dark:bg-gray-800"
    >
      <Modal.Header className="border-b border-gray-200">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-full mr-3">
            <User className="text-blue-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold">
            {isDriver
              ? "Driver Details"
              : isCustomer
              ? "Customer Details"
              : "User Details"}
          </h2>
        </div>
      </Modal.Header>
      
      <Modal.Body className="space-y-6">
        {/* Profile Overview */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
          <div className="w-32 h-32 relative">
            <img
              src={user.profilePictureUrl || "https://via.placeholder.com/128?text=User"}
              alt="Profile"
              className="w-full h-full object-cover rounded-full border-4 border-white shadow-md"
            />
            <div className="absolute -bottom-2 -right-2">
              {user.enabled ? (
                <Badge color="success" size="sm" className="px-3 py-1">Active</Badge>
              ) : (
                <Badge color="failure" size="sm" className="px-3 py-1">Inactive</Badge>
              )}
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold mb-1">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-gray-500 mb-2">@{user.username}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
              {user.roles?.map((role) => (
                <Badge key={role} color="info" className="text-xs px-3 py-1">
                  {role.replace("ROLE_", "")}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              Member since {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-blue-700">
              <Info className="mr-2" size={20} />
              Basic Information
            </h3>
            <div className="space-y-1">
              {renderInfoItem(
                <User className="mr-2 text-blue-500" size={18} />,
                "Username",
                user.username
              )}
              {renderInfoItem(
                <Mail className="mr-2 text-blue-500" size={18} />,
                "Email",
                user.email
              )}
              {renderInfoItem(
                <User className="mr-2 text-blue-500" size={18} />,
                "Full Name",
                `${user.firstName} ${user.lastName}`
              )}
              {renderInfoItem(
                <Phone className="mr-2 text-blue-500" size={18} />,
                "Phone",
                user.phoneNumber
              )}
              {renderInfoItem(
                <Calendar className="mr-2 text-blue-500" size={18} />,
                "Joined",
                new Date(user.createdAt).toLocaleDateString()
              )}
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-purple-700">
              <Lock className="mr-2" size={20} />
              Account Status
            </h3>
            <div className="space-y-1">
              {renderStatusItem(
                user.verified,
                "Verification",
                "Verified",
                "Not Verified"
              )}
              {renderStatusItem(
                !user.disabled,
                "Account",
                "Enabled",
                "Disabled"
              )}
              {renderStatusItem(
                !user.deleted,
                "Deletion Status",
                "Active",
                "Marked for Deletion"
              )}
            </div>
            
            <h3 className="text-lg font-semibold mt-6 mb-4 flex items-center text-green-700">
              <MapPin className="mr-2" size={20} />
              Location
            </h3>
            <div className="space-y-1">
              {renderInfoItem(
                <MapPin className="mr-2 text-green-500" size={18} />,
                "Address",
                user.address
              )}
              {user.latitude !== 0 && user.longitude !== 0 && (
                <div className="flex items-center p-2 hover:bg-gray-100 rounded-md transition-colors">
                  <MapPin className="mr-2 text-green-500" size={18} />
                  <strong className="min-w-24">Map:</strong>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${user.latitude},${user.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-500 hover:underline flex items-center"
                  >
                    View Location
                    <ExternalLink size={14} className="ml-1" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Role-specific information */}
        {isDriver && (
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-orange-700">
              <Truck className="mr-2" size={20} />
              Driver Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {renderInfoItem(
                <CreditCard className="mr-2 text-orange-500" size={18} />,
                "ID Number",
                user.identificationNumber
              )}
              {renderInfoItem(
                <Truck className="mr-2 text-orange-500" size={18} />,
                "Vehicle Number",
                user.vehicleNumber
              )}
            </div>
          </div>
        )}
      </Modal.Body>
      
      <Modal.Footer className="border-t border-gray-200">
        <Button 
          color="gray" 
          onClick={() => setShowModal(false)}
          className="hover:bg-gray-200 transition-colors"
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

UserDetailsModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  setShowModal: PropTypes.func.isRequired,
  user: PropTypes.shape({
    username: PropTypes.string,
    email: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    phoneNumber: PropTypes.string,
    createdAt: PropTypes.string,
    roles: PropTypes.arrayOf(PropTypes.string),
    enabled: PropTypes.bool,
    verified: PropTypes.bool,
    disabled: PropTypes.bool,
    deleted: PropTypes.bool,
    address: PropTypes.string,
    latitude: PropTypes.number,
    longitude: PropTypes.number,
    identificationNumber: PropTypes.string,
    vehicleNumber: PropTypes.string,
    profilePictureUrl: PropTypes.string,
  }),
};

UserDetailsModal.defaultProps = {
  user: {
    roles: [],
  },
};