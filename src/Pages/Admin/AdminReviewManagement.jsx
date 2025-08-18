import React, { useState, useEffect } from 'react';
import DataTable from '../../Component/Table/DataTable';
import Button from '../../Component/Atoms/Button/Button';
import InputField from '../../Component/Atoms/InputFields/Inputfield';
import Pagination from '../../Component/Atoms/Pagination/Pagination';
import { useTheme } from '../../contexts/theme/hook/useTheme';
import authAxiosClient from '../../api/authAxiosClient';
import { toast } from 'react-toastify';
import 'react-confirm-alert/src/react-confirm-alert.css';
import {
  FaStar, FaEye, FaTrash, FaFilter, FaSearch, FaUser, FaTag,
  FaComment, FaImage, FaTimes, FaExclamationTriangle, FaCalendar,
  FaSortAmountDown, FaSortAmountUp, FaUserTie, FaShoppingCart
} from 'react-icons/fa';
import { MdCategory, MdSubdirectoryArrowRight, MdVerified } from 'react-icons/md';
import Image from '../../Component/Atoms/Image/Image';


const AdminReviewManagement = () => {
  const { theme } = useTheme();

  // State for reviews list
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);

  // Pagination state
  const [pagination, setPagination] = useState({
    pageNo: 1,
    size: 20
  });

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    sellerRatingMin: 0,
    sellerRatingMax: 5,
    buyerRatingMin: 0,
    buyerRatingMax: 5,
    categoryId: '',
    subCategoryId: '',
    username: '',
    raterRole: '',
    rating: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    ratingDistribution: [],
    raterRoleDistribution: []
  });

  // Detail modal state
  const [detailModal, setDetailModal] = useState({
    show: false,
    data: null,
    loading: false
  });

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.pageNo.toString(),
        limit: pagination.size.toString(),
        ...filters
      });

      const response = await authAxiosClient.get(`/reviewManagement/admin/reviews?${queryParams}`);
      
      if (response.data?.status) {
        setReviews(response.data.data.reviews || []);
        setTotalRecords(response.data.data.pagination.totalRecords || 0);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch reviews');
      }
    } catch (error) {
      // console.error('Reviews fetch error:', error);
      // toast.error(error.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  // Fetch filter options
  const fetchFilterOptions = async () => {
    try {
      const response = await authAxiosClient.get('/reviewManagement/admin/reviews-filter-options');
      if (response.data?.status) {
        setFilterOptions(response.data.data);
      }
    } catch (error) {
      console.error('Filter options fetch error:', error);
    }
  };

  // Fetch review details
  const fetchReviewDetails = async (reviewId) => {
    try {
      setDetailModal(prev => ({ ...prev, loading: true }));
      const response = await authAxiosClient.get(`/reviewManagement/admin/reviews/${reviewId}`);
      if (response.data?.status) {
        setDetailModal({
          show: true,
          data: response.data.data,
          loading: false
        });
      } else {
        throw new Error('Failed to fetch review details');
      }
    } catch (error) {
      console.error('Review details fetch error:', error);
      toast.error('Failed to fetch review details');
      setDetailModal({ show: false, data: null, loading: false });
    }
  };

  // Delete review
  const deleteReview = async (reviewId, reason = '') => {
    try {
      const response = await authAxiosClient.delete(`/reviewManagement/admin/reviews/${reviewId}`, {
        data: { reason }
      });
      if (response.data?.status) {
        toast.success('Review deleted successfully and ratings recalculated');
        fetchReviews(); // Refresh the list
        setDetailModal({ show: false, data: null, loading: false });
      } else {
        throw new Error(response.data?.message || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Delete review error:', error);
      toast.error(error.message || 'Failed to delete review');
    }
  };

  // Handle delete confirmation
  // const handleDeleteReview = (reviewId, reviewText) => {
  //   confirmAlert({
  //     title: 'Delete Review',
  //     message: (
  //       <div>
  //         <p className="mb-4">Are you sure you want to delete this review?</p>
  //         <div className="bg-gray-100 p-3 rounded text-sm max-w-md">
  //           <strong>Review:</strong> {reviewText.length > 100 ? `${reviewText.substring(0, 100)}...` : reviewText}
  //         </div>
  //         <p className="mt-4 text-red-600 text-sm">
  //           <FaExclamationTriangle className="inline mr-1" />
  //           This will recalculate the user's average rating.
  //         </p>
  //       </div>
  //     ),
  //     buttons: [
  //       {
  //         label: 'Cancel',
  //         onClick: () => { },
  //         className: 'react-confirm-alert-button-cancel'
  //       },
  //       {
  //         label: 'Delete',
  //         onClick: () => deleteReview(reviewId, 'Deleted by admin'),
  //         className: 'react-confirm-alert-button-confirm'
  //       }
  //     ]
  //   });
  // };
  const handleDeleteReview = (reviewId, reviewText) => {
    const message = `Are you sure you want to delete this review`;

    if (window.confirm(message)) {
      deleteReview(reviewId, 'Deleted by admin');
    }
  };


  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    setPagination(prev => ({ ...prev, pageNo: 1 }));
    fetchReviews();
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      search: '',
      sellerRatingMin: 0,
      sellerRatingMax: 5,
      buyerRatingMin: 0,
      buyerRatingMax: 5,
      categoryId: '',
      subCategoryId: '',
      username: '',
      raterRole: '',
      rating: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  // Handle pagination
  const handlePageChange = (newPage, newSize) => {
    setPagination({ pageNo: newPage, size: newSize });
  };

  // Rating display component
  const RatingDisplay = ({ rating, size = 'sm' }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} ${i <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
        />
      );
    }
    return <div className="flex items-center space-x-1">{stars}</div>;
  };

  // Table columns
  const columns = [
    {
      key: 'Product',
      label: 'product',
      render: (_, row) => (
        <div className="flex items-center md:justify-start justify-end  space-x-3">
          <Image
            src={row.product?.productImages?.[0] || '/default-product.png'}
            alt="Product"
            className="w-12 h-12 rounded object-cover"
          />
          <div>
            <p className="font-medium text-sm max-w-xs truncate">{row.product?.title}</p>
            <p className="text-xs text-gray-500">{row.category?.name}</p>
            {row.product?.fixedPrice && (
              <p className="text-xs font-medium ">
                ฿{row.product.fixedPrice.toFixed(2)}
              </p>
            )}
          </div>
        </div>
      )
    },

    {
      key: 'reviewer',
      label: 'reviewer',
      render: (_, row) => (
        <div className="flex items-center md:justify-start justify-end space-x-3">
          <Image
            src={row.reviewer?.profileImage || '/default-avatar.png'}
            alt="Reviewer"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-medium text-sm">{row.reviewer?.userName}</p>
            <p className="text-xs text-gray-500">{row.reviewer?.email}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`text-xs px-2 py-1 rounded ${row.raterRole === 'buyer' ? ' text-blue-800' : ' text-green-800'
                }`}>
                {row.raterRole}
              </span>
              {row.reviewer?.is_Verified_Seller && (
                <MdVerified className="w-4 h-4 text-blue-500" title="Verified Seller" />
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'Reviewed User',
      label: 'reviewedUser',
      render: (_, row) => {

        return (
          <div className="flex items-center md:justify-start justify-end space-x-3">
            <Image
              src={row.reviewedUser?.profileImage || '/default-avatar.png'}
              alt="Reviewed User"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-medium text-sm">{row.reviewedUser?.userName}</p>
              <p className="text-xs text-gray-500">{row.reviewedUser?.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                {row.raterRole === 'buyer' ? (
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-600">Seller Rating:</span>
                    <RatingDisplay rating={row.reviewedUser?.averageRatting || 0} size="sm" />
                    <span className="text-xs">({row.reviewedUser?.totalRatingCount || 0})</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-600">Buyer Rating:</span>
                    <RatingDisplay rating={row.reviewedUser?.averageBuyerRatting || 0} size="sm" />
                    <span className="text-xs">({row.reviewedUser?.totalBuyerRatingCount || 0})</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }
    },
    {
      key: 'reviewDetails',
      label: 'reviewDetails',
      render: (_, row) => {

        return (
          <div className="space-y-1 md:justify-start justify-end flex" >
            <div className="flex items-center space-x-2">
              <RatingDisplay rating={row?.rating} />
              <span className="text-sm font-medium">{row?.rating}/5</span>
            </div>
            <p className="text-sm text-gray-600 max-w-xs truncate">
              {row.reviewText}
            </p>
            {/* <div className="flex items-center space-x-2 text-xs text-gray-500">
              <FaCalendar className="w-3 h-3" />
              {new Date(row.createdAt).toLocaleDateString()}
            </div> */}
          </div>
        )
      }

    },

    {
      key: 'Actions',
      label: 'actions',
      render: (_, row) => (
        <div className="flex md:justify-start justify-end items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchReviewDetails(row._id)}
            title="View Details"
          >
            <FaEye className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteReview(row._id, row.reviewText)}
            className="text-red-600 border-red-200 hover:bg-red-50"
            title="Delete Review"
          >
            <FaTrash className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  // Load data on component mount and filter changes
  useEffect(() => {
    fetchReviews();
    fetchFilterOptions();
  }, [pagination]);


  return (
    <div className="">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Review Management</h1>
          <p className="text-gray-600 mt-1">Manage and moderate platform reviews</p>
        </div>
        <div className="flex space-x-3">
          {/* <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <FaFilter className="w-4 h-4" />
            <span>Filters</span>
          </Button> */}
          {/* <Button
            variant="primary"
            onClick={applyFilters}
            className="flex items-center space-x-2"
          >
            <FaSearch className="w-4 h-4" />
            <span>Search</span>
          </Button> */}
        </div>
      </div>

      {/* Advanced Filters  showFilters||*/} 
      {true && (
        <div className="bg-white mb-2 rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Advanced Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Search</label>
              <InputField
                type="text"
                placeholder="Search reviews, users, products..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            {/* Username */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Username</label>
              <InputField
                type="text"
                placeholder="Search by username..."
                value={filters.username}
                onChange={(e) => handleFilterChange('username', e.target.value)}
              />
            </div>

            {/* Rater Role */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Rater Role</label>
              <select
                value={filters.raterRole}
                onChange={(e) => handleFilterChange('raterRole', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Roles</option>
                <option value="buyer">Buyer (Rating Seller)</option>
                <option value="seller">Seller (Rating Buyer)</option>
              </select>
            </div>

            {/* Rating */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Rating</label>
              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Ratings</option>
                {[1, 2, 3, 4, 5].map(rating => (
                  <option key={rating} value={rating}>{rating} Star{rating > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
              <select
                value={filters.categoryId}
                onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Categories</option>
                {filterOptions.categories.map(category => (
                  <option key={category._id} value={category._id}>{category.name}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Filter Actions */}
          <div className="flex space-x-3 mt-6">
            <Button variant="primary" onClick={applyFilters}>Apply Filters</Button>
            <Button variant="outline" onClick={clearFilters}>Clear All</Button>
          </div>
        </div>
      )}

      {/* Reviews Table */}
      <div className="bg-white rounded-lg shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={reviews}
              loading={loading}
              emptyMessage="No reviews found"
            />

            {/* Pagination */}
            <div className="flex justify-between items-center p-4 border-t">
              {/* <p className="text-sm text-gray-700">
                Showing {((pagination.pageNo - 1) * pagination.size) + 1} to {Math.min(pagination.pageNo * pagination.size, totalRecords)} of {totalRecords} reviews
              </p> */}
              <Pagination
                pageNo={pagination.pageNo}
                size={pagination.size}
                total={totalRecords}
                onChange={handlePageChange}
              />


            </div>
          </>
        )}
      </div>

      {/* Review Detail Modal */}
      {detailModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Review Details</h2>
              <button
                onClick={() => setDetailModal({ show: false, data: null, loading: false })}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                <FaTimes />
              </button>
            </div>

            {detailModal.loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : detailModal.data && (
              <div className="">
                {/* Review Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Rating */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Rating & Review</h3>
                      <div className="flex items-center space-x-4 mb-3">
                        <RatingDisplay rating={detailModal.data.rating} size="lg" />
                        <span className="text-2xl font-bold">{detailModal.data.rating}/5</span>
                        <span className={`px-3 py-1 rounded-full text-sm ${detailModal.data.raterRole === 'buyer'
                          ? ' text-blue-800'
                          : ' text-green-800'
                          }`}>
                          {detailModal.data.raterRole === 'buyer' ? 'Buyer Rating Seller' : 'Seller Rating Buyer'}
                        </span>
                      </div>
                      {detailModal.data.ratingText && (
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Rating Text:</strong> {detailModal.data.ratingText}
                        </p>
                      )}
                      <div className="bg-white p-3 rounded border">
                        <strong>Review:</strong>
                        <p className="mt-1">{detailModal.data.reviewText}</p>
                      </div>
                    </div>

                    {/* Review Images */}
                    {detailModal.data.reviewImages && detailModal.data.reviewImages.length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Review Images</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {detailModal.data.reviewImages.map((image, index) => (
                            <Image
                              key={index}
                              src={image}
                              alt={`Review image ${index + 1}`}
                              className="w-full h-32 object-cover rounded"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Reviewer Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2 flex items-center">
                        <FaUser className="mr-2" />
                        Reviewer Information
                      </h3>
                      <div className="flex items-center space-x-3 mb-3">
                        <Image
                          src={detailModal.data.reviewer?.profileImage || '/default-avatar.png'}
                          alt="Reviewer"
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium">{detailModal.data.reviewer?.userName}</p>
                          <p className="text-sm text-gray-600">{detailModal.data.reviewer?.email}</p>
                          {detailModal.data.reviewer?.phoneNumber && (
                            <p className="text-sm text-gray-600">{detailModal.data.reviewer.phoneNumber}</p>
                          )}
                        </div>
                        {detailModal.data.reviewer?.is_Verified_Seller && (
                          <MdVerified className="w-5 h-5 text-blue-500" title="Verified Seller" />
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Seller Rating:</span>
                          <div className="flex items-center space-x-1">
                            <RatingDisplay rating={detailModal.data.reviewer?.averageRatting || 0} />
                            <span>({detailModal.data.reviewer?.totalRatingCount || 0})</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Buyer Rating:</span>
                          <div className="flex items-center space-x-1">
                            <RatingDisplay rating={detailModal.data.reviewer?.averageBuyerRatting || 0} />
                            <span>({detailModal.data.reviewer?.totalBuyerRatingCount || 0})</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Reviewed User Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2 flex items-center">
                        <FaUserTie className="mr-2" />
                        Reviewed User Information
                      </h3>
                      <div className="flex items-center space-x-3 mb-3">
                        <Image
                          src={detailModal.data.reviewedUser?.profileImage || '/default-avatar.png'}
                          alt="Reviewed User"
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium">{detailModal.data.reviewedUser?.userName}</p>
                          <p className="text-sm text-gray-600">{detailModal.data.reviewedUser?.email}</p>
                          {detailModal.data.reviewedUser?.phoneNumber && (
                            <p className="text-sm text-gray-600">{detailModal.data.reviewedUser.phoneNumber}</p>
                          )}
                        </div>
                        {detailModal.data.reviewedUser?.is_Verified_Seller && (
                          <MdVerified className="w-5 h-5 text-blue-500" title="Verified Seller" />
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Seller Rating:</span>
                          <div className="flex items-center space-x-1">
                            <RatingDisplay rating={detailModal.data.reviewedUser?.averageRatting || 0} />
                            <span>({detailModal.data.reviewedUser?.totalRatingCount || 0})</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Buyer Rating:</span>
                          <div className="flex items-center space-x-1">
                            <RatingDisplay rating={detailModal.data.reviewedUser?.averageBuyerRatting || 0} />
                            <span>({detailModal.data.reviewedUser?.totalBuyerRatingCount || 0})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <FaShoppingCart className="mr-2" />
                    Product Information
                  </h3>
                  <div className="flex items-center space-x-4">
                    <Image
                      src={detailModal.data.product?.productImages?.[0] || '/default-product.png'}
                      alt="Product"
                      className="w-20 h-20 rounded object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-lg">{detailModal.data.product?.title}</p>
                      <p className="text-sm text-gray-600">{detailModal.data.product?.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-600">
                          <MdCategory className="inline mr-1" />
                          {detailModal.data.product?.category?.name}
                        </span>
                        {detailModal.data.product?.fixedPrice && (
                          <span className="text-sm font-medium ">
                            ฿{detailModal.data.product.fixedPrice.toFixed(2)}
                          </span>
                        )}
                        {/* <span className={`text-xs px-2 py-1 rounded ${detailModal.data.product?.condition === 'new'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {detailModal.data.product?.condition}
                        </span> */}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meta Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Additional Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <p>{new Date(detailModal.data.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Updated:</span>
                      <p>{new Date(detailModal.data.updatedAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setDetailModal({ show: false, data: null, loading: false })}
                  >
                    Close
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDeleteReview(detailModal.data._id, detailModal.data.reviewText)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <FaTrash className="w-4 h-4 mr-2" />
                    Delete Review
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviewManagement; 