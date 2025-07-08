import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { mainCategory, subCategory } from "../../features/slices/categorySlice";
import Button from "../../Component/Atoms/Button/Button";
import InputField from "../../Component/Atoms/InputFields/Inputfield";
import authAxiosClient from "../../api/authAxiosClient";
import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css

export default function EditThread() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { categoryList } = useSelector((state) => state.category);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subCategories, setSubCategories] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    categoryId: "",
    subCategoryId: "",
    title: "",
    description: "",
    budgetFlexible: false,
    min: "",
    max: "",
    tags: [],
    photos: [],
    removePhotos: [], // Track photos to remove
    newPhotos: [] // Store files in state for later submission
  });

  // Fetch thread data
  useEffect(() => {
    const fetchThread = async () => {
      try {
        setLoading(true);
        const response = await authAxiosClient.get(`/thread/getThreads/${id}`);
        const thread = response.data.data;
        
        setFormData({
          categoryId: thread.categoryId?._id || "",
          subCategoryId: thread.subCategoryId || "",
          title: thread.title || "",
          description: thread.description || "",
          budgetFlexible: thread.budgetFlexible || false,
          min: thread.budgetRange?.min || "",
          max: thread.budgetRange?.max || "",
          tags: thread.tags || [],
          photos: thread.photos || [],
          removePhotos: [],
          newPhotos: []
        });

        // Fetch subcategories if category exists
        if (thread.categoryId?._id) {
          dispatch(subCategory({ 
            categoryId: thread.categoryId._id, 
            pageNo: 1, 
            size: 10000000 
          })).then((res) => {
            if (subCategory.fulfilled.match(res)) {
              setSubCategories(res.payload?.data?.data || []);
            }
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch thread");
      } finally {
        setLoading(false);
      }
    };

    fetchThread();
  }, [id, dispatch]);

  // Fetch categories on mount
  useEffect(() => {
    dispatch(mainCategory({ pageNo: 1, size: 10000000 }));
  }, [dispatch]);

  // Handle category change
  const handleCategoryChange = async (categoryId) => {
    setFormData(prev => ({
      ...prev,
      categoryId,
      subCategoryId: "" // Reset subcategory when category changes
    }));

    if (categoryId) {
      const res = await dispatch(subCategory({ 
        categoryId, 
        pageNo: 1, 
        size: 10000000 
      }));
      if (subCategory.fulfilled.match(res)) {
        setSubCategories(res.payload?.data?.data || []);
      }
    } else {
      setSubCategories([]);
    }
  };

  // Handle tag input
  const handleTagInput = (e) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      const inputValue = e.target.value.trim();
      
      if (inputValue) {
        // Split by commas and/or spaces and filter empty strings
        const newTags = inputValue
          .split(/[,\s]+/)
          .map(tag => tag.trim())
          .filter(tag => tag && !formData.tags.includes(tag));

        if (newTags.length > 0) {
          setFormData(prev => ({
            ...prev,
            tags: [...prev.tags, ...newTags]
          }));
        }
      }
      e.target.value = '';
    }
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
    // confirmAlert({
    //   title: 'Remove Tag',
    //   message: 'Are you sure you want to remove this tag?',
    //   buttons: [
    //     {
    //       label: 'Yes',
    //       onClick: () => {
       
    //       }
    //     },
    //     {
    //       label: 'No',
    //       onClick: () => {}
    //     }
    //   ]
    // });
  };

  // Bulk remove tags
  const removeAllTags = () => {
    if (formData.tags.length === 0) return;
    
    confirmAlert({
      title: 'Remove All Tags',
      message: 'Are you sure you want to remove all tags?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => {
            setFormData(prev => ({
              ...prev,
              tags: []
            }));
          }
        },
        {
          label: 'No',
          onClick: () => {}
        }
      ]
    });
  };

  // Handle photo removal
  const handlePhotoRemove = (photoUrl) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter(url => url !== photoUrl),
      removePhotos: [...prev.removePhotos, photoUrl]
    }));
  };

  // Handle photo upload
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    // Store files in state for later submission
    setFormData(prev => ({
      ...prev,
      newPhotos: [...(prev.newPhotos || []), ...files]
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const formDataToSend = new FormData();
      
      // Add basic fields
      formDataToSend.append('categoryId', formData.categoryId);
      formDataToSend.append('subCategoryId', formData.subCategoryId);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('budgetFlexible', formData.budgetFlexible);
      
      // Add budget if not flexible
      if (!formData.budgetFlexible) {
        formDataToSend.append('min', formData.min);
        formDataToSend.append('max', formData.max);
      }

      // Add tags
      formData.tags.forEach(tag => {
        formDataToSend.append('tags', tag);
      });

      // Add photos to remove
      formData.removePhotos.forEach(photo => {
        formDataToSend.append('removePhotos', photo);
      });

      // Add new photos
      if (formData.newPhotos) {
        formData.newPhotos.forEach(file => {
          formDataToSend.append('files', file);
        });
      }

      await authAxiosClient.post(`/thread/updateThread/${id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      navigate('/thread');
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update thread");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Edit Thread</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block mb-2">Category</label>
            <select
              value={formData.categoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full border rounded-md p-2"
              required
            >
              <option value="">Select Category</option>
              {categoryList?.data?.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory Selection */}
          <div>
            <label className="block mb-2">Subcategory</label>
            <select
              value={formData.subCategoryId}
              onChange={(e) => setFormData(prev => ({ ...prev, subCategoryId: e.target.value }))}
              className="w-full border rounded-md p-2"
              required
              disabled={!formData.categoryId}
            >
              <option value="">Select Subcategory</option>
              {subCategories.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block mb-2">Title</label>
            <InputField
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              placeholder="Enter thread title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full border rounded-md p-2 min-h-[100px]"
              placeholder="Enter thread description"
            />
          </div>

          {/* Budget */}
          <div>
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={formData.budgetFlexible}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  budgetFlexible: e.target.checked,
                  min: e.target.checked ? "" : prev.min,
                  max: e.target.checked ? "" : prev.max
                }))}
                className="mr-2"
              />
              Flexible Budget
            </label>

            {!formData.budgetFlexible && (
              <div className="flex gap-4">
                <InputField
                  type="number"
                  value={formData.min}
                  onChange={(e) => setFormData(prev => ({ ...prev, min: e.target.value }))}
                  placeholder="Min Budget"
                  required
                />
                <InputField
                  type="number"
                  value={formData.max}
                  onChange={(e) => setFormData(prev => ({ ...prev, max: e.target.value }))}
                  placeholder="Max Budget"
                  required
                />
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <InputField
                type="text"
                placeholder="Add tags (press Enter, comma, or space to add)"
                onKeyDown={handleTagInput}
                className="flex-1"
              />
    
            </div>
            <p className="text-sm text-gray-500 mb-2">
              You can add multiple tags at once by separating them with commas or spaces
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-200 px-3 py-1 rounded-full text-sm flex items-center group hover:bg-gray-300"
                >
                  {tag}
                  <button
                    type="button"
                    className="ml-2 text-gray-500 hover:text-red-500 transition-colors"
                    onClick={() => removeTag(tag)}
                    title="Remove tag"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Photos */}
          <div>
            <label className="block mb-2">Photos</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="mb-4"
            />
            <div className="grid grid-cols-4 gap-4">
              {formData.photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={photo}
                    alt={`Thread photo ${index + 1}`}
                    className="w-full h-32 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handlePhotoRemove(photo)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/thread')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Thread'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 