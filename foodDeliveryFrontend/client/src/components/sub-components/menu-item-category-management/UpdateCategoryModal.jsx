import React, { useState, useEffect } from 'react';
import { Modal, Button, Label, TextInput, Textarea, Spinner, ToggleSwitch } from 'flowbite-react';
import { toast } from 'react-toastify';
import { menuCategoryService } from '../../../service/menuCategoryService';

export const UpdateCategoryModal = ({ show, onClose, onSuccess, categoryData, token }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    active: true
  });

  useEffect(() => {
    if (categoryData) {
      setFormData({
        name: categoryData.name || '',
        description: categoryData.description || '',
        active: categoryData.active !== undefined ? categoryData.active : true
      });
    }
  }, [categoryData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleToggleChange = (checked) => {
    setFormData(prev => ({
      ...prev,
      active: checked
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await menuCategoryService.updateCategory(
        categoryData.id, 
        formData, 
        token
      );
      
      if (response.ok) {
        toast.success('Menu category updated successfully');
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to update menu category');
      }
    } catch (error) {
      toast.error('Error updating menu category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onClose={onClose}>
      <Modal.Header>Update Menu Category</Modal.Header>
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
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter category description"
              rows={3}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="active">Active Status</Label>
            <ToggleSwitch
              id="active"
              checked={formData.active}
              onChange={handleToggleChange}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button color="gray" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <><Spinner size="sm" className="mr-2" />Updating...</> : 'Update Category'}
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};