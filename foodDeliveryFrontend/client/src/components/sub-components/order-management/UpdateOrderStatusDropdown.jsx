import React, { useState } from 'react';
import { Button, Dropdown, Spinner } from 'flowbite-react';
import { toast } from 'react-toastify';
import { orderService } from '../../../service/orderService';

const UpdateOrderStatusDropdown = ({ 
  order, 
  statusWorkflow, 
  statusIcons, 
  statusColors, 
  token,
  onStatusUpdated,
  size = "xs",
  showAsButton = false
}) => {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // Only render if there are status options available
  if (!statusWorkflow[order.status]?.length) {
    return null;
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(true);
      const response = await orderService.updateOrderStatus(
        orderId,
        newStatus,
        token
      );

      if (response.ok) {
        toast.success(`Order status updated to ${newStatus.replace('_', ' ')}`);
        if (onStatusUpdated) {
          onStatusUpdated(orderId, newStatus);
        }
      } else {
        throw new Error("Failed to update order status");
      }
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Button style for consistency
  const dropdownLabel = showAsButton ? (
    <Button size={size} color="success" disabled={updatingStatus}>
      {updatingStatus ? "Updating..." : "Update Status"}
    </Button>
  ) : (
    "Update"
  );

  return (
    <div className="inline-block">
      {updatingStatus && !showAsButton ? (
        <Spinner size="sm" />
      ) : (
        <Dropdown
          label={dropdownLabel}
          size={size}
          color={showAsButton ? undefined : "success"}
          disabled={updatingStatus}
        >
          {statusWorkflow[order.status].map((status) => (
            <Dropdown.Item
              key={status}
              onClick={() => handleStatusUpdate(order.id, status)}
              // Important: We need to render the icon directly in the content, not as a prop
              className={
                status === "CANCELLED"
                  ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900"
                  : ""
              }
            >
              <div className="flex items-center">
                {statusIcons[status]}
                <span>{status.replace("_", " ")}</span>
              </div>
            </Dropdown.Item>
          ))}
        </Dropdown>
      )}
    </div>
  );
};

export default UpdateOrderStatusDropdown;