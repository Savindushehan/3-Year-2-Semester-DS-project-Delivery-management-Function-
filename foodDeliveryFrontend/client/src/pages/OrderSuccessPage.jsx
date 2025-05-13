import React from 'react';
import { Alert, Button } from 'flowbite-react';
import { HiCheck } from 'react-icons/hi';

export default function OrderSuccessPage() {
  return (
    <div className="max-w-md mx-auto p-4 mt-8">
      <Alert color="success" icon={HiCheck}>
        <span className="font-bold">Payment successful!</span>
        <p>Your order has been placed successfully.</p>
      </Alert>
      <Button color="light" className="mt-4" href="/">
        Back to Home
      </Button>
    </div>
  );
}