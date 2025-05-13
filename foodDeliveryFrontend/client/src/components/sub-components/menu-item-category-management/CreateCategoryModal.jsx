import React, { useState } from 'react';
import { Modal, Button, Label, TextInput, Spinner } from 'flowbite-react';
import { toast } from 'react-toastify';
import { menuCategoryService } from '../../../service/menuCategoryService';

export const CreateCategoryModal = ({ show, onClose, onSuccess, token, restaurantId }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!restaurantId) {
      toast.error('Restaurant ID is required');
      return;
    }
    
    setLoading(true);
    
    try {
      // Add restaurantId to the data being submitted
      const categoryData = {
        ...formData,
        restaurantId
      };
      
      const response = await menuCategoryService.createCategory(categoryData, token);
      if (response.ok) {
        toast.success('Menu category created successfully');
        setFormData({
          name: '',
          description: '',
        });
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to create menu category');
      }
    } catch (error) {
      toast.error('Error creating menu category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onClose={onClose}>
      <Modal.Header>Create New Menu Category</Modal.Header>
      <Modal.Body>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="name">Category Name</Label>
            <TextInput
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter category name"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <TextInput
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter category description"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button color="gray" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <><Spinner size="sm" className="mr-2" />Creating...</> : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};