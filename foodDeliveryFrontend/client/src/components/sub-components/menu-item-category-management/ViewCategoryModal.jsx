import React, { useState, useEffect } from 'react';
import { Modal, Button, Badge, Spinner, Card } from 'flowbite-react';
import { 
  FaListUl, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaUtensils, 
  FaDollarSign 
} from 'react-icons/fa';
import { HiOutlineClipboardList, HiOutlineExclamationCircle } from 'react-icons/hi';
import { menuItemService } from '../../../service/menuItemService';

export const ViewCategoryModal = ({ show, onClose, categoryData, token }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenuItems = async () => {
      if (!categoryData || !categoryData.id) {
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        // Using the getMenuItemsByCategoryId method to fetch all menu items at once
        const response = await menuItemService.getMenuItemsByCategoryId(categoryData.id, token);
        
        if (!response.ok) {
          throw new Error(`Error fetching menu items: ${response.status}`);
        }
        
        const data = await response.json();
        setMenuItems(data);
      } catch (err) {
        console.error('Error fetching menu items:', err);
        setError('Failed to load menu items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (show && categoryData && token) {
      fetchMenuItems();
    }
  }, [show, categoryData, token]);

  if (!categoryData) return null;

  return (
    <Modal show={show} onClose={onClose} size="4xl">
      <Modal.Header className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div className="flex items-center text-white">
          <FaListUl className="mr-2 text-xl " />
          Menu Category Details
        </div>
      </Modal.Header>
      <Modal.Body className="max-h-[80vh] overflow-y-auto">
        <div className="space-y-6">
          {/* Category Header */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg shadow-sm">
            <div className="p-3 bg-blue-100 rounded-full">
              <FaListUl className="text-blue-600 text-xl" />
            </div>
            <div>
              <h5 className="text-xl font-bold text-gray-900">{categoryData.name}</h5>
              <div className="mt-2">
                <Badge color={categoryData.active ? "success" : "failure"} className="px-3 py-1.5">
                  {categoryData.active ? 
                    <div className="flex items-center">
                      <FaCheckCircle className="mr-1" />
                      Active
                    </div> : 
                    <div className="flex items-center">
                      <FaTimesCircle className="mr-1" />
                      Inactive
                    </div>
                  }
                </Badge>
              </div>
            </div>
          </div>

          {/* Description */}
          {categoryData.description && (
            <div className="mt-4">
              <h6 className="text-sm font-semibold text-gray-500 uppercase mb-2 flex items-center">
                <HiOutlineClipboardList className="mr-1" />
                Description
              </h6>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-md border border-gray-100">{categoryData.description}</p>
            </div>
          )}
          
          {/* Additional Details */}
          <div className="mt-4">
            <h6 className="text-sm font-semibold text-gray-500 uppercase mb-2 flex items-center">
              <HiOutlineClipboardList className="mr-1" />
              Additional Details
            </h6>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Display Order</p>
                  <p className="font-medium">{categoryData.displayOrder || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Menu Items</p>
                  <p className="font-medium">{categoryData.menuItemIds?.length || '0'}</p>
                </div>
                {categoryData.createdAt && (
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="font-medium">
                      {new Date(categoryData.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {categoryData.updatedAt && (
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium">
                      {new Date(categoryData.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h6 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
              <FaUtensils className="mr-2 text-blue-600" />
              Menu Items ({menuItems.length})
            </h6>
            
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <Spinner size="xl" />
                <p className="ml-3 text-gray-500">Loading menu items...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 p-4 rounded-md text-red-700 border border-red-200">
                <div className="flex items-center mb-2">
                  <HiOutlineExclamationCircle className="text-xl mr-2" />
                  <p className="font-medium">Error</p>
                </div>
                <p className="text-sm">{error}</p>
              </div>
            ) : menuItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menuItems.map((item) => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <h5 className="text-md font-semibold text-gray-900 truncate">{item.name}</h5>
                        {item.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                        )}
                      </div>
                      {item.imageUrl && (
                        <div className="w-16 h-16 flex-shrink-0">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="w-full h-full object-cover rounded-md"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center">
                        <FaDollarSign className="text-green-600 mr-1" />
                        <span className="font-semibold">
                          ${parseFloat(item.price).toFixed(2)}
                        </span>
                      </div>
                      <Badge color={item.available ? "success" : "failure"} className="px-2 py-1">
                        {item.available ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-6 rounded-md border border-gray-200 text-center">
                <FaUtensils className="mx-auto text-gray-400 text-3xl mb-2" />
                <p className="text-gray-600">No menu items in this category yet.</p>
              </div>
            )}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button color="gray" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};