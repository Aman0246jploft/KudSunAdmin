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
} from "lucide-react";
import { addProduct } from "../../features/slices/productSlice";
import { toast } from "react-toastify";

const MAX_IMAGES = 5;
const MAX_DESCRIPTION_LENGTH = 1200;

const AddProductForm = () => {
  const dispatch = useDispatch();
  const { categoryList } = useSelector((state) => state.category);
  const [tempSpecifics, setTempSpecifics] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subCategories, setSubCategories] = useState([]);
  const [specifics, setSpecifics] = useState([]);
  const [selectedSpecifics, setSelectedSpecifics] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [showCustomDuration, setShowCustomDuration] = useState(false);

  const [formData, setFormData] = useState({
    subCategoryId: "",
    images: [],
    title: "",
    description: "",
    tags: [],
    condition: "",
    saleType: "auction", // Set to auction by default
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

  const [openSpecificModal, setOpenSpecificModal] = useState(false);
  const [errors, setErrors] = useState({});

  // Duration options
  const durationOptions = [
    { value: "3", label: "3 Days" },
    { value: "5", label: "5 Days" },
    { value: "7", label: "7 Days" },
    { value: "other", label: "Other" },
  ];

  useEffect(() => {
    dispatch(mainCategory({ pageNo: 1, size: 10000000 }));
  }, [dispatch]);

  useEffect(() => {
    if (selectedCategory) {
      dispatch(
        subCategory({ categoryId: selectedCategory, pageNo: 1, size: 10000000 })
      ).then((res) => {
        if (subCategory.fulfilled.match(res)) {
          setSubCategories(res.payload?.data?.data || []);
        }
      });
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (!formData.subCategoryId) return;
    dispatch(
      subCategoryParameter({
        subCategoryId: formData.subCategoryId,
        pageNo: 1,
        size: 10000000,
      })
    ).then((res) => {
      if (subCategoryParameter.fulfilled.match(res)) {
        setSpecifics(res.payload?.data?.parameters || []);
      } else {
        setSpecifics([]);
      }
    });
  }, [formData.subCategoryId]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.images.length > MAX_IMAGES) {
      setErrors({
        ...errors,
        images: `You can upload a maximum of ${MAX_IMAGES} images.`,
      });
      return;
    }

    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setImagePreview([...imagePreview, ...newPreviewUrls]);
    setFormData({ ...formData, images: [...formData.images, ...files] });
    setErrors({ ...errors, images: "" });
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);

    URL.revokeObjectURL(imagePreview[index]);

    setFormData({ ...formData, images: newImages });
    setImagePreview(newPreviews);
  };

  const handleTagInput = (e) => {
    const tags = e.target.value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    setFormData({ ...formData, tags });
  };

  const handleAuctionSettingChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      auctionSettings: {
        ...prev.auctionSettings,
        [field]: value,
      },
    }));
  };

  const handleDurationChange = (duration) => {
    if (duration === "other") {
      setShowCustomDuration(true);
      handleAuctionSettingChange("duration", "");
    } else {
      setShowCustomDuration(false);
      handleAuctionSettingChange("duration", String(duration));
      // Clear custom date/time when selecting predefined duration
      handleAuctionSettingChange("endDate", "");
      handleAuctionSettingChange("endTime", "");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedCategory) newErrors.category = "Please select a category";
    if (!formData.subCategoryId)
      newErrors.subCategory = "Please select a subcategory";
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (formData.images.length === 0)
      newErrors.images = "At least one image is required";
    if (!formData.condition) newErrors.condition = "Please select condition";

    // ✅ Validate specifics
    if (specifics.length > 0 && selectedSpecifics.length === 0) {
      newErrors.specifics = "At least one product specification is required";
    }

    // Auction settings validation
    const auction = formData.auctionSettings;
    if (!auction.startingPrice)
      newErrors.startingPrice = "Starting price is required";
    if (!auction.reservePrice)
      newErrors.reservePrice = "Reserve price is required";
    if (!auction.biddingIncrementPrice)
      newErrors.biddingIncrementPrice = "Bidding increment is required";

    if (showCustomDuration) {
      if (!auction.endDate) newErrors.endDate = "End date is required";
      if (!auction.endTime) newErrors.endTime = "End time is required";
    } else {
      if (!auction.duration && !showCustomDuration)
        newErrors.duration = "Duration is required";
    }

    if (
      formData.shippingOption === "charge shipping" &&
      !formData.shippingCharge
    ) {
      newErrors.shippingCharge = "Shipping charge is required";
    }
    console.log(newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const payload = {
      categoryId: selectedCategory,
      subCategoryId: formData.subCategoryId,
      title: formData.title,
      description: formData.description,
      condition: formData.condition,
      saleType: "auction",
      deliveryType: formData.shippingOption,
      shippingCharge:
        formData.shippingOption === "charge shipping"
          ? formData.shippingCharge?.toString() || "0"
          : "0",
      isDraft: formData.isDraft ? "true" : "false",
    };

    let newForm = new FormData();

    // Append scalar values
    Object.entries(payload).forEach(([key, value]) => {
      if (Array.isArray(value)) return;
      if (typeof value === "object" && value !== null) return;
      newForm.append(key, value);
    });

    // Append tags
    if (Array.isArray(formData.tags)) {
      formData.tags.forEach((tag) => {
        newForm.append("tags", tag);
      });
    }

    // Append specifics
    if (Array.isArray(selectedSpecifics)) {
      selectedSpecifics.forEach((spec) => {
        newForm.append("specifics", JSON.stringify(spec));
      });
    }

    // Append auction settings
    newForm.append("auctionSettings", JSON.stringify(formData.auctionSettings));

    // Append images
    if (formData.images?.length > 0) {
      formData.images.slice(0, 5).forEach((file) => {
        newForm.append("files", file);
      });
    }

    dispatch(addProduct(newForm))
      .then((result) => {
        if (addProduct.fulfilled.match(result)) {
          toast.success("Auction Product Added");
        } else {
          const { message, code } = result.payload || {};
          console.error(`Auction Product failed [${code}]: ${message}`);
        }
      })
      .catch((error) => {
        console.error("Unexpected error:", error);
        toast.error("Unexpected error occurred");
      });
  };

  const conditionOptions = [
    {
      value: "brand_new",
      label: "Brand New",
      color: "bg-green-100 text-green-800",
    },
    {
      value: "like_new",
      label: "Like New",
      color: "bg-blue-100 text-blue-800",
    },
    { value: "good", label: "Good", color: "bg-yellow-100 text-yellow-800" },
    { value: "fair", label: "Fair", color: "bg-orange-100 text-orange-800" },
    { value: "works", label: "Works", color: "bg-gray-100 text-gray-800" },
  ];

  return (
    <div className="overflow-auto py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="rounded-xl shadow-lg overflow-auto">
          <div className="p-8 space-y-8 h-[50rem]">
            {/* Category Selection */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setFormData({ ...formData, subCategoryId: "" });
                  }}
                  className={`w-full p-3 border-2 rounded-lg  focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                    errors.category ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select Category</option>
                  {categoryList?.data?.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subcategory *
                </label>
                <select
                  value={formData.subCategoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, subCategoryId: e.target.value })
                  }
                  disabled={!selectedCategory}
                  className={`w-full p-3 border-2 rounded-lg  focus:ring-orange-500 focus:border-orange-500 transition-colors disabled:bg-gray-100 ${
                    errors.subCategory ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select Subcategory</option>
                  {subCategories?.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
                {errors.subCategory && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.subCategory}
                  </p>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Product Title *
              </label>
              <input
                type="text"
                placeholder="Enter product title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className={`w-full p-3 border-2 rounded-lg  focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                placeholder="Describe your product in detail..."
                value={formData.description}
                maxLength={MAX_DESCRIPTION_LENGTH}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={6}
                className={`w-full p-3 border-2 rounded-lg  focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
              />
              <div className="flex justify-between items-center mt-2">
                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description}</p>
                )}
                <p className="text-sm text-gray-500 ml-auto">
                  {formData.description.length} / {MAX_DESCRIPTION_LENGTH}
                </p>
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Product Images * (Max {MAX_IMAGES})
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-4">
                {imagePreview.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}

                {formData.images.length < MAX_IMAGES && (
                  <label className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-colors">
                    <Upload size={20} className="text-gray-400" />
                    <span className="text-xs text-gray-500 mt-1">
                      Add Image
                    </span>
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

              <p className="text-sm text-gray-500">
                {formData.images.length} / {MAX_IMAGES} images selected
              </p>
              {errors.images && (
                <p className="text-red-500 text-sm mt-1">{errors.images}</p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Tag className="inline w-4 h-4 mr-1" />
                Tags (comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. electronics, smartphone, android"
                onChange={handleTagInput}
                className="w-full p-3 border-2 border-gray-300 rounded-lg  focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Specifics */}
            {specifics.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    Product Specifics
                  </label>
                  <button
                    type="button"
                    onClick={() => setOpenSpecificModal(true)}
                    className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
                  >
                    <Plus size={16} />
                    Add Specific
                  </button>
                </div>

                {selectedSpecifics.length > 0 && (
                  <div className="grid gap-3">
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
                )}

                {errors.specifics && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.specifics}
                  </p>
                )}
              </div>
            )}

            {/* Condition */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Condition *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {conditionOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`cursor-pointer p-3 rounded-lg border-2 text-center transition-all ${
                      formData.condition === option.value
                        ? `${option.color} border-current`
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="condition"
                      value={option.value}
                      checked={formData.condition === option.value}
                      onChange={(e) =>
                        setFormData({ ...formData, condition: e.target.value })
                      }
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.condition && (
                <p className="text-red-500 text-sm mt-1">{errors.condition}</p>
              )}
            </div>

            {/* Auction Settings */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200">
              <div className="flex items-center gap-2 mb-6">
                <Gavel className="text-orange-600" size={20} />
                <h3 className="text-lg font-bold text-gray-900">
                  Auction Settings
                </h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <DollarSign className="inline w-4 h-4 mr-1" />
                    Starting Price *
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={formData.auctionSettings.startingPrice}
                    onChange={(e) =>
                      handleAuctionSettingChange(
                        "startingPrice",
                        e.target.value
                      )
                    }
                    className={`w-full p-3 border-2 rounded-lg  focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                      errors.startingPrice
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.startingPrice && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.startingPrice}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reserve Price *
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={formData.auctionSettings.reservePrice}
                    onChange={(e) =>
                      handleAuctionSettingChange("reservePrice", e.target.value)
                    }
                    className={`w-full p-3 border-2 rounded-lg  focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                      errors.reservePrice ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.reservePrice && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.reservePrice}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bidding Increment *
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={formData.auctionSettings.biddingIncrementPrice}
                  onChange={(e) =>
                    handleAuctionSettingChange(
                      "biddingIncrementPrice",
                      e.target.value
                    )
                  }
                  className={`w-full p-3 border-2 rounded-lg  focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                    errors.biddingIncrementPrice
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {errors.biddingIncrementPrice && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.biddingIncrementPrice}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  <Clock className="inline w-4 h-4 mr-1" />
                  Duration *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {durationOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`cursor-pointer p-3 rounded-lg border-2 text-center transition-all ${
                        (option.value === "other" && showCustomDuration) ||
                        (option.value !== "other" &&
                          formData.auctionSettings.duration === option.value)
                          ? "bg-orange-100 text-orange-800 border-orange-500"
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
                  <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
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
                        className={`w-full p-3 border-2 rounded-lg  focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                          errors.endDate ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.endDate && (
                        <p className="text-red-500 text-sm mt-1">
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
                        className={`w-full p-3 border-2 rounded-lg  focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                          errors.endTime ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.endTime && (
                        <p className="text-red-500 text-sm mt-1">
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
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                <Truck className="inline w-4 h-4 mr-1" />
                Shipping Options
              </label>

              <div className="space-y-3">
                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-orange-50 transition-colors">
                  <input
                    type="radio"
                    name="shippingOption"
                    value="local pickup"
                    checked={formData.shippingOption === "local pickup"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shippingOption: e.target.value,
                        shippingCharge: "",
                      })
                    }
                    className="mr-3"
                  />
                  <div>
                    <div className="flex items-center gap-2 font-medium">
                      <MapPin size={16} />
                      Local Pickup Only
                    </div>
                    <p className="text-sm text-gray-600">
                      Buyer picks up the item
                    </p>
                  </div>
                </label>

                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-green-50 transition-colors">
                  <input
                    type="radio"
                    name="shippingOption"
                    value="free shipping"
                    checked={formData.shippingOption === "free shipping"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shippingOption: e.target.value,
                        shippingCharge: "",
                      })
                    }
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-green-700">
                      Free Shipping
                    </div>
                    <p className="text-sm text-gray-600">
                      You cover shipping costs
                    </p>
                  </div>
                </label>

                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-orange-50 transition-colors">
                  <input
                    type="radio"
                    name="shippingOption"
                    value="charge shipping"
                    checked={formData.shippingOption === "charge shipping"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shippingOption: e.target.value,
                      })
                    }
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-orange-700">
                      Charged Shipping
                    </div>
                    <p className="text-sm text-gray-600">Buyer pays shipping</p>
                    {formData.shippingOption === "charge shipping" && (
                      <input
                        type="number"
                        placeholder="Shipping charge"
                        value={formData.shippingCharge}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            shippingCharge: e.target.value,
                          })
                        }
                        className={`mt-2 w-full p-2 border rounded  focus:ring-orange-500 focus:border-orange-500 ${
                          errors.shippingCharge
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                    )}
                  </div>
                </label>
              </div>
              {errors.shippingCharge && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.shippingCharge}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t">
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Specifics Modal */}
      {openSpecificModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl">
            <div className="sticky top-0 bg-white border-b px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Product Specifics</h2>
                <button
                  onClick={() => setOpenSpecificModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-2"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Selected Tags */}
              {Object.keys(tempSpecifics).length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Selected:</h3>
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
              <div className="space-y-6">
                {specifics.map((param) => (
                  <div key={param._id}>
                    <h4 className="font-semibold text-gray-900 mb-3">
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
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                              isSelected
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProductForm;
