import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchThreads, deleteThread, toggleThreadStatus, exportThreads } from "../../features/slices/threadSlice";
import { mainCategory, subCategory } from "../../features/slices/categorySlice";
import DataTable from "../../Component/Table/DataTable"; 
import { useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa6";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css
import { useTheme } from "../../contexts/theme/hook/useTheme";
import Pagination from "../../Component/Atoms/Pagination/Pagination";
import {
  exportToCSV,
  exportToExcel,
  formatThreadDataForExport,
  generateFilename
} from "../../utils/exportUtils";
import { toast } from "react-toastify";

export default function Thread() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const { threads, loading, error, totalPages, totalRecords } = useSelector((state) => state.thread);
  const { categoryList } = useSelector((state) => state.category);

  // Local state for filters
  const [filters, setFilters] = useState({
    pageNo: 1,
    size: 10,
    keyWord: "",
    categoryId: "",
    subCategoryId: "",
    tags: [],
    minBudget: "",
    maxBudget: "",
    sortBy: "createdAt",
    sortOrder: "desc"
  });

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [subCategories, setSubCategories] = useState([]);
  // const [tags, setTags] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);

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
          setSubCategories(res.payload?.data?.data || []);
        }
      });
    } else {
      setSubCategories([]);
    }
  }, [selectedCategory, dispatch]);

  // Fetch threads when filters change
  useEffect(() => {
    fetchThreadsData();
  }, [filters]);

  const fetchThreadsData = () => {
    // Remove empty filters before sending to backend
    const apiFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== "" && value !== null && value !== undefined &&
        (Array.isArray(value) ? value.length > 0 : true)) {
        acc[key] = value;
      }
      return acc;
    }, {});

    dispatch(fetchThreads(apiFilters));
  };

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
      // Reset to first page when filters change (except for page changes)
      pageNo: name === 'pageNo' ? value : 1
    }));
  };

  // const handleDelete = (threadId) => {
  //   confirmAlert({
  //     title: "Confirm to submit",
  //     message: "Are you sure to delete this.",
  //     buttons: [
  //       {
  //         label: "Yes",
  //         onClick: () => {
  //           dispatch(deleteThread(threadId))
  //             .unwrap()
  //             .then(() => {
  //               fetchThreadsData();
  //             })
  //             .catch((err) => {
  //               console.error("Failed to delete thread:", err);
  //             });
  //         },
  //       },
  //       {
  //         label: "No",
  //         onClick: () => { },
  //       },
  //     ],
  //   });
  // };


  const handleDelete = (threadId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this?");
    if (!confirmDelete) return;

    dispatch(deleteThread(threadId))
      .unwrap()
      .then(() => {
        fetchThreadsData();
      })
      .catch((err) => {
        console.error("Failed to delete thread:", err);
      });
  };



  const handleToggleStatus = async (threadId) => {
    try {
      dispatch(toggleThreadStatus(threadId)).then(() => {
        fetchThreadsData();
      })
    } catch (error) {
      console.error("Failed to update thread status:", error);
    }
  };

  const handleSort = (sortKey) => {
    handleFilterChange('sortBy', sortKey);
    handleFilterChange('sortOrder', filters?.sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const resetAllFilters = () => {
    setFilters({
      pageNo: 1,
      size: 10,
      keyWord: "",
      categoryId: "",
      subCategoryId: "",
      tags: [],
      minBudget: "",
      maxBudget: "",
      sortBy: "createdAt",
      sortOrder: "desc"
    });
    setSelectedCategory("");
    setSelectedSubCategory("");
    // setTags([]);
  };

  // Export handlers
  const handleExportCSV = async () => {
    setExportLoading(true);
    try {
      // Remove empty filters before sending to backend
      const exportFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== "" && value !== null && value !== undefined &&
          (Array.isArray(value) ? value.length > 0 : true)) {
          acc[key] = value;
        }
        return acc;
      }, {});

      const result = await dispatch(exportThreads(exportFilters)).unwrap();
      const formattedData = formatThreadDataForExport(result.data?.products || []);
      const filename = generateFilename('threads', exportFilters);
      exportToCSV(formattedData, filename);
      toast.success('Threads exported to CSV successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export threads');
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setExportLoading(true);
    try {
      // Remove empty filters before sending to backend
      const exportFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== "" && value !== null && value !== undefined &&
          (Array.isArray(value) ? value.length > 0 : true)) {
          acc[key] = value;
        }
        return acc;
      }, {});

      const result = await dispatch(exportThreads(exportFilters)).unwrap();
      const formattedData = formatThreadDataForExport(result.data?.products || []);
      const filename = generateFilename('threads', exportFilters);
      exportToExcel(formattedData, filename, 'Threads');
      toast.success('Threads exported to Excel successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export threads');
    } finally {
      setExportLoading(false);
    }
  };

  // Table columns configuration 
  const columns = [
    {
      key: "serial",
      label: "S.No",
      width: "10%",
      render: (_, __, rowIndex) =>
        (filters?.pageNo - 1) * filters?.size + rowIndex + 1,
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
      key: "category",
      label: "Category/SubCategory",
      width: "25%",
      render: (_, row) => {
        const cat = row?.categoryId?.name || "N/A";
        const subCat = row?.subCategoryId || "N/A";
        return `${cat} / ${subCat}`;
      }
    },

    {
      key: "totalAssociatedProducts",
      label: "Product",
      width: "10%",
    },



    {
      key: "status",
      label: "Status",
      width: "25%",
      render: (_, row) => (
        <div className="flex md:justify-start justify-end gap-2">
          <select
            value={row?.isDisable ? "disabled" : "enabled"}
            onChange={() => handleToggleStatus(row._id)}
            className="border rounded px-2 py-1 text-sm focus:outline-none"
            style={{
              color: row?.isDisable ? "#4b5563" : "#166534",
            }}
          >
            <option value="enabled">Active</option>
            <option value="disabled">Inactive</option>
          </select>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      width: "10%",
      render: (_, row) => (
        <div className="flex gap-2 md:justify-start justify-end">
          <button
            onClick={() => navigate(`/thread/${row._id}`)}
            className="p-1 rounded hover:bg-gray-200"
            style={{ color: theme.colors.textPrimary }}
          >
            <FaEye size={18} />
          </button>
          <button
            onClick={() => navigate(`/thread/edit/${row._id}`)}
            className="p-1 rounded hover:bg-gray-200"
            style={{ color: theme.colors.textPrimary }}
          >
            <FiEdit size={18} />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="p-1 rounded hover:bg-gray-200"
            style={{ color: theme.colors.error }}
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const rowHeight = 40;
  const headerHeight = 56;
  const fixedRows = filters?.size;
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
          className="flex flex-col xl:flex-row xl:justify-between xl:items-center px-2 py-2 gap-4 xl:gap-0"
          style={{ borderBottom: `1px solid ${theme.colors.borderLight}` }}
        >
          <div className="flex justify-between items-center w-full xl:w-auto">
            <div
              className="font-semibold text-xl text-start whitespace-nowrap lg:text-left"
              style={{ color: theme.colors.textPrimary }}
            >
              Thread List
            </div>

            {/* Export Buttons for mobile */}
            <div className="flex gap-2 xl:hidden">
              <button
                onClick={handleExportCSV}
                disabled={exportLoading}
                className="px-3 py-1.5 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {exportLoading ? 'Exporting...' : 'CSV'}
              </button>
              <button
                onClick={handleExportExcel}
                disabled={exportLoading}
                className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {exportLoading ? 'Exporting...' : 'Excel'}
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:justify-center lg:items-center gap-3">


            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min="0"
                  placeholder="Min Budget"
                  value={filters?.minBudget}
                  onChange={(e) => handleFilterChange("minBudget", e.target.value)}
                  className="px-2 py-1 border rounded w-20 sm:w-24 text-sm"
                />
                <span className="mx-1">-</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Max Budget"
                  value={filters?.maxBudget}
                  onChange={(e) => handleFilterChange("maxBudget", e.target.value)}
                  className="px-2 py-1 border rounded w-20 sm:w-24 text-sm"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    const categoryId = e.target.value;
                    setSelectedCategory(categoryId);
                    setSelectedSubCategory("");
                    handleFilterChange("categoryId", categoryId);
                    handleFilterChange("subCategoryId", "");
                  }}
                  className="px-3 py-2 border rounded-md text-sm w-full sm:w-auto min-w-0"
                >
                  <option value="">All Categories</option>
                  {categoryList?.data?.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedSubCategory}
                  onChange={(e) => {
                    const subCategoryId = e.target.value;
                    setSelectedSubCategory(subCategoryId);
                    handleFilterChange("subCategoryId", subCategoryId);
                  }}
                  className="px-3 py-2 border rounded-md text-sm w-full sm:w-auto min-w-0"
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
            </div>

            <input
              className="p-2 outline-none border rounded text-sm w-full sm:w-auto min-w-0"
              type="text"
              placeholder="Search thread"
              value={filters?.keyWord}
              onChange={(e) => handleFilterChange("keyWord", e.target.value)}
            />



            {/* Export Buttons for larger screens */}
            <div className="hidden xl:flex gap-2">
              <button
                onClick={handleExportCSV}
                disabled={exportLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {exportLoading ? 'Exporting...' : 'Export CSV'}
              </button>
              <button
                onClick={handleExportExcel}
                disabled={exportLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {exportLoading ? 'Exporting...' : 'Export Excel'}
              </button>
            </div>
          </div>
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
                  Loading threads...
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
              <DataTable columns={columns} data={threads} />
            </div>
          )}
        </div>

        <div
          className="py-2 px-2 border-t"
          style={{ borderColor: theme.colors.borderLight }}
        >
          <div className="flex justify-end">
            <Pagination
              pageNo={filters?.pageNo}
              size={filters?.size}
              total={totalRecords}
              onChange={(page) => handleFilterChange("pageNo", page)}
              theme={theme}
            />
          </div>
        </div>
      </div>
    </div>
  );
}