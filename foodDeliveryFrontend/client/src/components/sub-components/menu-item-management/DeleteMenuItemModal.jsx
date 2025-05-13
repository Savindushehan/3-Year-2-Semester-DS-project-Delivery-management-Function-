import React from "react";
import { Modal, Button, Spinner } from "flowbite-react";
import { HiOutlineExclamation } from "react-icons/hi";

export default function DeleteMenuItemModal({ show, onClose, menuItem, onConfirm, isDeleting }) {
  if (!menuItem) return null;

  return (
    <Modal show={show} size="md" popup onClose={onClose}>
      <Modal.Header className="bg-red-50" />
      <Modal.Body className="text-center">
        <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 mb-4">
          <HiOutlineExclamation className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Delete Menu Item
        </h3>
        <div className="mb-6">
          <p className="text-gray-500 mb-3">
            Are you sure you want to delete the menu item <span className="font-medium text-gray-900">"{menuItem.name}"</span>?
          </p>
          <p className="text-sm text-red-600">This action cannot be undone.</p>
        </div>
        <div className="flex justify-center gap-4">
          <Button
            color="failure"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Spinner size="sm" className="mr-2" light />
                Deleting...
              </>
            ) : (
              "Yes, delete item"
            )}
          </Button>
          <Button color="gray" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}