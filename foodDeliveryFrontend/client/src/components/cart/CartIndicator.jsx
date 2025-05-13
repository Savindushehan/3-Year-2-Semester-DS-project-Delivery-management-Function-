import React from 'react';
import { Button, Badge } from 'flowbite-react';
import { HiShoppingCart } from 'react-icons/hi';
import { useCart } from '../../context/CartContext';

export default function CartIndicator() {
  const { cartCount, openCartDrawer } = useCart();
  
  return (
    <div className="relative">
      <Button
        color="gray"
        pill
        onClick={openCartDrawer}
        className="relative"
      >
        <HiShoppingCart className="h-5 w-5" />
        {cartCount > 0 && (
          <Badge color="failure" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
            {cartCount}
          </Badge>
        )}
      </Button>
    </div>
  );
}