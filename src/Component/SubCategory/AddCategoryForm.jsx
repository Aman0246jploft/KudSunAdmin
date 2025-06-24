import React, { useState } from "react";
import Button from "../Atoms/Button/Button";
import { useTheme } from "../../contexts/theme/hook/useTheme";
import {
  addSubCategory,
  subCategory,
} from "../../features/slices/categorySlice";
import { useDispatch } from "react-redux";
import { useParams } from "react-router";
import { toast } from "react-toastify";

export default function AddCategoryForm({ onClose, pagination }) {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const param = useParams();
  const [formData, setFormData] = useState({
    name: "",
    image: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
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
    if (formData.name) {
      payload.append("name", formData.name.trim());
    }
    if (formData.image) {
      payload.append("file", formData.image); // note: backend expects 'file' as multer field
    }

    dispatch(addSubCategory({ categoryId: param?.id, formData: payload }))
      .then((result) => {
        if (addSubCategory.fulfilled.match(result)) {
          toast.success("SubCategory Created");

          return dispatch(
            subCategory({ categoryId: param?.id, pagination })
          ).then((result) => {
            if (subCategory.fulfilled.match(result)) {
              onClose();
            } else {
              const { message, code } = result.payload || {};
              console.error(`Fetch failed [${code}]: ${message}`);
            }
          });
        } else {
          const { message, code } = result.payload || {};
          console.error(`SubCategory failed [${code}]: ${message}`);
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
        Add New Category
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
          Submit
        </Button>
      </div>
    </form>
  );
}
