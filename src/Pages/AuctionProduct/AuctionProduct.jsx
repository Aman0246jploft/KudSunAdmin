import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteProduct,
  productList,
  productListAuction,
  toggleProductDisable,
} from "../../features/slices/productSlice";
import Modal from "./Modal";
import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css
import { FiCheckCircle, FiEdit, FiSlash, FiTrash2 } from "react-icons/fi";
import { useTheme } from "../../contexts/theme/hook/useTheme";
import AddProductForm from "./AddProductForm";
import DataTable from "../../Component/Table/DataTable";
import Pagination from "../../Component/Atoms/Pagination/Pagination";
import Button from "../../Component/Atoms/Button/Button";
import { MdInfo } from "react-icons/md";
import { useNavigate } from "react-router";
import { FaCircleInfo } from "react-icons/fa6";
import { mainCategory, subCategory } from "../../features/slices/categorySlice";
import EditProductForm from "./EditProductForm";

export default function AuctionProduct() {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({ pageNo: 1, size: 10 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { categoryList } = useSelector((state) => state.category);
  const [subCategories, setSubCategories] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filters, setFilters] = useState({
    keyWord: "",
    shippingType: "",
    categoryId: "",
    subCategoryId: "",
    tags: [],
    minPrice: null,
    maxPrice: null,
  });
  const [shippingType, setShippingType] = useState("");
  const shippingOptions = [
    { label: "Shipping Type", value: "" },
    { label: "Free", value: "free" },
    { label: "Charged", value: "charged" },
  ];
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const { productsListAuction, loading, error } = useSelector(
    (state) => state.product || {}
  );

  const { products = [], total = 0 } = productsListAuction || {};

  useEffect(() => {
    const payload = {
      ...pagination,
      ...filters,
      deliveryFilter: shippingType,
      minPrice: filters.minPrice || undefined,
      maxPrice: filters.maxPrice || undefined,
    };

    dispatch(mainCategory({ pageNo: 1, size: 10000000 }));
    dispatch(productListAuction(payload))
      .then((result) => {
        if (!productListAuction.fulfilled.match(result)) {
          const { message, code } = result.payload || {};
          console.error(`Fetch failed [${code}]: ${message}`);
        }
      })
      .catch((error) => {
        console.error("Unexpected error:", error);
      });
  }, [dispatch, pagination, filters, shippingType]);

  useEffect(() => {
    if (selectedCategory) {
      dispatch(
        subCategory({ categoryId: selectedCategory, pageNo: 1, size: 10000000 })
      ).then((res) => {
        if (subCategory.fulfilled.match(res)) {
          setSubCategories(res.payload?.data?.data || []);
        }
      });
    } else {
      setSubCategories([]);
    }
  }, [selectedCategory]);

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setEditMode(true);
    setIsModalOpen(true); // this was missing
  };

  const handleToggleStatus = (product) => {
    const updatedStatus = !product.isDisable;
    // Create FormData
    const formData = new FormData();
    formData.append("isDisable", updatedStatus);

    dispatch(toggleProductDisable({ id: product._id, formData }))
      .unwrap()
      .then((res) => {
        dispatch(productListAuction(pagination));
      })
      .catch((err) => {
        console.error("Failed to update product status:", err);
      });
  };

  const handleDelete = (product) => {
    const updatedStatus = !product.isDisable;
    // Create FormData
    const formData = new FormData();
    formData.append("isDisable", updatedStatus);
    confirmAlert({
      title: "Confirm to submit",
      message: "Are you sure to delete this.",
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            dispatch(deleteProduct({ id: product._id, formData }))
              .unwrap()
              .then((res) => {
                dispatch(productListAuction(pagination));
              })
              .catch((err) => {
                console.error("Failed to update product status:", err);
              });
          },
        },
        {
          label: "No",
          onClick: () => {},
        },
      ],
    });
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
      key: "description",
      label: "Description",
      width: "25%",
    },
    {
      key: "Category/SubCategory",
      label: "Category/SubCategory",
      width: "25%",
      render: (_, row) => {
        const cat = row?.categoryId?.name || "N/A";
        const subCat = row?.subCategoryName || "N/A";
        return `${cat} / ${subCat}`;
      },
    },
    {
      key: "status",
      label: "Status",
      width: "25%",
      render: (_, row) => (
        <div className="flex gap-2">
            <select
            value={row.isDisable ? "disabled" : "enabled"}
            onChange={() => handleToggleStatus(row)}
            className="border rounded px-2 py-1 text-sm focus:outline-none "
            style={{
              color: row.isDisable ? "#4b5563" : "#166534",
            }}
          >
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      width: "10%",
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/productInfo/${row?._id}`)}
            className="p-1 rounded hover:bg-gray-200"
            style={{ color: theme.colors.textPrimary }}
          >
            <FaCircleInfo size={18} />
          </button>
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
            Auction List
          </div>

          <div className=" flex justify-center items-center gap-3">
            <div className=" flex gap-2">
              {/* Price Range Inputs */}
              {/* <input
                type="number"
                min="0"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, minPrice: e.target.value }));
                  setPagination((prev) => ({ ...prev, pageNo: 1 }));
                }}
                className="px-2 py-1 border rounded w-24"
              />
              <span className="mx-1">-</span>
              <input
                type="number"
                min="0"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, maxPrice: e.target.value }));
                  setPagination((prev) => ({ ...prev, pageNo: 1 }));
                }}
                className="px-2 py-1 border rounded w-24"
              /> */}

              <select
                value={shippingType}
                onChange={(e) => setShippingType(e.target.value)}
                className="border outline-none rounded px-2 py-1 text-sm"
              >
                {shippingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Category Dropdown */}
              <select
                value={selectedCategory}
                onChange={(e) => {
                  const categoryId = e.target.value;
                  setSelectedCategory(categoryId);
                  setSelectedSubCategory("");
                  setFilters((prev) => ({
                    ...prev,
                    categoryId,
                    subCategoryId: "",
                  }));
                  setPagination((prev) => ({ ...prev, pageNo: 1 }));
                }}
                className="px-3 py-2 border rounded-md"
              >
                <option value="">All Categories</option>
                {categoryList &&
                  Array.isArray(categoryList?.data) &&
                  categoryList?.data?.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
              </select>

              {/* Subcategory Dropdown */}
              <select
                value={selectedSubCategory}
                onChange={(e) => {
                  const subCategoryId = e.target.value;
                  setSelectedSubCategory(subCategoryId);
                  setFilters((prev) => ({
                    ...prev,
                    subCategoryId,
                  }));
                  setPagination((prev) => ({ ...prev, pageNo: 1 }));
                }}
                className="px-3 py-2 border rounded-md"
                disabled={!selectedCategory}
              >
                <option value="">All Subcategories</option>
                {subCategories?.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <input
              className="p-1 outline-none border"
              type="text"
              placeholder="Search product title or keyword"
              value={filters.keyWord}
              onChange={(e) => {
                setFilters({ ...filters, keyWord: e.target.value });
                setPagination((prev) => ({ ...prev, pageNo: 1 }));
              }}
            />
          </div>

          {/* <Button
            onClick={() => setIsModalOpen(true)}
            style={{
              backgroundColor: theme.colors.buttonPrimary,
              color: theme.colors.buttonText,
            }}
          >
            Add Product
          </Button> */}
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditMode(false);
          setSelectedProduct(null);
        }}
      >
        {editMode ? (
          <EditProductForm
            closeForm={() => {
              setIsModalOpen(false);
              setEditMode(false);
              setSelectedProduct(null);
            }}
            editMode={true}
            productData={selectedProduct}
            onProductUpdate={() => dispatch(productListAuction(pagination))}
          />
        ) : (
          <AddProductForm
            closeForm={() => {
              setIsModalOpen(false);
              setEditMode(false);
              setSelectedProduct(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}
