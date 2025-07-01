import React, { useEffect, useState } from "react";
import Button from "../Atoms/Button/Button";
import { useTheme } from "../../contexts/theme/hook/useTheme";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  addSubCategory,
  subCategory,
} from "../../features/slices/categorySlice";
import { useParams } from "react-router";

export default function UpdateCategoryForm({
  onClose,
  pagination,
  subCategoryInfo,
}) {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const params = useParams()


  const [formData, setFormData] = useState({
    _id: "",
    name: "",
    image: null,
  });

  const [existingImage, setExistingImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (subCategoryInfo) {
      setFormData({
        _id: subCategoryInfo._id || "",
        name: subCategoryInfo.name || "",
        image: null, // reset file input
      });
      setExistingImage(subCategoryInfo.image || null);
      setPreviewImage(null);
    }
  }, [subCategoryInfo]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files?.length > 0) {
      setFormData((prev) => ({ ...prev, image: files[0] }));
      setPreviewImage(URL.createObjectURL(files[0]));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    const payload = new FormData();
    payload.append("subCategoryId", formData._id);
    payload.append("name", formData.name.trim());
    if (formData.image) {
      payload.append("file", formData.image); // multer expects 'file'
    }


    dispatch(
      addSubCategory({
        categoryId: params?.id,
        formData: payload
      })
    )
      .then((result) => {
        if (addSubCategory.fulfilled.match(result)) {
          toast.success("SubCategory Updated");
          dispatch(subCategory({ categoryId: params?.id, pagination }));
          onClose();
        } else {
          const { message, code } = result.payload || {};
          console.error(`Update failed [${code}]: ${message}`);
        }
      })
      .catch((err) => {
        console.error("Unexpected error:", err);
        toast.error("Unexpected error occurred");
      });
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
      <h3 className="text-lg font-bold">Update SubCategory</h3>

      <div>
        <label className="block mb-1 font-medium">Name</label>
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
        <label className="block mb-1 font-medium">Image</label>
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

        {(previewImage || existingImage) && (
          <div className="mt-2">
            <img
              src={previewImage || existingImage}
              alt="Preview"
              className="w-32 h-20 object-cover rounded border"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
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
          Update
        </Button>
      </div>
    </form>
  );
}
