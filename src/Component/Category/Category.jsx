import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { mainCategory, updateCategory } from "../../features/slices/categorySlice";
import DataTable from "../Table/DataTable";
import Pagination from "../Atoms/Pagination/Pagination";
import Modal from "./Modal";
import AddCategoryForm from "./AddCategoryForm";
import Button from "../Atoms/Button/Button";
import { FaEye } from "react-icons/fa";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useTheme } from "../../contexts/theme/hook/useTheme";
import { useNavigate } from "react-router-dom"; // Fixed import
import { format } from "date-fns";

import "react-confirm-alert/src/react-confirm-alert.css";
import Image from "../Atoms/Image/Image";

export default function Category() {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({ pageNo: 1, size: 10 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const { categoryList, loading, error } = useSelector(
    (state) => state.category || {}
  );
  
  // Safe destructuring with default values
  const { data = [], total = 0 } = categoryList || {};

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchCategories = useCallback(async () => {
    try {
      const result = await dispatch(mainCategory(pagination));
      if (!mainCategory.fulfilled.match(result)) {
        const { message, code } = result.payload || {};
        console.error(`Fetch failed [${code}]: ${message}`);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  }, [dispatch, pagination]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Memoized handlers to prevent unnecessary re-renders
  const handleEdit = useCallback((category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  }, []);

const handleDelete = useCallback(async (category) => {
  const action = category.isDeleted ? "restore" : "delete";
  const confirmed = window.confirm(`Are you sure you want to ${action} this category?`);
  if (!confirmed) return;

  try {
    await dispatch(updateCategory({ 
      id: category._id, 
      isDeleted: !category.isDeleted 
    }));
    // Refresh the list after successful update
    fetchCategories();
  } catch (err) {
    console.error("Failed to update category status:", err);
  }
}, [dispatch, fetchCategories]);


  const handlePageChange = useCallback((newPage) => {
    setPagination((prev) => ({ ...prev, pageNo: newPage }));
  }, []);

  const handleCloseModal = useCallback(() => {
    setEditingCategory(null);
    setIsModalOpen(false);
  }, []);

  const handleOpenAddModal = useCallback(() => {
    setEditingCategory(null); // Ensure we're not editing
    setIsModalOpen(true);
  }, []);

  const handleViewSubCategory = useCallback((categoryId) => {
    navigate(`/subCategory/${categoryId}`);
  }, [navigate]);

  // Format date safely
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd-MM-yyyy");
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid Date";
    }
  }, []);

  // Render image safely
  const renderImage = useCallback((imageUrl) => {
    if (!imageUrl) {
      return <span className="text-gray-400">No image</span>;
    }
    return (
      <Image
        src={imageUrl}
        alt="category"
        className="w-20 h-12 object-cover rounded"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'inline';
        }}
      />
    );
  }, []);

  const columns = [
    {
      key: "serial",
      label: "S.No",
      width: "10%",
      render: (_, __, rowIndex) =>
        (pagination.pageNo - 1) * pagination.size + rowIndex + 1,
    },
    {
      key: "name",
      label: "Name",
      width: "25%",
      render: (value) => value || "N/A",
    },
    {
      key: "image",
      label: "Image",
      width: "25%",
      disableTooltip: true,
      render: renderImage,
    },
    {
      key: "subCategoryCount",
      label: "SubCategory Count",
      width: "25%",
      render: (value) => value || 0,
    },
    {
      key: "createdAt",
      label: "Created At",
      width: "20%",
      render: formatDate,
    },
    {
      key: "actions",
      label: "Actions",
      width: "10%",
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewSubCategory(row?._id)}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
            title="View SubCategory"
            style={{ color: theme.colors.textPrimary }}
            disabled={!row?._id}
          >
            <FaEye size={18} />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
            title="Edit Category"
            style={{ color: theme.colors.textPrimary }}
          >
            <FiEdit size={18} />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
            title={row.isDeleted ? "Restore Category" : "Delete Category"}
            style={{ color: theme.colors.error }}
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  // Fixed height calculations to prevent UI deflection
  const rowHeight = 40;
  const headerHeight = 56;
  const fixedRows = pagination.size;
  const minTableHeight = headerHeight + rowHeight * fixedRows;

  return (
    <div style={{ backgroundColor: theme.colors.background }}>
      <div
        className="rounded-lg shadow-sm border overflow-hidden"
        style={{
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.backgroundSecondary,
          color: theme.colors.textPrimary,
        }}
      >
        {/* Header */}
        <div
          className="flex justify-between items-center px-2 py-2"
          style={{ borderBottom: `1px solid ${theme.colors.borderLight}` }}
        >
          <div
            className="font-semibold text-xl"
            style={{ color: theme.colors.textPrimary }}
          >
            Category Management
          </div>
          <Button
            onClick={handleOpenAddModal}
            style={{
              backgroundColor: theme.colors.buttonPrimary,
              color: theme.colors.buttonText,
            }}
          >
            Add Category
          </Button>
        </div>

        {/* Table Container */}
        <div className="relative" style={{ minHeight: `${minTableHeight}px` }}>
          {loading ? (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ backgroundColor: theme.colors.backgroundSecondary }}
            >
              <div className="text-center">
                <div
                  className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto"
                  style={{ borderColor: theme.colors.primary }}
                />
                <p
                  className="mt-2"
                  style={{ color: theme.colors.textSecondary }}
                >
                  Loading categories...
                </p>
              </div>
            </div>
          ) : error ? (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ backgroundColor: theme.colors.backgroundSecondary }}
            >
              <div className="text-center">
                <div
                  className="text-lg font-semibold mb-2"
                  style={{ color: theme.colors.error }}
                >
                  Error Loading Categories
                </div>
                <p style={{ color: theme.colors.textSecondary }}>
                  {error}
                </p>
                <Button
                  onClick={fetchCategories}
                  className="mt-4"
                  style={{
                    backgroundColor: theme.colors.buttonPrimary,
                    color: theme.colors.buttonText,
                  }}
                >
                  Retry
                </Button>
              </div>
            </div>
          ) : data.length === 0 ? (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ backgroundColor: theme.colors.backgroundSecondary }}
            >
              <div className="text-center">
                <p
                  className="text-lg"
                  style={{ color: theme.colors.textSecondary }}
                >
                  No categories found
                </p>
                <Button
                  onClick={handleOpenAddModal}
                  className="mt-4"
                  style={{
                    backgroundColor: theme.colors.buttonPrimary,
                    color: theme.colors.buttonText,
                  }}
                >
                  Add Your First Category
                </Button>
              </div>
            </div>
          ) : (
            <div className="px-1 pt-1">
              <DataTable columns={columns} data={data} />
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {!loading && !error && data.length > 0 && (
          <div
            className="py-2 px-2 border-t"
            style={{ borderColor: theme.colors.borderLight }}
          >
            <div className="flex justify-end">
              <Pagination
                pageNo={pagination.pageNo}
                size={pagination.size}
                total={total}
                onChange={handlePageChange}
                theme={theme}
              />
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <AddCategoryForm
          onClose={handleCloseModal}
          initialData={editingCategory}
          pagination={pagination}
          onSuccess={fetchCategories} // Add success callback
        />
      </Modal>
    </div>
  );
}