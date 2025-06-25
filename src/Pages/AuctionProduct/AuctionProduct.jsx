import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  productList,
  productListAuction,
} from "../../features/slices/productSlice";
import Modal from "./Modal";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useTheme } from "../../contexts/theme/hook/useTheme";
import AddProductForm from "./AddProductForm";
import DataTable from "../../Component/Table/DataTable";
import Pagination from "../../Component/Atoms/Pagination/Pagination";
import Button from "../../Component/Atoms/Button/Button";

export default function AuctionProduct() {
  const dispatch = useDispatch();
  const { theme } = useTheme();

  const [pagination, setPagination] = useState({ pageNo: 1, size: 10 });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { productsListAuction, loading, error } = useSelector(
    (state) => state.product || {}
  );

  const { products = [], total = 0 } = productsListAuction || {};

  useEffect(() => {
    dispatch(productListAuction(pagination))
      .then((result) => {
        if (!productListAuction.fulfilled.match(result)) {
          const { message, code } = result.payload || {};
          console.error(`Fetch failed [${code}]: ${message}`);
        }
      })
      .catch((error) => {
        console.error("Unexpected error:", error);
      });
  }, [dispatch, pagination]);

  const handleEdit = (product) => {
    console.log("Edit product:", product);
    // Implement edit logic or open edit modal
  };

  const handleDelete = (product) => {
    console.log("Delete product:", product);
    // Implement delete confirmation & dispatch action
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
      key: "title",
      label: "Title",
      width: "25%",
    },
    {
      key: "timeRemaining",
      label: "Time Remaining ",
      width: "25%",
    },
    {
      key: "description",
      label: "Description",
      width: "25%",
    },
    {
      key: "image",
      label: "Image",
      width: "25%",
      render: (_, row) => {
        const firstImage = row.productImages?.[0];
        return firstImage ? (
          <img
            src={firstImage}
            alt="product"
            className="w-20 h-12 object-cover rounded"
          />
        ) : (
          <span className="text-gray-400">No image</span>
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
            className="p-1 rounded hover:bg-gray-200"
            style={{ color: theme.colors.textPrimary }}
          >
            <FiEdit size={18} />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-1 rounded hover:bg-gray-200"
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
        <div
          className="flex justify-between items-center px-2 py-2"
          style={{ borderBottom: `1px solid ${theme.colors.borderLight}` }}
        >
          <div
            className="font-semibold text-xl"
            style={{ color: theme.colors.textPrimary }}
          >
            Product List
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            style={{
              backgroundColor: theme.colors.buttonPrimary,
              color: theme.colors.buttonText,
            }}
          >
            Add Product
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
                  Loading products...
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
              <DataTable columns={columns} data={products} />
            </div>
          )}
        </div>

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
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <AddProductForm closeForm={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}
