import React, { useState, useEffect } from 'react';
import { Modal, Button, Checkbox, Label, Spinner } from 'flowbite-react';
import { HiPlus, HiMinus, HiShoppingCart } from 'react-icons/hi';
import { FaUtensils } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';

export default function AddToCartModal({ show, onClose, menuItem }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState({});
  const [addOnQuantities, setAddOnQuantities] = useState({});
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();

  // Reset state when menu item changes
  useEffect(() => {
    if (menuItem) {
      setQuantity(1);
      setSelectedAddOns({});
      setAddOnQuantities({});
    }
  }, [menuItem]);

  if (!menuItem) return null;

  const handleAddOnChange = (addOnId, isChecked) => {
    setSelectedAddOns(prev => ({
      ...prev,
      [addOnId]: isChecked
    }));
    
    // Initialize quantity to 1 if selected
    if (isChecked) {
      setAddOnQuantities(prev => ({
        ...prev,
        [addOnId]: 1
      }));
    }
  };

  const handleAddOnQuantityChange = (addOnId, newQuantity) => {
    const addOn = menuItem.addOns.find(addon => addon.id === addOnId);
    if (!addOn) return;
    
    // Validate against maxQuantity
    if (newQuantity > addOn.maxQuantity) {
      newQuantity = addOn.maxQuantity;
    }
    
    if (newQuantity < 1) newQuantity = 1;
    
    setAddOnQuantities(prev => ({
      ...prev,
      [addOnId]: newQuantity
    }));
  };

  const handleAddToCart = () => {
    setIsAdding(true);
    
    // Prepare selected add-ons with their quantities
    const finalAddOns = Object.keys(selectedAddOns)
      .filter(addOnId => selectedAddOns[addOnId])
      .map(addOnId => ({
        addOn: menuItem.addOns.find(addon => addon.id === addOnId),
        quantity: addOnQuantities[addOnId] || 1
      }));
    
    // Add to cart
    addToCart(menuItem, quantity, finalAddOns);
    
    // Reset and close
    setIsAdding(false);
    onClose();
  };

  // Calculate item price including add-ons
  const calculateItemPrice = () => {
    const basePrice = menuItem.onPromotion ? menuItem.discountedPrice : menuItem.price;
    
    // Calculate add-on total
    const addOnTotal = Object.keys(selectedAddOns)
      .filter(addOnId => selectedAddOns[addOnId])
      .reduce((total, addOnId) => {
        const addOn = menuItem.addOns.find(addon => addon.id === addOnId);
        return total + (addOn ? addOn.price * (addOnQuantities[addOnId] || 1) : 0);
      }, 0);
    
    return (basePrice * quantity) + addOnTotal;
  };

  return (
    <Modal show={show} onClose={onClose} size="lg">
      <Modal.Header>
        Add to Cart - {menuItem.name}
      </Modal.Header>
      <Modal.Body>
        <div className="space-y-6">
          {/* Menu Item Details */}
          <div className="flex items-start">
            <div className="w-1/4 mr-4">
              {menuItem.imageUrl ? (
                <img 
                  src={menuItem.imageUrl} 
                  alt={menuItem.name}
                  className="w-full h-auto rounded-lg object-cover" 
                />
              ) : (
                <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                  <FaUtensils className="text-gray-400 text-3xl" />
                </div>
              )}
            </div>
            <div className="w-3/4">
              <h3 className="text-xl font-bold">{menuItem.name}</h3>
              <p className="text-gray-700 mb-2">{menuItem.description}</p>
              
              <div className="flex items-baseline mb-2">
                {menuItem.onPromotion ? (
                  <>
                    <span className="text-lg font-bold text-green-600 mr-2">
                      ${menuItem.discountedPrice.toFixed(2)}
                    </span>
                    <span className="text-sm line-through text-gray-500">
                      ${menuItem.price.toFixed(2)}
                    </span>
                    <span className="ml-2 bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded">
                      {menuItem.discountPercentage.toFixed(0)}% OFF
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-bold">${menuItem.price.toFixed(2)}</span>
                )}
              </div>

              {/* Item Attributes */}
              <div className="flex flex-wrap gap-2 mb-3">
                {menuItem.vegetarian && (
                  <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                    Vegetarian
                  </span>
                )}
                {menuItem.vegan && (
                  <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                    Vegan
                  </span>
                )}
                {menuItem.glutenFree && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                    Gluten Free
                  </span>
                )}
                {menuItem.spicy && (
                  <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                    Spicy
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <span className="font-medium">Quantity</span>
            <div className="flex items-center">
              <Button 
                color="light" 
                size="sm" 
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                disabled={quantity <= 1}
              >
                <HiMinus />
              </Button>
              <span className="mx-3 w-8 text-center">{quantity}</span>
              <Button 
                color="light" 
                size="sm" 
                onClick={() => setQuantity(prev => prev + 1)}
              >
                <HiPlus />
              </Button>
            </div>
          </div>

          {/* Add-ons Section */}
          {menuItem.addOns && menuItem.addOns.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-lg mb-3">Available Add-ons</h4>
              <div className="space-y-3">
                {menuItem.addOns.map(addOn => (
                  <div key={addOn.id} className="flex flex-col">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <Checkbox
                          id={`addon-${addOn.id}`}
                          checked={selectedAddOns[addOn.id] || false}
                          onChange={e => handleAddOnChange(addOn.id, e.target.checked)}
                          className="mt-1"
                        />
                        <div className="ml-2">
                          <Label htmlFor={`addon-${addOn.id}`} className="font-medium">
                            {addOn.name} (${addOn.price.toFixed(2)})
                          </Label>
                          <p className="text-sm text-gray-500">{addOn.description}</p>
                        </div>
                      </div>
                      
                      {selectedAddOns[addOn.id] && addOn.multiple && (
                        <div className="flex items-center">
                          <Button 
                            color="light" 
                            size="xs" 
                            onClick={() => handleAddOnQuantityChange(addOn.id, (addOnQuantities[addOn.id] || 1) - 1)}
                            disabled={(addOnQuantities[addOn.id] || 1) <= 1}
                          >
                            <HiMinus />
                          </Button>
                          <span className="mx-2 w-6 text-center">{addOnQuantities[addOn.id] || 1}</span>
                          <Button 
                            color="light" 
                            size="xs" 
                            onClick={() => handleAddOnQuantityChange(addOn.id, (addOnQuantities[addOn.id] || 1) + 1)}
                            disabled={(addOnQuantities[addOn.id] || 1) >= addOn.maxQuantity}
                          >
                            <HiPlus />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total Price */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total:</span>
              <span className="text-xl font-bold">${calculateItemPrice().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button color="gray" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleAddToCart} 
          disabled={isAdding}
          gradientDuoTone="purpleToBlue"
        >
          {isAdding ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Adding...
            </>
          ) : (
            <>
              <HiShoppingCart className="mr-2" />
              Add to Cart
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}