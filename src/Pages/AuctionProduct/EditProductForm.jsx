import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  mainCategory,
  subCategory,
  subCategoryParameter,
} from "../../features/slices/categorySlice";
import {
  Upload,
  X,
  Plus,
  Tag,
  DollarSign,
  Truck,
  MapPin,
  Clock,
  Gavel,
  AlertCircle,
} from "lucide-react";
import { updateProduct } from "../../features/slices/productSlice";
import { toast } from "react-toastify";

const MAX_IMAGES = 5;
const MAX_DESCRIPTION_LENGTH = 1200;
const MAX_TITLE_LENGTH = 100;

const EditProductForm = ({ closeForm, editMode, productData, onProductUpdate }) => {
  const dispatch = useDispatch();
  const { categoryList } = useSelector((state) => state.category);
  
  // State management
  const [loading, setLoading] = useState(false);
  const [tempSpecifics, setTempSpecifics] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subCategories, setSubCategories] = useState([]);
  const [specifics, setSpecifics] = useState([]);
  const [selectedSpecifics, setSelectedSpecifics] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [showCustomDuration, setShowCustomDuration] = useState(false);
  const [openSpecificModal, setOpenSpecificModal] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    subCategoryId: "",
    images: [],
    title: "",
    description: "",
    tags: [],
    condition: "",
    saleType: "auction",
    auctionSettings: {
      startingPrice: "",
      reservePrice: "",
      biddingIncrementPrice: "",
      duration: "",
      endDate: "",
      endTime: "",
    },
    shippingOption: "local pickup",
    shippingCharge: "",
  });

  const durationOptions = [
    { value: "3", label: "3 Days" },
    { value: "5", label: "5 Days" },
    { value: "7", label: "7 Days" },
    { value: "other", label: "Custom" },
  ];

  // Initialize form with existing product data
  useEffect(() => {
    if (productData && editMode) {
      const prefillData = {
        subCategoryId: productData.subCategoryId?._id || productData.subCategoryId || "",
        images: [],
        title: productData.title || "",
        description: productData.description || "",
        tags: Array.isArray(productData.tags) ? productData.tags : [],
        condition: productData.condition || "",
        saleType: "auction",
        auctionSettings: {
          startingPrice: productData.auctionSettings?.startingPrice?.toString() || "",
          reservePrice: productData.auctionSettings?.reservePrice?.toString() || "",
          biddingIncrementPrice: productData.auctionSettings?.biddingIncrementPrice?.toString() || "",
          duration: productData.auctionSettings?.duration?.toString() || "",
          endDate: productData.auctionSettings?.endDate || "",
          endTime: productData.auctionSettings?.endTime || "",
        },
        shippingOption: productData.deliveryType || "local pickup",
        shippingCharge: productData.shippingCharge?.toString() || "",
      };

      setFormData(prefillData);
      setSelectedCategory(productData.categoryId?._id || productData.categoryId || "");
      setExistingImages(Array.isArray(productData.productImages) ? productData.productImages : []);

      // Set selected specifics with proper structure
      if (productData.specifics && Array.isArray(productData.specifics)) {
        const initialSpecifics = productData.specifics.map((spec) => ({
          parameterId: spec.parameterId || spec.parameterID,
          parameterName: spec.parameterName,
          valueId: spec.valueId || spec.valueID,
          valueName: spec.valueName,
        }));
        setSelectedSpecifics(initialSpecifics);
      }

      // Check if custom duration is set
      if (productData.auctionSettings?.endDate && productData.auctionSettings?.endTime) {
        setShowCustomDuration(true);
      }
    }
  }, [productData, editMode]);

  // Fetch categories on mount
  useEffect(() => {
    dispatch(mainCategory({ pageNo: 1, size: 10000000 }));
  }, [dispatch]);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (selectedCategory) {
      dispatch(
        subCategory({ categoryId: selectedCategory, pageNo: 1, size: 10000000 })
      ).then((res) => {
        if (subCategory.fulfilled.match(res)) {
          const fetchedSubCategories = res.payload?.data?.data || [];
          setSubCategories(fetchedSubCategories);
        }
      }).catch(() => {
        setSubCategories([]);
        toast.error("Failed to fetch subcategories");
      });
    } else {
      setSubCategories([]);
    }
  }, [selectedCategory, dispatch]);

  // Set subcategory after subcategories are loaded (only once)
  useEffect(() => {
    if (productData && editMode && subCategories.length > 0 && !formData.subCategoryId) {
      const expectedSubCategoryId = productData.subCategoryId?._id || productData.subCategoryId;
      
      // Check if the expected subcategory exists in the loaded list
      const subCategoryExists = subCategories.find(sub => sub._id === expectedSubCategoryId);
      
      if (expectedSubCategoryId && subCategoryExists) {
        setFormData(prev => ({ ...prev, subCategoryId: expectedSubCategoryId }));
      }
    }
  }, [subCategories, productData, editMode]);

  // Fetch specifics when subcategory changes
  useEffect(() => {
    if (!formData.subCategoryId) {
      setSpecifics([]);
      return;
    }

    dispatch(
      subCategoryParameter({
        subCategoryId: formData.subCategoryId,
        pageNo: 1,
        size: 10000000,
      })
    ).then((res) => {
      if (subCategoryParameter.fulfilled.match(res)) {
        const fetchedSpecifics = res.payload?.data?.parameters || [];
        setSpecifics(fetchedSpecifics);
        
        // If we have selectedSpecifics but they're not in the new list, clear them
        if (selectedSpecifics.length > 0) {
          const validSpecifics = selectedSpecifics.filter(spec => {
            return fetchedSpecifics.some(param => 
              param.key === spec.parameterName && 
              param.values.some(val => val.value === spec.valueName)
            );
          });
          
          if (validSpecifics.length !== selectedSpecifics.length) {
            setSelectedSpecifics(validSpecifics);
          }
        }
      } else {
        setSpecifics([]);
      }
    }).catch(() => {
      setSpecifics([]);
      toast.error("Failed to fetch product specifications");
    });
  }, [formData.subCategoryId, dispatch, selectedSpecifics]);

  // Ensure selectedSpecifics are preserved when specifics are loaded
  useEffect(() => {
    if (productData && editMode && specifics.length > 0 && selectedSpecifics.length === 0) {
      // If we have product specifics but no selected specifics, try to restore them
      if (productData.specifics && Array.isArray(productData.specifics)) {
        const restoredSpecifics = productData.specifics
          .map((spec) => ({
            parameterId: spec.parameterId || spec.parameterID,
            parameterName: spec.parameterName,
            valueId: spec.valueId || spec.valueID,
            valueName: spec.valueName,
          }))
          .filter(spec => {
            // Only include specs that exist in the current specifics list
            return specifics.some(param => 
              param.key === spec.parameterName && 
              param.values.some(val => val.value === spec.valueName)
            );
          });
        
        if (restoredSpecifics.length > 0) {
          setSelectedSpecifics(restoredSpecifics);
        }
      }
    }
  }, [specifics, productData, editMode, selectedSpecifics.length]);

  // Handle existing image removal
  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  // Handle new image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = existingImages.length + formData.images.length;

    if (files.length + totalImages > MAX_IMAGES) {
      setErrors(prev => ({
        ...prev,
        images: `Maximum ${MAX_IMAGES} images allowed. Current: ${totalImages}`,
      }));
      return;
    }

    // Validate file types and sizes
    const validFiles = [];
    const invalidFiles = [];

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        invalidFiles.push(`${file.name} - Not an image`);
      } else if (file.size > 5 * 1024 * 1024) { // 5MB limit
        invalidFiles.push(`${file.name} - Too large (max 5MB)`);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      setErrors(prev => ({
        ...prev,
        images: `Invalid files: ${invalidFiles.join(', ')}`,
      }));
    }

    if (validFiles.length > 0) {
      const newPreviewUrls = validFiles.map((file) => URL.createObjectURL(file));
      setImagePreview(prev => [...prev, ...newPreviewUrls]);
      setFormData(prev => ({ ...prev, images: [...prev.images, ...validFiles] }));
      setErrors(prev => ({ ...prev, images: "" }));
    }
  };

  // Remove new image
  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreview[index]);
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  // Handle tag input
  const handleTagInput = (e) => {
    const value = e.target.value;
    const tags = value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 10); // Limit to 10 tags

    setFormData(prev => ({ ...prev, tags }));
  };

  // Remove individual tag
  const removeTag = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, index) => index !== indexToRemove)
    }));
  };

  // Handle auction setting changes
  const handleAuctionSettingChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      auctionSettings: {
        ...prev.auctionSettings,
        [field]: value,
      },
    }));
  };

  // Handle duration changes
  const handleDurationChange = (duration) => {
    if (duration === "other") {
      setShowCustomDuration(true);
      handleAuctionSettingChange("duration", "");
    } else {
      setShowCustomDuration(false);
      handleAuctionSettingChange("duration", String(duration));
      handleAuctionSettingChange("endDate", "");
      handleAuctionSettingChange("endTime", "");
    }
  };

  // Comprehensive form validation
  const validateForm = () => {
    const newErrors = {};
    const totalImages = existingImages.length + formData.images.length;

    // Required field validations
    if (!selectedCategory.trim()) {
      newErrors.category = "Category is required";
    }

    if (!formData.subCategoryId.trim()) {
      newErrors.subCategory = "Subcategory is required";
    }

    if (!formData.title.trim()) {
      newErrors.title = "Product title is required";
    } else if (formData.title.length > MAX_TITLE_LENGTH) {
      newErrors.title = `Title must be ${MAX_TITLE_LENGTH} characters or less`;
    }

    if (!formData.description.trim()) {
      newErrors.description = "Product description is required";
    } else if (formData.description.length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    }

    if (totalImages === 0) {
      newErrors.images = "At least one product image is required";
    }

    if (!formData.condition) {
      newErrors.condition = "Product condition is required";
    }

    // Specifics validation
    if (specifics.length > 0 && selectedSpecifics.length === 0) {
      newErrors.specifics = "At least one product specification is required";
    }

    // Auction settings validation
    const auction = formData.auctionSettings;
    
    if (!auction.startingPrice.trim()) {
      newErrors.startingPrice = "Starting price is required";
    } else {
      const startingPrice = parseFloat(auction.startingPrice);
      if (isNaN(startingPrice) || startingPrice <= 0) {
        newErrors.startingPrice = "Starting price must be a valid positive number";
      }
    }

    if (!auction.reservePrice.trim()) {
      newErrors.reservePrice = "Reserve price is required";
    } else {
      const reservePrice = parseFloat(auction.reservePrice);
      const startingPrice = parseFloat(auction.startingPrice);
      if (isNaN(reservePrice) || reservePrice <= 0) {
        newErrors.reservePrice = "Reserve price must be a valid positive number";
      } else if (!isNaN(startingPrice) && reservePrice < startingPrice) {
        newErrors.reservePrice = "Reserve price should be greater than or equal to starting price";
      }
    }

    if (!auction.biddingIncrementPrice.trim()) {
      newErrors.biddingIncrementPrice = "Bidding increment is required";
    } else {
      const increment = parseFloat(auction.biddingIncrementPrice);
      if (isNaN(increment) || increment <= 0) {
        newErrors.biddingIncrementPrice = "Bidding increment must be a valid positive number";
      }
    }

    // Duration validation
    if (showCustomDuration) {
      if (!auction.endDate) {
        newErrors.endDate = "End date is required";
    } else {
        const endDate = new Date(auction.endDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (endDate < today) {
          newErrors.endDate = "End date cannot be in the past";
        }
      }
      if (!auction.endTime) {
        newErrors.endTime = "End time is required";
      }
    } else {
      if (!auction.duration) {
        newErrors.duration = "Duration is required";
    }
    }

    // Shipping validation
    if (formData.shippingOption === "charge shipping") {
      if (!formData.shippingCharge.trim()) {
      newErrors.shippingCharge = "Shipping charge is required";
      } else {
        const charge = parseFloat(formData.shippingCharge);
        if (isNaN(charge) || charge < 0) {
          newErrors.shippingCharge = "Shipping charge must be a valid number";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();

      // Basic product data
      formDataToSend.append("categoryId", selectedCategory);
      formDataToSend.append("subCategoryId", formData.subCategoryId);
      formDataToSend.append("title", formData.title.trim());
      formDataToSend.append("description", formData.description.trim());
      formDataToSend.append("condition", formData.condition);
      formDataToSend.append("saleType", "auction");
      formDataToSend.append("deliveryType", formData.shippingOption);
      formDataToSend.append("shippingCharge", 
        formData.shippingOption === "charge shipping" ? formData.shippingCharge || "0" : "0"
      );
      formDataToSend.append("isDraft", "false");

      // Tags
      formData.tags.forEach((tag) => {
        formDataToSend.append("tags", tag);
      });

      // Specifics as JSON object
      if (selectedSpecifics.length > 0) {
      const specificsObj = {};
      selectedSpecifics.forEach(({ parameterName, valueName }) => {
        specificsObj[parameterName] = valueName;
      });
        formDataToSend.append("specifics", JSON.stringify(specificsObj));
    }

      // Auction settings
    if (formData.auctionSettings && typeof formData.auctionSettings === "object") {
        formDataToSend.append("auctionSettings", JSON.stringify(formData.auctionSettings));
    }

      // Image handling - send existing images to keep
      if (existingImages.length > 0) {
        formDataToSend.append("imageArray", JSON.stringify(existingImages));
      }

      // New images
      formData.images.forEach((file) => {
        formDataToSend.append("files", file);
      });

      const result = await dispatch(updateProduct({ 
        id: productData._id, 
        formData: formDataToSend 
      }));

        if (updateProduct.fulfilled.match(result)) {
        toast.success("Auction product updated successfully!");
          onProductUpdate?.();
          closeForm();
        } else {
        const { message } = result.payload || {};
        throw new Error(message || "Failed to update auction product");
        }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.message || "Failed to update auction product");
    } finally {
      setLoading(false);
    }
  };

  const conditionOptions = [
    { value: "brand_new", label: "Brand New", description: "Never used, in original packaging" },
    { value: "like_new", label: "Like New", description: "Barely used, excellent condition" },
    { value: "good", label: "Good", description: "Used with minor signs of wear" },
    { value: "fair", label: "Fair", description: "Used with noticeable wear" },
    { value: "works", label: "Works", description: "Functional but may have cosmetic issues" },
  ];

  return (
    <div className="max-h-[80vh] overflow-y-auto bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <h2 className="text-2xl font-semibold text-gray-900">Edit Auction Product</h2>
          <p className="text-gray-600 mt-1">Update your auction product information</p>
        </div>

        <div className="p-6 ">
            {/* Category Selection */}
          <div className="grid md:grid-cols-2 gap-4">
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`w-full p-3 border rounded-lg   focus:border-blue-500 transition-colors ${errors.category ? "border-red-500" : "border-gray-300"}`}
                >
                  <option value="">Select Category</option>
                  {categoryList?.data?.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.category}
                </p>
                )}
              </div>

              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategory *
                </label>
                <select
                value={formData.subCategoryId || ""}
                  onChange={(e) =>
                  setFormData(prev => ({ ...prev, subCategoryId: e.target.value }))
                  }
                  disabled={!selectedCategory}
                className={`w-full p-3 border rounded-lg   focus:border-blue-500 transition-colors disabled:bg-gray-100 ${errors.subCategory ? "border-red-500" : "border-gray-300"}`}
                >
                  <option value="">Select Subcategory</option>
                  {subCategories?.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
                {errors.subCategory && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                    {errors.subCategory}
                  </p>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Title *
              </label>
              <input
                type="text"
              placeholder="Enter a descriptive auction title"
                value={formData.title}
              maxLength={MAX_TITLE_LENGTH}
                onChange={(e) =>
                setFormData(prev => ({ ...prev, title: e.target.value }))
                }
              className={`w-full p-3 border rounded-lg   focus:border-blue-500 transition-colors ${errors.title ? "border-red-500" : "border-gray-300"}`}
              />
            <div className="flex justify-between items-center mt-1">
              {errors.title ? (
                <p className="text-red-500 text-sm flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.title}
                </p>
              ) : (
                <div />
              )}
              <p className="text-sm text-gray-500">
                {formData.title.length}/{MAX_TITLE_LENGTH}
              </p>
            </div>
            </div>

            {/* Description */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
              placeholder="Provide detailed information about your auction item..."
                value={formData.description}
                maxLength={MAX_DESCRIPTION_LENGTH}
                onChange={(e) =>
                setFormData(prev => ({ ...prev, description: e.target.value }))
                }
                rows={6}
              className={`w-full p-3 border rounded-lg   focus:border-blue-500 transition-colors resize-none ${errors.description ? "border-red-500" : "border-gray-300"}`}
              />
            <div className="flex justify-between items-center mt-1">
              {errors.description ? (
                <p className="text-red-500 text-sm flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.description}
                </p>
              ) : (
                <div />
                )}
              <p className="text-sm text-gray-500">
                {formData.description.length}/{MAX_DESCRIPTION_LENGTH}
                </p>
              </div>
            </div>

            {/* Images */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images * (Maximum {MAX_IMAGES})
              </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-4">
              {/* Existing Images */}
              {existingImages.map((url, index) => (
                <div key={`existing-${index}`} className="relative group">
                  <img
                    src={url}
                    alt={`Product ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X size={14} />
                  </button>
                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                    Existing
                  </div>
                </div>
              ))}

              {/* New Images */}
                {imagePreview.map((url, index) => (
                <div key={`new-${index}`} className="relative group">
                    <img
                      src={url}
                    alt={`New ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-orange-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                    <X size={14} />
                    </button>
                  <div className="absolute bottom-1 left-1 bg-orange-500 text-white text-xs px-1 rounded">
                    New
                  </div>
                  </div>
                ))}

              {/* Upload Button */}
              {existingImages.length + formData.images.length < MAX_IMAGES && (
                                 <label className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
                    <Upload size={20} className="text-gray-400" />
                  <span className="text-xs text-gray-500 mt-1">Add Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                {existingImages.length + formData.images.length} / {MAX_IMAGES} images
              </p>
              {errors.images && (
                <p className="text-red-500 text-sm flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.images}
                </p>
              )}
            </div>
            </div>

            {/* Tags */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="inline w-4 h-4 mr-1" />
              Tags (comma separated, max 10)
              </label>
              <input
                type="text"
              placeholder="e.g. auction, antique, collectible, rare"
                onChange={handleTagInput}
              value={formData.tags.join(", ")}
              className="w-full p-3 border border-gray-300 rounded-lg   focus:border-blue-500 transition-colors"
              />
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full flex items-center gap-2 border"
                    >
                      {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Specifics */}
            {specifics.length > 0 && (
              <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Product Specifications *
                  </label>
                  <button
                    type="button"
                    onClick={() => setOpenSpecificModal(true)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    <Plus size={16} />
                  Add Specification
                  </button>
                </div>

              {selectedSpecifics.length > 0 ? (
                <div className="space-y-2">
                    {selectedSpecifics.map((spec, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border"
                      >
                        <div>
                          <span className="font-medium text-gray-900">
                            {spec.parameterName}:
                          </span>
                          <span className="ml-2 text-gray-700">
                            {spec.valueName}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700 p-1"
                          onClick={() =>
                            setSelectedSpecifics((prev) =>
                              prev.filter((_, index) => index !== i)
                            )
                          }
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
              ) : (
                <div className="text-center py-4 text-gray-500 border border-dashed border-gray-300 rounded-lg">
                  No specifications added yet
                </div>
                )}

                {errors.specifics && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                    {errors.specifics}
                  </p>
                )}
              </div>
            )}

            {/* Condition */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Product Condition *
              </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {conditionOptions.map((option) => (
                  <label
                    key={option.value}
                                    className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${formData.condition === option.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                  }`}
                  >
                    <input
                      type="radio"
                      name="condition"
                      value={option.value}
                      checked={formData.condition === option.value}
                      onChange={(e) =>
                      setFormData(prev => ({ ...prev, condition: e.target.value }))
                      }
                      className="sr-only"
                    />
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-gray-600 text-xs mt-1">{option.description}</div>
                  </div>
                  </label>
                ))}
              </div>
              {errors.condition && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                {errors.condition}
              </p>
              )}
            </div>

                      {/* Auction Settings */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-6">
              <Gavel className="text-gray-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">
                Auction Settings
              </h3>
            </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="inline w-4 h-4 mr-1" />
                    Starting Price *
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                  min="0"
                  step="0.01"
                    value={formData.auctionSettings.startingPrice}
                    onChange={(e) =>
                    handleAuctionSettingChange("startingPrice", e.target.value)
                    }
                  className={`w-full p-3 border rounded-lg   focus:border-blue-500 transition-colors ${errors.startingPrice ? "border-red-500" : "border-gray-300"}`}
                  />
                  {errors.startingPrice && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle size={16} className="mr-1" />
                      {errors.startingPrice}
                    </p>
                  )}
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reserve Price *
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                  min="0"
                  step="0.01"
                    value={formData.auctionSettings.reservePrice}
                    onChange={(e) =>
                      handleAuctionSettingChange("reservePrice", e.target.value)
                    }
                  className={`w-full p-3 border rounded-lg   focus:border-blue-500 transition-colors ${errors.reservePrice ? "border-red-500" : "border-gray-300"}`}
                  />
                  {errors.reservePrice && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle size={16} className="mr-1" />
                      {errors.reservePrice}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bidding Increment *
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                min="0"
                step="0.01"
                  value={formData.auctionSettings.biddingIncrementPrice}
                  onChange={(e) =>
                  handleAuctionSettingChange("biddingIncrementPrice", e.target.value)
                  }
                className={`w-full p-3 border rounded-lg   focus:border-blue-500 transition-colors ${errors.biddingIncrementPrice ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.biddingIncrementPrice && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                    {errors.biddingIncrementPrice}
                  </p>
                )}
              </div>

              <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Clock className="inline w-4 h-4 mr-1" />
                Auction Duration *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {durationOptions.map((option) => (
                    <label
                      key={option.value}
                                          className={`cursor-pointer p-3 rounded-lg border-2 text-center transition-all ${(option.value === "other" && showCustomDuration) ||
                      (option.value !== "other" &&
                        formData.auctionSettings.duration === option.value)
                      ? "bg-blue-100 text-blue-800 border-blue-500"
                      : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="duration"
                        value={option.value}
                        checked={
                          (option.value === "other" && showCustomDuration) ||
                          (option.value !== "other" &&
                            formData.auctionSettings.duration === option.value)
                        }
                        onChange={() => handleDurationChange(option.value)}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>

                {errors.duration && !showCustomDuration && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.duration}
                </p>
                )}

                {showCustomDuration && (
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date *
                      </label>
                      <input
                        type="date"
                        value={formData.auctionSettings.endDate}
                        onChange={(e) =>
                          handleAuctionSettingChange("endDate", e.target.value)
                        }
                      className={`w-full p-3 border rounded-lg   focus:border-blue-500 transition-colors ${errors.endDate ? "border-red-500" : "border-gray-300"}`}
                      />
                      {errors.endDate && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle size={16} className="mr-1" />
                          {errors.endDate}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Time *
                      </label>
                      <input
                        type="time"
                        value={formData.auctionSettings.endTime}
                        onChange={(e) =>
                          handleAuctionSettingChange("endTime", e.target.value)
                        }
                      className={`w-full p-3 border rounded-lg   focus:border-blue-500 transition-colors ${errors.endTime ? "border-red-500" : "border-gray-300"}`}
                      />
                      {errors.endTime && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle size={16} className="mr-1" />
                          {errors.endTime}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Options */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
                <Truck className="inline w-4 h-4 mr-1" />
              Delivery Options
              </label>

              <div className="space-y-3">
              <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="shippingOption"
                    value="local pickup"
                    checked={formData.shippingOption === "local pickup"}
                    onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                        shippingOption: e.target.value,
                        shippingCharge: "",
                    }))
                    }
                  className="mt-1 mr-3"
                  />
                  <div>
                    <div className="flex items-center gap-2 font-medium">
                      <MapPin size={16} />
                      Local Pickup Only
                    </div>
                    <p className="text-sm text-gray-600">
                    Winner collects the item from your location
                    </p>
                  </div>
                </label>

              <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="shippingOption"
                    value="free shipping"
                    checked={formData.shippingOption === "free shipping"}
                    onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                        shippingOption: e.target.value,
                        shippingCharge: "",
                    }))
                    }
                  className="mt-1 mr-3"
                  />
                  <div>
                  <div className="font-medium text-green-700">Free Shipping</div>
                    <p className="text-sm text-gray-600">
                    You cover all shipping costs
                    </p>
                  </div>
                </label>

              <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="shippingOption"
                    value="charge shipping"
                    checked={formData.shippingOption === "charge shipping"}
                    onChange={(e) =>
                    setFormData(prev => ({ ...prev, shippingOption: e.target.value }))
                    }
                  className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                  <div className="font-medium text-orange-700">Charged Shipping</div>
                  <p className="text-sm text-gray-600 mb-2">Winner pays for shipping</p>
                    {formData.shippingOption === "charge shipping" && (
                      <input
                        type="number"
                      placeholder="Enter shipping charge"
                      min="0"
                      step="0.01"
                        value={formData.shippingCharge}
                        onChange={(e) =>
                        setFormData(prev => ({ ...prev, shippingCharge: e.target.value }))
                        }
                      className={`w-full p-2 border rounded   focus:border-blue-500 ${errors.shippingCharge ? "border-red-500" : "border-gray-300"}`}
                      />
                    )}
                  </div>
                </label>
              </div>
              {errors.shippingCharge && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                  {errors.shippingCharge}
                </p>
              )}
          </div>
            </div>

        {/* Footer with action buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            type="button"
            onClick={closeForm}
            disabled={loading}
            className="flex-1 bg-gray-100 text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
              <button
                type="button"
                onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : (
              "Update Auction"
            )}
              </button>
        </div>
      </div>

      {/* Specifics Modal */}
      {openSpecificModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl">
            <div className="sticky top-0 bg-white border-b px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Product Specifications</h2>
                <button
                  onClick={() => setOpenSpecificModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Selected Tags */}
              {Object.keys(tempSpecifics).length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Selected Specifications:</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(tempSpecifics).map(([pid, vid]) => {
                      const param = specifics.find((p) => p._id === pid);
                      const value = param?.values.find((v) => v._id === vid);
                      return (
                        <span
                          key={pid}
                          className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          <span className="font-medium">{param?.key}:</span>
                          <span>{value?.value}</span>
                          <button
                            onClick={() => {
                              const copy = { ...tempSpecifics };
                              delete copy[pid];
                              setTempSpecifics(copy);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Parameters */}
              <div className="">
                {specifics.map((param) => (
                  <div key={param._id}>
                    <h4 className="font-medium text-gray-900 mb-3">
                      {param.key}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {param.values.map((val) => {
                        const isSelected = tempSpecifics[param._id] === val._id;
                        return (
                          <button
                            key={val._id}
                            onClick={() =>
                              setTempSpecifics((prev) => ({
                                ...prev,
                                [param._id]: val._id,
                              }))
                            }
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${isSelected
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                              }`}
                          >
                            {val.value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t px-6 py-4">
              <div className="flex gap-3">
                <button
                  className="flex-1 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                  onClick={() => setTempSpecifics({})}
                >
                  Clear All
                </button>
                <button
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  onClick={() => {
                    const newSpecifics = Object.entries(tempSpecifics).map(
                      ([paramId, valueId]) => {
                        const param = specifics.find((p) => p._id === paramId);
                        const value = param?.values.find(
                          (v) => v._id === valueId
                        );
                        return {
                          parameterId: paramId,
                          parameterName: param.key,
                          valueId,
                          valueName: value.value,
                        };
                      }
                    );
                    setSelectedSpecifics(newSpecifics);
                    setOpenSpecificModal(false);
                    setTempSpecifics({});
                  }}
                >
                  Apply Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProductForm;
