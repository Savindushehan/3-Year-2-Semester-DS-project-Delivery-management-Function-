import React, { useState, useEffect } from "react";
import { Modal, Button, Spinner, Badge } from "flowbite-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { toast } from "react-toastify";
import { menuCategoryService } from "../../../service/menuCategoryService";
import { FaBars, FaArrowUp, FaArrowDown } from "react-icons/fa";

export const ReorderCategoriesModal = ({
  show,
  onClose,
  onSuccess,
  restaurantId,
  restaurantName,
  categories,
  token,
}) => {
  const [loading, setLoading] = useState(false);
  const [orderedCategories, setOrderedCategories] = useState([]);
  const [originalOrder, setOriginalOrder] = useState([]);

  useEffect(() => {
    if (show && categories) {
      // Sort by displayOrder if it exists
      const sorted = [...categories].sort(
        (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
      );
      setOrderedCategories(sorted);
      setOriginalOrder(sorted.map((cat) => cat.id)); // Store original order for comparison
    }
  }, [show, categories]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(orderedCategories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update displayOrder values based on new positions
    const updatedItems = items.map((item, index) => ({
      ...item,
      displayOrder: index + 1,
      orderChanged: item.id !== originalOrder[index],
    }));

    setOrderedCategories(updatedItems);
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      // Extract just the category IDs in the correct order
      const categoryIds = orderedCategories.map((category) => category.id);

      const response = await menuCategoryService.reorderCategories(
        restaurantId,
        categoryIds, // Send just the IDs instead of objects
        token
      );

      if (response.ok) {
        toast.success("Categories reordered successfully");
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to reorder categories");
      }
    } catch (error) {
      toast.error("Error reordering categories");
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = () => {
    return orderedCategories.some(
      (cat, index) => cat.id !== originalOrder[index]
    );
  };

  return (
    <Modal show={show} onClose={onClose} size="lg">
      <Modal.Header>Reorder Menu Categories</Modal.Header>
      <Modal.Body>
        <div className="space-y-4">
          <p className="text-gray-700">
            Drag and drop the categories for <strong>{restaurantName}</strong>{" "}
            to change their display order.
          </p>

          {orderedCategories.length > 0 ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="categories">
                {(provided) => (
                  <ul
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {orderedCategories.map((category, index) => (
                      <Draggable
                        key={category.id}
                        draggableId={category.id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white p-4 rounded-lg shadow border flex items-center gap-3 
                              ${
                                snapshot.isDragging
                                  ? "bg-blue-50 border-blue-300"
                                  : "border-gray-100"
                              } 
                              ${
                                category.orderChanged
                                  ? "border-yellow-300 bg-yellow-50"
                                  : ""
                              }`}
                          >
                            <div className="bg-gray-100 p-2 rounded-md">
                              <FaBars className="text-gray-500" />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium">{category.name}</h5>
                              {category.description && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {category.description}
                                </p>
                              )}
                            </div>

                            {/* Current and new order display */}
                            <div className="flex flex-col text-center">
                              <Badge
                                color={
                                  category.orderChanged ? "warning" : "gray"
                                }
                                className="mb-1 px-3"
                              >
                                {category.orderChanged ? (
                                  <span className="flex items-center">
                                    New: {index + 1}
                                    {category.displayOrder < index + 1 ? (
                                      <FaArrowDown
                                        className="ml-1 text-amber-700"
                                        size={10}
                                      />
                                    ) : (
                                      <FaArrowUp
                                        className="ml-1 text-amber-700"
                                        size={10}
                                      />
                                    )}
                                  </span>
                                ) : (
                                  `Order: ${index + 1}`
                                )}
                              </Badge>

                              {category.orderChanged &&
                                category.displayOrder && (
                                  <span className="text-xs text-gray-500">
                                    (Current: {category.displayOrder || "None"})
                                  </span>
                                )}
                            </div>
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <p className="text-center text-gray-500 p-4">
              No categories available to reorder.
            </p>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="flex justify-end gap-2 w-full">
          <Button color="gray" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || orderedCategories.length < 2 || !hasChanges()}
            color={hasChanges() ? "success" : "blue"}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : (
              "Save Order"
            )}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};
