import React from 'react';
import {
  HiOutlineClock,
  HiOutlineClipboardCheck,
  HiOutlineClipboardList,
  HiOutlineTruck,
  HiCheck,
  HiX,
} from "react-icons/hi";
import { FaUtensils } from "react-icons/fa";

const OrderStatusTimeline = ({ status }) => {
  const steps = [
    { status: 'PENDING', label: 'Pending', icon: <HiOutlineClock /> },
    { status: 'CONFIRMED', label: 'Confirmed', icon: <HiOutlineClipboardCheck /> },
    { status: 'PREPARING', label: 'Preparing', icon: <FaUtensils /> },
    { status: 'READY_FOR_PICKUP', label: 'Ready', icon: <HiOutlineClipboardList /> },
    { status: 'OUT_FOR_DELIVERY', label: 'On Delivery', icon: <HiOutlineTruck /> },
    { status: 'DELIVERED', label: 'Delivered', icon: <HiCheck /> },
  ];

  // Find the current step index
  const currentIndex = steps.findIndex(step => step.status === status);
  
  // Special case for cancelled orders
  if (status === 'CANCELLED') {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg mt-2 mb-4">
        <div className="flex items-center justify-center text-red-600 dark:text-red-400">
          <HiX size={24} className="mr-2" />
          <span className="font-medium">This order has been cancelled</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 mb-4">
      <div className="flex items-center justify-between w-full">
        {steps.map((step, index) => {
          // Determine the status of this step
          let stepStatus = 'upcoming'; // default
          if (index < currentIndex) stepStatus = 'completed';
          else if (index === currentIndex) stepStatus = 'current';
          
          // Style classes based on step status
          const iconClasses = `w-8 h-8 flex items-center justify-center rounded-full z-10 ${
            stepStatus === 'completed' ? 'bg-green-500 text-white' :
            stepStatus === 'current' ? 'bg-blue-600 text-white animate-pulse' :
            'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
          }`;
          
          const lineClasses = `
            h-0.5 flex-1 ${index < steps.length - 1 ? 'block' : 'hidden'} ${
            stepStatus === 'completed' ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'
          }`;
          
          const labelClasses = `
            text-xs text-center absolute -bottom-6 w-16 left-1/2 transform -translate-x-1/2 ${
            stepStatus === 'completed' ? 'text-green-600 dark:text-green-400' :
            stepStatus === 'current' ? 'text-blue-600 dark:text-blue-400 font-medium' :
            'text-gray-500 dark:text-gray-400'
          }`;
          
          return (
            <React.Fragment key={step.status}>
              <div className="flex flex-col items-center relative">
                <div className={iconClasses}>
                  {step.icon}
                </div>
                <span className={labelClasses}>{step.label}</span>
              </div>
              <div className={lineClasses}></div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default OrderStatusTimeline;