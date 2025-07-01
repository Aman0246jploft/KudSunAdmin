import React, { useEffect, useState } from "react";
import Button from "../Atoms/Button/Button";
import { useTheme } from "../../contexts/theme/hook/useTheme";
import { useDispatch } from "react-redux";
import {
  createCategory,
  mainCategory,
} from "../../features/slices/categorySlice";
import { toast } from "react-toastify";

export default function AddCategoryForm({ onClose, initialData, pagination }) {
  const { theme } = useTheme();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
    image: null,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        _id: initialData._id || null,
        name: initialData.name || "",
        image: null, // new file not uploaded yet
        imagePreviewUrl: initialData.image || null, // existing image url to preview
      });
    } else {
      // reset when no initialData (add mode)
      setFormData({
        _id: null,
        name: "",
        image: null,
        imagePreviewUrl: null,
      });
    }
  }, [initialData]);

const handleChange = (e) => {
  const { name, value, files } = e.target;

  if (name === "image" && files && files[0]) {
    const file = files[0];
    const previewUrl = URL.createObjectURL(file);

    setFormData((prev) => ({
      ...prev,
      image: file,
      imagePreviewUrl: previewUrl, // update preview
    }));
  } else {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
};


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Category name is required");
      return;
    }

    const payload = new FormData();
    if (formData._id) {
      payload.append("_id", formData._id);
    }
    payload.append("name", formData.name.trim());
    if (formData.image) {
      payload.append("file", formData.image); // note: backend expects 'file' as multer field
    }

    dispatch(createCategory(payload))
      .then((result) => {
        if (createCategory.fulfilled.match(result)) {
          toast.success("Category Created");
          dispatch(mainCategory(pagination))
            .then((result) => {
              if (!mainCategory.fulfilled.match(result)) {
                const { message, code } = result.payload || {};
                console.error(`Fetch failed [${code}]: ${message}`);
              }
            })
            .catch((error) => {
              console.error("Unexpected error:", error);
            });
        } else {
          const { message, code } = result.payload || {};
          console.error(`createCategory failed [${code}]: ${message}`);
        }
      })
      .catch((error) => {
        console.error("Unexpected error:", error);
        toast.error("Unexpected error occurred");
      });

    // Here you'd call your API with the payload, e.g.:
    // dispatch(saveCategory(payload))
    //   .then(...)
    //   .catch(...)

    console.log("Submitting category:", formData);

    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 rounded"
      style={{
        backgroundColor: theme.colors.background,
        color: theme.colors.textPrimary,
      }}
    >
      <h3
        className="text-lg font-bold"
        style={{ color: theme.colors.textPrimary }}
      >
        {formData._id ? "Edit Category" : "Add New Category"}
      </h3>

      <div>
        <label
          className="block mb-1 font-medium"
          style={{ color: theme.colors.textSecondary }}
        >
          Name
        </label>
        <input
          type="text"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 rounded"
          style={{
            backgroundColor: theme.colors.inputBackground,
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.textPrimary,
          }}
        />
      </div>

      <div>
        <label
          className="block mb-1 font-medium"
          style={{ color: theme.colors.textSecondary }}
        >
          Image
        </label>

        {formData.imagePreviewUrl ? (
          <img
            src={formData.imagePreviewUrl}
            alt="preview"
            className="w-24 h-16 object-cover mb-2 rounded"
          />
        ) : (
          <span className="text-gray-400 block mb-2">No image selected</span>
        )}

        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
          className="w-full p-2 rounded"
          style={{
            backgroundColor: theme.colors.inputBackground,
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.textPrimary,
          }}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          variant="ghost"
          onClick={onClose}
          style={{
            backgroundColor: theme.colors.buttonSecondary,
            color: theme.colors.buttonText,
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          style={{
            backgroundColor: theme.colors.buttonPrimary,
            color: theme.colors.buttonText,
          }}
        >
          {formData._id ? "Update" : "Submit"}
        </Button>
      </div>
    </form>
  );
}
