import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchThreads, deleteThread, toggleThreadStatus } from "../../features/slices/threadSlice";
import { mainCategory, subCategory } from "../../features/slices/categorySlice";
import DataTable from "../../Component/Table/DataTable";
import Button from "../../Component/Atoms/Button/Button";
import InputField from "../../Component/Atoms/InputFields/Inputfield";
import { useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa6";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css

export default function Thread() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
  const [tags, setTags] = useState([]);

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

  const handleTagsChange = (e) => {
    const value = e.target.value;
    if (e.key === 'Enter' && value.trim()) {
      const newTags = [...tags, value.trim()];
      setTags(newTags);
      handleFilterChange('tags', newTags);
      e.target.value = '';
    }
  };

  const removeTag = (tagToRemove) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    handleFilterChange('tags', newTags);
  };



  const handleDelete = (product) => {
    // Create FormData
    const formData = new FormData();
    confirmAlert({
      title: "Confirm to submit",
      message: "Are you sure to delete this.",
      buttons: [
        {
          label: "Yes",
          onClick: () => {
             dispatch(deleteThread(threadId))
              .unwrap()
              .then((res) => {
                fetchThreadsData(); // Refresh data after delete

              })
              .catch((err) => {
                console.error("Failed to update product status:", err);
              });
          },
        },
        {
          label: "No",
          onClick: () => { },
        },
      ],
    });
  };








  const handleToggleStatus = async (threadId) => {
    try {
      dispatch(toggleThreadStatus(threadId)).then(() => {

        fetchThreadsData(); // Refresh data after status change
      })
    } catch (error) {
      console.error("Failed to update thread status:", error);
    }
  };

  const handleSort = (sortKey) => {
    handleFilterChange('sortBy', sortKey);
    handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc');
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
    setTags([]);
  };

  // Table columns configuration
  const columns = [
    {
      key: "serial",
      label: "S.No",
      width: "5%",
      render: (_, __, rowIndex) =>
        (filters.pageNo - 1) * filters.size + rowIndex + 1,
    },
    {
      key: "title",
      label: "Title & Description",
      width: "30%",
      render: (_, row) => (
        <div className="flex items-start gap-2">
          {row?.photos?.[0] && (
            <img
              src={row.photos[0]}
              alt={row.title}
              className="w-12 h-12 rounded object-cover"
            />
          )}
          <div>
            <div className="font-medium">{row.title || '-'}</div>
            <div className="text-sm text-gray-500 mt-1">{row?.description || '-'}</div>
     
          </div>
        </div>
      )
    },
    // {
    //   key: "userId",
    //   label: "Author",
    //   width: "15%",
    //   render: (_, row) => {
    //     const user = row.userId;
    //     return user ? (
    //       <div className="flex items-center gap-2">
    //         {user?.profileImage && (
    //           <img 
    //             src={user.profileImage} 
    //             alt={user.userName} 
    //             className="w-8 h-8 rounded-full object-cover"
    //           />
    //         )}
    //         <div>
    //           <div className="font-medium flex items-center gap-1">
    //             {user?.userName || '-'}
    //             {user?.isLive && (
    //               <span className="w-2 h-2 bg-green-500 rounded-full" title="Online"></span>
    //             )}
    //           </div>
    //           <div className="flex gap-1 text-xs">
    //             {user?.is_Id_verified && (
    //               <span className="text-blue-500">✓ ID Verified</span>
    //             )}
    //             {user?.is_Preferred_seller && (
    //               <span className="text-green-500">★ Preferred</span>
    //             )}
    //           </div>
    //         </div>
    //       </div>
    //     ) : '-';
    //   }
    // },
    {
      key: "category",
      label: "Category/Subcategory",
      width: "15%",
      render: (_, row) => {
        const cat = row?.categoryId?.name || "N/A";
        const subCat = row?.subCategoryId || "N/A";
        return `${cat.charAt(0).toUpperCase() + cat.slice(1)} / ${subCat.charAt(0).toUpperCase() + subCat.slice(1)}`;
      }
    },
    {
      key: "budgetRange",
      label: "Budget",
      width: "10%",
      render: (_, row) => row?.budgetFlexible ? (
        <span className="text-gray-500">Flexible</span>
      ) : row?.budgetRange?.min != null && row?.budgetRange?.max != null ? (
        <span className="font-medium">฿{row.budgetRange.min.toLocaleString()} - ฿{row.budgetRange.max.toLocaleString()}</span>
      ) : '-'
    },
    {
      key: "stats",
      label: "Product Count",
      width: "10%",
      render: (_, row) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm">
            <span title="Products" className="flex items-center gap-1">
              <span className="text-gray-500"></span> {row?.totalAssociatedProducts || 0}
            </span>
          </div>
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      width: "7%",
      render: (_, row) => (
        <div className="flex flex-col gap-1">
          <select
            className="border rounded-md px-2 py-1 text-sm"
            value={row?.isDisable ? "disabled" : (row?.isClosed ? "closed" : "active")}
            onChange={(e) => {
              const newStatus = e.target.value;
              if (newStatus === "disabled" || newStatus === "active") {
                handleToggleStatus(row._id);
              }
            }}
          >
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
            {/* <option value="closed" disabled>Closed</option> */}
          </select>
          {/* {row?.isTrending && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs text-center mt-1">
              🔥 Trending
            </span>
          )}
          {row?.createdAt && (
            <span className="text-xs text-gray-500 text-center mt-1">
              {new Date(row.createdAt).toLocaleDateString()}
            </span>
          )} */}
        </div>
      )
    },
    {
      key: "actions",
      label: "Actions",
      width: "8%",
      render: (_, row) => row && (
        <div className="flex  gap-2">



          <button
            title="View"
            onClick={() => navigate(`/thread/${row._id}`)}
            className="p-1 rounded hover:bg-gray-200"


          >
            <FaEye size={18} />
          </button>



          <>
            <button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/thread/edit/${row._id}`)}
              className="w-full"
              title="Edit"
            >

              <FiEdit size={18} />

            </button>


            <button

              onClick={() => handleDelete(row._id)}
              className="p-1 text-red-500 rounded hover:bg-gray-200"

              title="Delete"
            >
              <FiTrash2 size={18} />
            </button>




          </>

        </div>
      )
    },
  ];

  return (
    <div className="p-6">
      {/* Header Section */}
     

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow">
      <div className=" rounded-lg shadow p-4 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Thread List</h2>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={resetAllFilters}
              className="px-4 py-2 text-sm"
            >
              Reset Filters
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Search Input - Full Width */}
          <div className="col-span-full mb-4">
            <InputField
              type="text"
              placeholder="Search thread title or keyword"
              className="w-full"
              value={filters.keyWord}
              onChange={(e) => handleFilterChange("keyWord", e.target.value)}
            />
          </div>

          {/* Price Range */}
          <div className="flex items-center gap-2">
            <InputField
              type="number"
              placeholder="Min Price"
              className="w-full"
              value={filters.minBudget}
              onChange={(e) => handleFilterChange("minBudget", e.target.value)}
            />
            <span className="text-gray-500">-</span>
            <InputField
              type="number"
              placeholder="Max Price"
              className="w-full"
              value={filters.maxBudget}
              onChange={(e) => handleFilterChange("maxBudget", e.target.value)}
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              className="w-full border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedCategory}
              onChange={(e) => {
                const categoryId = e.target.value;
                setSelectedCategory(categoryId);
                setSelectedSubCategory("");
                handleFilterChange("categoryId", categoryId);
                handleFilterChange("subCategoryId", "");
              }}
            >
              <option value="">All Categories</option>
              {categoryList?.data?.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory Dropdown */}
          <div>
            <select
              className="w-full border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedSubCategory}
              onChange={(e) => {
                const subCategoryId = e.target.value;
                setSelectedSubCategory(subCategoryId);
                handleFilterChange("subCategoryId", subCategoryId);
              }}
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
      </div>
        <DataTable
          data={threads}
          columns={columns}
          loading={loading}
          error={error}
          onSort={handleSort}
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          pagination={{
            currentPage: filters.pageNo,
            totalPages: totalPages,
            totalRecords: totalRecords,
            pageSize: filters.size,
            onPageChange: (page) => handleFilterChange("pageNo", page),
            onPageSizeChange: (size) => handleFilterChange("size", size)
          }}
        />
      </div>
    </div>
  );
}