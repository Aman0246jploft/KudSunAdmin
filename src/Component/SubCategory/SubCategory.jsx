import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { mainCategory, subCategory } from "../../features/slices/categorySlice";
import DataTable from "../Table/DataTable";
import Pagination from "../Atoms/Pagination/Pagination";
import Modal from "./Modal";
import AddCategoryForm from "./AddCategoryForm";
import Button from "../Atoms/Button/Button";
import { FiEdit, FiTrash2 } from "react-icons/fi"; // From Feather Icons
import { useTheme } from "../../contexts/theme/hook/useTheme";
import { useNavigate, useParams } from "react-router";
import { FaEye } from "react-icons/fa";
import UpdateCategoryForm from "./UpdateCategoryForm";

export default function SubCategory() {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({ pageNo: 1, size: 10 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  const param = useParams();
  const { subCategoryList, loading, error } = useSelector(
    (state) => state.category || {}
  );
  let { data = [], total = 0 } = subCategoryList || {};

  useEffect(() => {
    if (param?.id)
      dispatch(subCategory({ categoryId: param?.id, pagination }))
        .then((result) => {
          if (!subCategory.fulfilled.match(result)) {
            const { message, code } = result.payload || {};
            console.error(`Fetch failed [${code}]: ${message}`);
          }
        })
        .catch((error) => {
          console.error("Unexpected error:", error);
        });
  }, [dispatch, pagination, param?.id]);

  const handleEdit = (subCat) => {
    try {
      setSelectedSubCategory(subCat); // set selected data
      setIsEditModalOpen(true); // open modal
    } catch (error) {
      console.error("Edit error:", error);
    }
  };

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
    },
    {
      key: "image",
      label: "Image",
      width: "25%",
      render: (value) =>
        value ? (
          <img
            src={value}
            alt="category"
            className="w-20 h-12 object-cover rounded"
          />
        ) : (
          <span className="text-gray-400">No image</span>
        ),
    },
    {
      key: "Parameter",
      label: "Parameter",
      width: "25%",
      render: (_, row) => {
        return (
          <button
            onClick={() => navigate(`/subcategoryParameter/${row?._id}`)}
            className="p-1 rounded hover:bg-gray-200 "
            style={{ color: theme.colors.textPrimary }}
          >
            <FaEye size={18} />
          </button>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      width: "10%",

      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-1 rounded hover:bg-gray-200 "
            style={{ color: theme.colors.textPrimary }}
          >
            <FiEdit size={18} />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-1 rounded hover:bg-gray-200 "
            style={{ color: theme.colors.error }}
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, pageNo: newPage }));
  };

  // Fixed height calculations to prevent UI deflection
  const rowHeight = 40;
  const headerHeight = 56;
  const fixedRows = pagination.size;
  const minTableHeight = headerHeight + rowHeight * fixedRows;

  return (
    <div style={{ backgroundColor: theme.colors.background }}>
      <div
        className="rounded-lg shadow-sm border overflow-hidden "
        style={{
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.backgroundSecondary,
          color: theme.colors.textPrimary,
        }}
      >
        <div
          className="flex justify-between items-center px-2 py-2"
          style={{ borderBottom: `1px solid ${theme.colors.borderLight}` }}
        >
          <div
            className="font-semibold text-xl"
            style={{ color: theme.colors.textPrimary }}
          >
            SubCategory
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            style={{
              backgroundColor: theme.colors.buttonPrimary,
              color: theme.colors.buttonText,
            }}
          >
            Add SubCategory
          </Button>
        </div>

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
                ></div>
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
              <div
                className="text-center font-semibold"
                style={{ color: theme.colors.error }}
              >
                Error: {error}
              </div>
            </div>
          ) : (
            <div className="px-1 pt-1">
              <DataTable columns={columns} data={data} />
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        <div
          className="py-2 px-2 border-t "
          style={{ borderColor: theme.colors.borderLight }}
        >
          <div className="flex justify-end">
            <Pagination
              pageNo={pagination.pageNo}
              size={pagination.size}
              total={total}
              onChange={handlePageChange}
              theme={theme} // pass theme if Pagination supports it
            />
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <AddCategoryForm
          onClose={() => setIsModalOpen(false)}
          pagination={pagination}
        />
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <UpdateCategoryForm
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedSubCategory(null);
          }}
          pagination={pagination}
          subCategoryInfo={selectedSubCategory}
        />
      </Modal>
    </div>
  );
}
