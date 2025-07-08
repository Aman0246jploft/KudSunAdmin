import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchThreads, deleteThread, toggleThreadStatus } from "../../features/slices/threadSlice";
import { mainCategory, subCategory } from "../../features/slices/categorySlice";
import DataTable from "../../Component/Table/DataTable";
import Button from "../../Component/Atoms/Button/Button";
import InputField from "../../Component/Atoms/InputFields/Inputfield";
import { useNavigate } from "react-router-dom";

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

  // Handle actions
  const handleDelete = async (threadId) => {
    try {
      await dispatch(deleteThread(threadId)).unwrap();
      fetchThreadsData(); // Refresh data after delete
    } catch (error) {
      console.error("Failed to delete thread:", error);
    }
  };

  const handleToggleStatus = async (threadId) => {
    try {
      await dispatch(toggleThreadStatus(threadId)).unwrap();
      fetchThreadsData(); // Refresh data after status change
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
            <div className="flex flex-wrap gap-1 mt-1">
              {row?.tags?.map(tag => (
                <span key={tag} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      key: "userId",
      label: "Author",
      width: "15%",
      render: (_, row) => {
        const user = row.userId;
        return user ? (
          <div className="flex items-center gap-2">
            {user?.profileImage && (
              <img 
                src={user.profileImage} 
                alt={user.userName} 
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <div>
              <div className="font-medium flex items-center gap-1">
                {user?.userName || '-'}
                {user?.isLive && (
                  <span className="w-2 h-2 bg-green-500 rounded-full" title="Online"></span>
                )}
              </div>
              <div className="flex gap-1 text-xs">
                {user?.is_Id_verified && (
                  <span className="text-blue-500">✓ ID Verified</span>
                )}
                {user?.is_Preferred_seller && (
                  <span className="text-green-500">★ Preferred</span>
                )}
              </div>
            </div>
          </div>
        ) : '-';
      }
    },
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
          {row?.isClosed && (
            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs text-center">
              Closed
            </span>
          )}
          {row?.isTrending && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs text-center">
              🔥 Trending
            </span>
          )}
          {row?.isDisable && (
            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs text-center">
              Disabled
            </span>
          )}
          {!row?.isClosed && !row?.isTrending && !row?.isDisable && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs text-center">
              Active
            </span>
          )}
          {row?.createdAt && (
            <span className="text-xs text-gray-500 text-center">
              {new Date(row.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>
      )
    },
    {
      key: "actions",
      label: "Actions",
      width: "8%",
      render: (_, row) => row && (
        <div className="flex flex-col gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/thread/${row._id}`)}
            className="w-full"
          >
            View
          </Button>
          {row.myThread && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/thread/edit/${row._id}`)}
                className="w-full"
              >
                Edit
              </Button>
              <Button
                variant={row.isDisable ? "success" : "warning"}
                size="sm"
                onClick={() => handleToggleStatus(row._id)}
                className="w-full"
              >
                {row.isDisable ? "Activate" : "Deactivate"}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(row._id)}
                className="w-full"
              >
                Delete
              </Button>
            </>
          )}
        </div>
      )
    },
  ];

  return (
    <div className="p-6">
      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InputField
            type="text"
            placeholder="Search by title or keywords"
            value={filters.keyWord}
            onChange={(e) => handleFilterChange("keyWord", e.target.value)}
          />
          
          <select
            className="border rounded-md "
            value={selectedCategory}
            onChange={(e) => {
              const categoryId = e.target.value;
              setSelectedCategory(categoryId);
              setSelectedSubCategory("");
              handleFilterChange("categoryId", categoryId);
              handleFilterChange("subCategoryId", "");
            }}
          >
            <option value="">Select Category</option>
            {categoryList?.data?.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* <select
            className="border rounded-md p-2"
            value={selectedSubCategory}
            onChange={(e) => {
              const subCategoryId = e.target.value;
              setSelectedSubCategory(subCategoryId);
              handleFilterChange("subCategoryId", subCategoryId);
            }}
            disabled={!selectedCategory}
          >
            <option value="">Select Subcategory</option>
            {subCategories?.map((sub) => (
              <option key={sub._id} value={sub._id}>
                {sub.name}
              </option>
            ))}
          </select> */}

          {/* <div className="flex flex-col">
            <InputField
              type="text"
              placeholder="Add tags (press Enter)"
              onKeyPress={handleTagsChange}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {tags?.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-200 px-2 py-1 rounded-full text-sm flex items-center"
                >
                  {tag}
                  <button
                    className="ml-1 text-gray-500 hover:text-gray-700"
                    onClick={() => removeTag(tag)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div> */}

          <div className="flex gap-4">
            <InputField
              type="number"
              placeholder="Min Budget"
              value={filters.minBudget}
              onChange={(e) => handleFilterChange("minBudget", e.target.value)}
            />
            <InputField
              type="number"
              placeholder="Max Budget"
              value={filters.maxBudget}
              onChange={(e) => handleFilterChange("maxBudget", e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <Button
              variant="secondary"
              onClick={resetAllFilters}
            >
              Reset Filters
            </Button>
            {/* <Button
              variant="primary"
              onClick={() => navigate("/thread/create")}
            >
              Create Thread
            </Button> */}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow">
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