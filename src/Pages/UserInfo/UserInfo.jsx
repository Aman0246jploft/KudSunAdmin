import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTheme } from '../../contexts/theme/hook/useTheme';
import authAxiosClient from '../../api/authAxiosClient';
import DataTable from '../../Component/Table/DataTable';
import Pagination from '../../Component/Atoms/Pagination/Pagination';
import Button from '../../Component/Atoms/Button/Button';
import InputField from '../../Component/Atoms/InputFields/Inputfield';
import { toast } from 'react-toastify';
import {
    FaUser,
    FaStore,
    FaShoppingCart,
    FaComments,
    FaHeart,
    FaMapMarkerAlt,
    FaCalendar,
    FaEye,
    FaMoneyBillWave,
    FaFilter,
    FaClock,
    FaCheck,
    FaTimes,
    FaExclamationTriangle
} from 'react-icons/fa';
import { MdVerified, MdStar, MdPayment } from 'react-icons/md';

export default function UserInfo() {
    const { id } = useParams();
    const { theme } = useTheme();

    // Add custom CSS for line-clamp utility
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .line-clamp-2 {
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
            .line-clamp-3 {
                display: -webkit-box;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    // Main states
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // Tab data states
    const [products, setProducts] = useState([]);
    const [threads, setThreads] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [reviews, setReviews] = useState([]);

    // Pagination states
    const [productsPagination, setProductsPagination] = useState({ pageNo: 1, size: 10 });
    const [threadsPagination, setThreadsPagination] = useState({ pageNo: 1, size: 10 });
    const [transactionsPagination, setTransactionsPagination] = useState({ pageNo: 1, size: 10 });
    const [reviewsPagination, setReviewsPagination] = useState({ pageNo: 1, size: 10 });

    // Total counts for pagination
    const [totals, setTotals] = useState({
        products: 0,
        threads: 0,
        transactions: 0,
        reviews: 0
    });

    // Tab loading states
    const [tabLoading, setTabLoading] = useState(false);
    // Filters
    const [transactionFilters, setTransactionFilters] = useState({
        status: '',
        paymentStatus: '',
        dateFrom: '',
        dateTo: '',
        minAmount: '',
        maxAmount: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    // Fetch user basic info
    const fetchUserInfo = async () => {
        try {
            setLoading(true);
            const response = await authAxiosClient.get(`/user/getOtherProfile/${id}`);
            if (response.data?.status === true) {
                setUserInfo(response.data.data);
            } else {
                throw new Error(response.data?.message || 'Failed to fetch user info');
            }
        } catch (error) {
            console.error('Fetch user info error:', error);
            toast.error(error.message || 'Failed to fetch user information');
        } finally {
            setLoading(false);
        }
    };

    // Fetch user's products
    const fetchUserProducts = async () => {
        try {
            setTabLoading(true);
            const response = await authAxiosClient.get(`/product/fetchUserProducts?userId=${id}&pageNo=${productsPagination.pageNo}&size=${productsPagination.size}&saleType=all`);
            if (response.data?.status === true) {
                setProducts(response.data.data.products || []);
                setTotals(prev => ({ ...prev, products: response.data.data.total || 0 }));
            }
        } catch (error) {
            console.error('Fetch user products error:', error);
            toast.error('Failed to fetch user products');
        } finally {
            setTabLoading(false);
        }
    };

    // Fetch user's threads
    const fetchUserThreads = async () => {
        try {
            setTabLoading(true);
            const response = await authAxiosClient.post('/thread/getThreadByUserId', {
                userId: id,
                pageNo: threadsPagination.pageNo,
                size: threadsPagination.size
            });
            if (response.data?.status === true) {
                setThreads(response.data.data || []);
                // API returns just the threads array, use userInfo.totalThreads for total count
                setTotals(prev => ({ ...prev, threads: userInfo?.totalThreads || response.data.data?.length || 0 }));
            }
        } catch (error) {
            console.error('Fetch user threads error:', error);
            toast.error('Failed to fetch user threads');
        } finally {
            setTabLoading(false);
        }
    };

    // Fetch user's transactions (bought products)
    const fetchUserTransactions = async () => {
        try {
            setTabLoading(true);
            const queryParams = new URLSearchParams();
            queryParams.append('userId', id);
            queryParams.append('pageNo', transactionsPagination.pageNo);
            queryParams.append('size', transactionsPagination.size);

            // Apply filters
            Object.entries(transactionFilters).forEach(([key, value]) => {
                if (value && value.toString().trim() !== '') {
                    queryParams.append(key, value);
                }
            });

            const response = await authAxiosClient.get(`/order/getBoughtProduct?${queryParams}`);
            if (response.data?.status === true) {
                setTransactions(response.data.data.orders || []);
                setTotals(prev => ({ ...prev, transactions: response.data.data.total || 0 }));
            }
        } catch (error) {
            console.error('Fetch user transactions error:', error);
            toast.error('Failed to fetch user transactions');
        } finally {
            setTabLoading(false);
        }
    };

    // Fetch user's reviews
    const fetchUserReviews = async () => {
        try {
            setTabLoading(true);
            const response = await authAxiosClient.get(`/review/user-reviews?userId=${id}&pageNo=${reviewsPagination.pageNo}&size=${reviewsPagination.size}`);
            if (response.data?.status === true) {
                setReviews(response.data.data.reviews || []);
                setTotals(prev => ({ ...prev, reviews: response.data.data.total || 0 }));
            }
        } catch (error) {
            console.error('Fetch user reviews error:', error);
            toast.error('Failed to fetch user reviews');
        } finally {
            setTabLoading(false);
        }
    };

    // Effect to fetch user info on component mount
    useEffect(() => {
        if (id) {
            fetchUserInfo();
        }
    }, [id]);

    // Effect to fetch tab data when tab changes
    useEffect(() => {
        if (!userInfo) return;

        switch (activeTab) {
            case 'products':
                fetchUserProducts();
                break;
            case 'threads':
                fetchUserThreads();
                break;
            case 'transactions':
                fetchUserTransactions();
                break;
            case 'reviews':
                fetchUserReviews();
                break;
            default:
                break;
        }
    }, [activeTab, userInfo, productsPagination, threadsPagination, transactionsPagination, reviewsPagination]);

    // Handle tab change
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        // Reset pagination when changing tabs
        switch (tab) {
            case 'products':
                setProductsPagination({ pageNo: 1, size: 10 });
                break;
            case 'threads':
                setThreadsPagination({ pageNo: 1, size: 10 });
                break;
            case 'transactions':
                setTransactionsPagination({ pageNo: 1, size: 10 });
                break;
            case 'reviews':
                setReviewsPagination({ pageNo: 1, size: 10 });
                break;
        }
    };

    // Handle pagination changes
    const handleProductsPageChange = (newPage) => {
        setProductsPagination(prev => ({ ...prev, pageNo: newPage }));
    };

    const handleThreadsPageChange = (newPage) => {
        setThreadsPagination(prev => ({ ...prev, pageNo: newPage }));
    };

    const handleTransactionsPageChange = (newPage) => {
        setTransactionsPagination(prev => ({ ...prev, pageNo: newPage }));
    };

    const handleReviewsPageChange = (newPage) => {
        setReviewsPagination(prev => ({ ...prev, pageNo: newPage }));
    };

    // Handle transaction filter changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setTransactionFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        setTransactionsPagination({ pageNo: 1, size: 10 });
        fetchUserTransactions();
    };

    const clearFilters = () => {
        setTransactionFilters({
            status: '',
            paymentStatus: '',
            dateFrom: '',
            dateTo: '',
            minAmount: '',
            maxAmount: ''
        });
        setTransactionsPagination({ pageNo: 1, size: 10 });
        setTimeout(() => {
            fetchUserTransactions();
        }, 100);
    };

    // Get status badge
    const getStatusBadge = (status) => {
        const statusConfig = {
            'Pending': { color: '#f59e0b', bg: '#fef3c7', icon: FaClock },
            'Completed': { color: '#10b981', bg: '#d1fae5', icon: FaCheck },
            'Cancelled': { color: '#ef4444', bg: '#fee2e2', icon: FaTimes },
            'Shipped': { color: '#3b82f6', bg: '#dbeafe', icon: FaShoppingCart },
            'Delivered': { color: '#10b981', bg: '#d1fae5', icon: FaCheck }
        };

        const config = statusConfig[status] || { color: '#6b7280', bg: '#f3f4f6', icon: FaClock };
        const Icon = config.icon;

  return (
            <span
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                style={{ color: config.color, backgroundColor: config.bg }}
            >
                <Icon className="w-3 h-3 mr-1" />
                {status}
            </span>
        );
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB'
        }).format(amount || 0);
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

      // Table columns for products
  const productColumns = [
    {
      key: 'title',
      label: 'Product Title',
      render: (value, row) => (
        <div className="flex items-center space-x-3">
          {row.productImages?.[0] && (
            <div className="relative">
              <img 
                src={row.productImages[0]} 
                alt={value}
                className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200 shadow-sm"
              />
              {row.isNew && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded-full font-medium">
                  New
                </span>
              )}
            </div>
          )}
          <div className="flex-1">
            <div className="font-medium text-gray-800 mb-1" style={{ color: theme.colors.textPrimary }}>
              {value}
            </div>
            <div className="flex items-center space-x-2">
              <span 
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  row.saleType === 'auction' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {row.saleType === 'auction' ? '🔨 Auction' : '💰 Fixed Price'}
              </span>
              {row.saleType === 'auction' && row.totalBidsPlaced > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  {row.totalBidsPlaced} bid{row.totalBidsPlaced !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'price',
      label: 'Price / Bid Info',
      render: (value, row) => (
        <div>
          {row.saleType === 'auction' ? (
            <div>
              <div className="font-medium text-green-600">
                Starting: {formatCurrency(row.auctionSettings?.startingPrice || 0)}
              </div>
              {row.auctionSettings?.currentBid && (
                <div className="text-sm font-medium text-blue-600">
                  Current: {formatCurrency(row.auctionSettings.currentBid)}
                </div>
              )}
              <div className="text-xs text-gray-500">
                {row.auctionSettings?.isBiddingOpen ? 'Open for bidding' : 'Bidding closed'}
              </div>
            </div>
          ) : (
            <div className="font-medium text-gray-800" style={{ color: theme.colors.textPrimary }}>
              {formatCurrency(row.fixedPrice)}
            </div>
          )}
        </div>
      )
    },
    // {
    //   key: 'status',
    //   label: 'Status',
    //   render: (value, row) => (
    //     <div className="space-y-1">
    //       {getStatusBadge(value)}
    //       {row.saleType === 'auction' && row.auctionSettings?.biddingEndsAt && (
    //         <div className="text-xs text-gray-500">
    //           Ends: {formatDate(row.auctionSettings.biddingEndsAt)}
    //         </div>
    //       )}
    //     </div>
    //   )
    // },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value) => (
        <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
          {formatDate(value)}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, row) => (
        <Button
          onClick={() => window.open(`/productInfo/${row._id}`, '_blank')}
          className="text-xs transition-all duration-200 hover:scale-105"
          style={{
            backgroundColor: theme.colors.buttonSecondary,
            color: theme.colors.buttonText
          }}
        >
          <FaEye className="w-3 h-3 mr-1" />
          View
        </Button>
      )
    }
  ];

    // Table columns for threads
    const threadColumns = [
        {
            key: 'title',
            label: 'Thread Title',
            render: (value) => (
                <div className="font-medium" style={{ color: theme.colors.textPrimary }}>
                    {value}
                </div>
            )
        },
        {
            key: 'totalAssociatedProducts',
            label: 'Associated Products',
            render: (value) => (
                <div className="text-center">
                    <span className="font-medium" style={{ color: theme.colors.textPrimary }}>
                        {value || 0}
                    </span>
                </div>
            )
        },
        {
            key: 'createdAt',
            label: 'Created',
            render: (value) => (
                <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
                    {formatDate(value)}
                </div>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (value, row) => (
                <Button
                    onClick={() => window.open(`/thread/${row._id}`, '_blank')}
                    className="text-xs"
                    style={{
                        backgroundColor: theme.colors.buttonSecondary,
                        color: theme.colors.buttonText
                    }}
                >
                    <FaEye className="w-3 h-3 mr-1" />
                    View
                </Button>
            )
        }
    ];

    // Table columns for transactions
    const transactionColumns = [
        {
            key: 'orderNumber',
            label: 'Order #',
            render: (value, row) => (
                <div className="font-mono text-sm" style={{ color: theme.colors.textPrimary }}>
                    {row._id?.slice(-8) || 'N/A'}
                </div>
            )
        },
        {
            key: 'items',
            label: 'Product',
            render: (value, row) => {
                const product = value?.[0]?.productId;
                return product ? (
                    <div className="flex items-center space-x-3">
                        {product.productImages?.[0] && (
                            <img
                                src={product.productImages[0]}
                                alt={product.title}
                                className="w-12 h-12 rounded-lg object-cover"
                            />
                        )}
                        <div>
                            <div className="font-medium" style={{ color: theme.colors.textPrimary }}>
                                {product.title}
                            </div>
                            <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                Qty: {value[0]?.quantity || 1}
                            </div>
                        </div>
                    </div>
                ) : (
                    <span style={{ color: theme.colors.textSecondary }}>Product not available</span>
                );
            }
        },
        {
            key: 'amount',
            label: 'Amount',
            render: (value) => (
                <div className="font-medium" style={{ color: theme.colors.textPrimary }}>
                    {formatCurrency(value)}
                </div>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (value) => getStatusBadge(value)
        },
        {
            key: 'paymentStatus',
            label: 'Payment',
            render: (value) => getStatusBadge(value)
        },
        {
            key: 'createdAt',
            label: 'Date',
            render: (value) => (
                <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
                    {formatDate(value)}
                </div>
            )
        }
    ];

    // Table columns for reviews
    const reviewColumns = [
        {
            key: 'product',
            label: 'Product',
            render: (value, row) => (
                value ? (
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            {value.images?.[0] && (
                                <img
                                    src={value.images[0]}
                                    alt={value.title}
                                    className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200 shadow-sm"
                                />
                            )}
                            <span 
                                className={`absolute -top-1 -right-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    value.saleType === 'auction' 
                                        ? 'bg-purple-100 text-purple-800' 
                                        : 'bg-blue-100 text-blue-800'
                                }`}
                            >
                                {value.saleType === 'auction' ? '🔨' : '💰'}
                            </span>
                        </div>
                        <div className="flex-1">
                            <div className="font-medium text-gray-800 mb-1">{value.title}</div>
                            <div className="text-sm text-gray-500">
                                {value.price ? `$${value.price}` : 'Price not set'}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-gray-400 italic">Product not available</div>
                )
            )
        },
        {
            key: 'reviewContent',
            label: 'Review Content',
            render: (value, row) => (
                <div className="space-y-2">
                    <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <MdStar
                                key={star}
                                className={`w-4 h-4 ${
                                    star <= row.rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                            />
                        ))}
                        <span className="ml-2 text-sm font-medium text-gray-700">{row.rating}/5</span>
                    </div>
                    {row.reviewText && (
                        <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                            "{row.reviewText}"
                        </p>
                    )}
                    {row.reviewImages && row.reviewImages.length > 0 && (
                        <div className="flex space-x-1">
                            {row.reviewImages.slice(0, 3).map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt={`Review image ${index + 1}`}
                                    className="w-8 h-8 rounded object-cover border border-gray-200"
                                />
                            ))}
                            {row.reviewImages.length > 3 && (
                                <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-500 border border-gray-200">
                                    +{row.reviewImages.length - 3}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'raterRole',
            label: 'Reviewer Role',
            render: (value, row) => (
                <div className="space-y-2">
                    <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            value === 'buyer' 
                                ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                                : 'bg-green-100 text-green-800 border border-green-200'
                        }`}
                    >
                        {value === 'buyer' ? '👤 Buyer Review' : '🏪 Seller Review'}
                    </span>
                    {row.reviewer && (
                        <div className="flex items-center space-x-2">
                            {row.reviewer.image && (
                                <img
                                    src={row.reviewer.image}
                                    alt={row.reviewer.name}
                                    className="w-6 h-6 rounded-full object-cover"
                                />
                            )}
                            <span className="text-xs text-gray-600">{row.reviewer.name}</span>
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'createdAt',
            label: 'Review Date',
            render: (value) => (
                <div className="text-sm text-gray-600">
                    <div className="font-medium">{formatDate(value)}</div>
                    <div className="text-xs text-gray-400">
                        {new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (value, row) => (
                <div className="flex space-x-2">
                    <Button
                        onClick={() => window.open(`/productInfo/${row.product?._id}`, '_blank')}
                        className="text-xs transition-all duration-200 hover:scale-105"
                        style={{
                            backgroundColor: theme.colors.buttonSecondary,
                            color: theme.colors.buttonText
                        }}
                    >
                        <FaEye className="w-3 h-3 mr-1" />
                        View Product
                    </Button>
                </div>
            )
        }
    ];

      // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="bg-gray-200 rounded-lg h-4 w-3/4 mb-2"></div>
      <div className="bg-gray-200 rounded-lg h-4 w-1/2 mb-2"></div>
      <div className="bg-gray-200 rounded-lg h-4 w-2/3"></div>
    </div>
  );

  // Enhanced loading state
  if (loading) {
    return (
      <div 
        className="min-h-screen p-6 transition-all duration-300"
        style={{ backgroundColor: theme.colors.background }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div 
            className="bg-white rounded-lg shadow-sm p-6 mb-6 animate-pulse"
            style={{ backgroundColor: theme.colors.backgroundSecondary }}
          >
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="bg-gray-300 h-8 w-48 mb-4 rounded"></div>
                <div className="bg-gray-300 h-4 w-32 mb-2 rounded"></div>
                <div className="bg-gray-300 h-4 w-40 rounded"></div>
              </div>
            </div>
          </div>
          
          {/* Tabs Skeleton */}
          <div 
            className="bg-white rounded-lg shadow-sm animate-pulse"
            style={{ backgroundColor: theme.colors.backgroundSecondary }}
          >
            <div className="flex border-b p-4 space-x-8">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="bg-gray-300 h-4 w-20 rounded"></div>
              ))}
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="bg-gray-300 h-16 w-full rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

    if (!userInfo) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ backgroundColor: theme.colors.background }}
            >
                <div className="text-center">
                    <FaUser className="w-16 h-16 mx-auto mb-4" style={{ color: theme.colors.textSecondary }} />
                    <p className="text-xl" style={{ color: theme.colors.textPrimary }}>User not found</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen p-6"
            style={{ backgroundColor: theme.colors.background }}
        >
            <div className="max-w-7xl mx-auto">
                {/* User Header */}
                <div
                    className="bg-white rounded-lg shadow-sm p-6 mb-6"
                    style={{ backgroundColor: theme.colors.backgroundSecondary }}
                >
                    <div className="flex items-center space-x-6">
                        {/* Profile Image */}
                        <div className="flex-shrink-0">
                            {userInfo.profileImage ? (
                                <img
                                    src={userInfo.profileImage}
                                    alt={userInfo.userName}
                                    className="w-24 h-24 rounded-full object-cover border-4"
                                    style={{ borderColor: theme.colors.primary }}
                                />
                            ) : (
                                <div
                                    className="w-24 h-24 rounded-full flex items-center justify-center border-4"
                                    style={{
                                        backgroundColor: theme.colors.tertiary,
                                        borderColor: theme.colors.primary
                                    }}
                                >
                                    <FaUser className="w-12 h-12" style={{ color: theme.colors.textSecondary }} />
                                </div>
                            )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                                <h1 className="text-3xl font-bold" style={{ color: theme.colors.textPrimary }}>
                                    {userInfo.userName}
                                </h1>
                                {userInfo.is_Id_verified && (
                                    <MdVerified className="w-6 h-6 text-blue-500" title="Verified User" />
                                )}
                            </div>

                            {/* Seller Status */}
                            <div className="flex items-center space-x-4 mb-3">
                                {userInfo.is_Verified_Seller && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                        <FaStore className="w-4 h-4 mr-2" />
                                        Verified Seller
                                    </span>
                                )}
                                {userInfo.is_Preferred_seller && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                        <MdStar className="w-4 h-4 mr-2" />
                                        Preferred Seller
                                    </span>
                                )}
                            </div>

                            {/* Location */}
                            {(userInfo.province || userInfo.district) && (
                                <div className="flex items-center space-x-2 mb-3">
                                    <FaMapMarkerAlt className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                                    <span style={{ color: theme.colors.textSecondary }}>
                                        {[userInfo.district, userInfo.province].filter(Boolean).join(', ')}
                                    </span>
                                </div>
                            )}

                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold" >
                                        {userInfo.totalFollowers || 0}
                                    </div>
                                    <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                        Followers
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold" >
                                        {userInfo.totalFollowing || 0}
                                    </div>
                                    <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                        Following
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold" >
                                        {userInfo.totalProducts || 0}
                                    </div>
                                    <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                        Products
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold" >
                                        {userInfo.totalThreads || 0}
                                    </div>
                                    <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                        Threads
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold" >
                                        {userInfo.totalReviews || 0}
                                    </div>
                                    <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                        Reviews
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div
                    className="bg-white rounded-lg shadow-sm transition-all duration-300 ease-in-out"
                    style={{ backgroundColor: theme.colors.backgroundSecondary }}
                >
                    {/* Tab Headers */}
                    <div
                        className="flex border-b overflow-x-auto"
                        style={{ borderColor: theme.colors.borderLight }}
                    >
                        {[
                            { key: 'overview', label: 'Overview', icon: FaUser },
                            { key: 'products', label: 'Products', icon: FaStore },
                            { key: 'threads', label: 'Threads', icon: FaComments },
                            { key: 'transactions', label: 'Transactions', icon: FaShoppingCart },
                            // { key: 'reviews', label: 'Reviews', icon: MdStar }
                        ].map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => handleTabChange(tab.key)}
                                    className={`flex-shrink-0 flex items-center space-x-2 px-6 py-4 font-medium border-b-2 transition-all duration-300 ease-in-out hover:bg-gray-50
                                        ${activeTab === tab.key 
                                            ? 'border-blue-500 text-blue-600 bg-blue-50' 
                                            : 'border-transparent text-gray-600 hover:text-gray-800'}
                                    `}
                                >
                                    <Icon className={`w-4 h-4 transition-transform duration-200 ${activeTab === tab.key ? 'scale-110' : ''}`} />
                                    <span className="whitespace-nowrap">{tab.label}</span>
                                    {/* Show count badges */}
                                    {tab.key === 'products' && userInfo?.totalProducts > 0 && (
                                        <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                                            {userInfo.totalProducts}
                                        </span>
                                    )}
                                    {tab.key === 'threads' && userInfo?.totalThreads > 0 && (
                                        <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded-full">
                                            {userInfo.totalThreads}
                                        </span>
                                    )}
                                    {tab.key === 'reviews' && userInfo?.totalReviews > 0 && (
                                        <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-600 rounded-full">
                                            {userInfo.totalReviews}
                                        </span>
                                    )}
                                </button>
                            );

                        })}
                    </div>

                    {/* Tab Content */}
                    <div className="p-6 min-h-96 transition-all duration-300 ease-in-out">
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* User Details Card */}
                                <div
                                    className="p-4 rounded-lg border"
                                    style={{
                                        backgroundColor: theme.colors.background,
                                        borderColor: theme.colors.borderLight
                                    }}
                                >
                                    <h3 className="text-lg font-semibold mb-3" style={{ color: theme.colors.textPrimary }}>
                                        User Details
                                    </h3>
                                    <div className="space-y-2">
                                        {userInfo.gender && (
                                            <div className="flex justify-between">
                                                <span style={{ color: theme.colors.textSecondary }}>Gender:</span>
                                                <span style={{ color: theme.colors.textPrimary }}>{userInfo.gender}</span>
                                            </div>
                                        )}
                                        {userInfo.dob && (
                                            <div className="flex justify-between">
                                                <span style={{ color: theme.colors.textSecondary }}>Birth Date:</span>
                                                <span style={{ color: theme.colors.textPrimary }}>
                                                    {new Date(userInfo.dob).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span style={{ color: theme.colors.textSecondary }}>Seller verified:</span>
                                            <span style={{ color: userInfo.is_Verified_Seller ? theme.colors.success : theme.colors.textSecondary }}>
                                                {userInfo.is_Verified_Seller ? 'Yes' : 'No'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span style={{ color: theme.colors.textSecondary }}>Prefeered Seller:</span>
                                            <span style={{ color: userInfo.is_Preferred_seller ? theme.colors.success : theme.colors.textSecondary }}>
                                                {userInfo.is_Preferred_seller ? 'Yes' : 'No'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Activity Summary Card */}
                                <div
                                    className="p-4 rounded-lg border"
                                    style={{
                                        backgroundColor: theme.colors.background,
                                        borderColor: theme.colors.borderLight
                                    }}
                                >
                                    <h3 className="text-lg font-semibold mb-3" style={{ color: theme.colors.textPrimary }}>
                                        Activity Summary
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <FaStore className="w-4 h-4" />
                                                <span style={{ color: theme.colors.textSecondary }}>Products Listed</span>
                                            </div>
                                            <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                                                {userInfo.totalProducts || 0}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <FaComments className="w-4 h-4" />
                                                <span style={{ color: theme.colors.textSecondary }}>Threads Created</span>
                                            </div>
                                            <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                                                {userInfo.totalThreads || 0}
                                            </span>
                                        </div>
                                                                        <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <MdStar className="w-4 h-4" />
                                        <span style={{ color: theme.colors.textSecondary }}>Reviews Given</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                                            {userInfo.totalReviews || 0}
                                        </span>
                                        {userInfo.averageRating && (
                                            <div className="text-xs text-gray-500">
                                                Avg: {userInfo.averageRating.toFixed(1)} ⭐
                                            </div>
                                        )}
                                    </div>
                                </div>
                                    </div>
                                </div>

                                {/* Social Stats Card */}
                                <div
                                    className="p-4 rounded-lg border"
                                    style={{
                                        backgroundColor: theme.colors.background,
                                        borderColor: theme.colors.borderLight
                                    }}
                                >
                                    <h3 className="text-lg font-semibold mb-3" style={{ color: theme.colors.textPrimary }}>
                                        Social Stats
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <FaHeart className="w-4 h-4" />
                                                <span style={{ color: theme.colors.textSecondary }}>Followers</span>
                                            </div>
                                            <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                                                {userInfo.totalFollowers || 0}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <FaUser className="w-4 h-4" />
                                                <span style={{ color: theme.colors.textSecondary }}>Following</span>
                                            </div>
                                            <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                                                {userInfo.totalFollowing || 0}
                                            </span>
                                        </div>
                                        {userInfo.isFollow !== undefined && (
                                            <div className="pt-2 border-t" style={{ borderColor: theme.colors.borderLight }}>
                                                <span
                                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${userInfo.isFollow ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                >
                                                    {userInfo.isFollow ? 'Following' : 'Not Following'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                                    {activeTab === 'products' && (
              <div className="transition-all duration-300 ease-in-out">
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold" style={{ color: theme.colors.textPrimary }}>
                      Products ({totals.products})
                    </h3>
                    <div className="flex items-center space-x-2 text-sm" style={{ color: theme.colors.textSecondary }}>
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                        🔨 Auctions
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        💰 Fixed Price
                      </span>
                    </div>
                  </div>
                </div>
                
                {tabLoading ? (
                  <div className="space-y-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm" style={{ backgroundColor: theme.colors.background }}>
                          <div className="w-16 h-16 bg-gray-300 rounded-lg"></div>
                          <div className="flex-1">
                            <div className="bg-gray-300 h-4 w-3/4 mb-2 rounded"></div>
                            <div className="bg-gray-300 h-3 w-1/2 rounded"></div>
                          </div>
                          <div className="bg-gray-300 h-6 w-20 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12 transition-all duration-300">
                    <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                      <FaStore className="w-10 h-10" style={{ color: theme.colors.textSecondary }} />
                    </div>
                    <h4 className="text-lg font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                      No products found
                    </h4>
                    <p style={{ color: theme.colors.textSecondary }}>
                      This user hasn't listed any products yet.
                    </p>
                  </div>
                ) : (
                  <div className="transition-all duration-300 ease-in-out">
                    <div className="overflow-hidden rounded-lg shadow-sm border" style={{ borderColor: theme.colors.borderLight }}>
                      <DataTable columns={productColumns} data={products} />
                    </div>
                    {totals.products > 0 && (
                      <div className="mt-6 flex justify-end">
                        <Pagination
                          pageNo={productsPagination.pageNo}
                          size={productsPagination.size}
                          total={totals.products}
                          onChange={handleProductsPageChange}
                          theme={theme}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

                                    {activeTab === 'threads' && (
              <div className="transition-all duration-300 ease-in-out">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold" style={{ color: theme.colors.textPrimary }}>
                    Discussion Threads ({totals.threads})
                  </h3>
                  <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>
                    Community discussions started by this user
                  </p>
                </div>
                
                {tabLoading ? (
                  <div className="space-y-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="p-4 bg-white rounded-lg shadow-sm" style={{ backgroundColor: theme.colors.background }}>
                          <div className="bg-gray-300 h-5 w-3/4 mb-3 rounded"></div>
                          <div className="bg-gray-300 h-3 w-1/2 mb-2 rounded"></div>
                          <div className="bg-gray-300 h-3 w-1/4 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : threads.length === 0 ? (
                  <div className="text-center py-12 transition-all duration-300">
                    <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                      <FaComments className="w-10 h-10" style={{ color: theme.colors.textSecondary }} />
                    </div>
                    <h4 className="text-lg font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                      No threads found
                    </h4>
                    <p style={{ color: theme.colors.textSecondary }}>
                      This user hasn't started any discussions yet.
                    </p>
                  </div>
                ) : (
                  <div className="transition-all duration-300 ease-in-out">
                    <div className="overflow-hidden rounded-lg shadow-sm border" style={{ borderColor: theme.colors.borderLight }}>
                      <DataTable columns={threadColumns} data={threads} />
                    </div>
                    {totals.threads > 0 && (
                      <div className="mt-6 flex justify-end">
                        <Pagination
                          pageNo={threadsPagination.pageNo}
                          size={threadsPagination.size}
                          total={totals.threads}
                          onChange={handleThreadsPageChange}
                          theme={theme}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

                        {activeTab === 'transactions' && (
                            <div>
                                {/* <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-semibold" style={{ color: theme.colors.textPrimary }}>
                                        Transactions ({totals.transactions})
                                    </h3>
                                    <Button
                                        onClick={() => setShowFilters(!showFilters)}
                                        style={{
                                            backgroundColor: theme.colors.buttonSecondary,
                                            color: theme.colors.buttonText
                                        }}
                                    >
                                        <FaFilter className="w-4 h-4 mr-2" />
                                        Filters
                                    </Button>
                                </div> */}

                                {/* Transaction Filters */}
                                {showFilters && (
                                    <div
                                        className="p-4 rounded-lg border mb-4"
                                        style={{
                                            backgroundColor: theme.colors.background,
                                            borderColor: theme.colors.borderLight
                                        }}
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textPrimary }}>
                                                    Status
                                                </label>
                                                <select
                                                    name="status"
                                                    value={transactionFilters.status}
                                                    onChange={handleFilterChange}
                                                    className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    style={{
                                                        borderColor: theme.colors.borderLight,
                                                        backgroundColor: theme.colors.background,
                                                        color: theme.colors.textPrimary
                                                    }}
                                                >
                                                    <option value="">All Statuses</option>
                                                    <option value="Pending">Pending</option>
                                                    <option value="Completed">Completed</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                    <option value="Shipped">Shipped</option>
                                                    <option value="Delivered">Delivered</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textPrimary }}>
                                                    Payment Status
                                                </label>
                                                <select
                                                    name="paymentStatus"
                                                    value={transactionFilters.paymentStatus}
                                                    onChange={handleFilterChange}
                                                    className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    style={{
                                                        borderColor: theme.colors.borderLight,
                                                        backgroundColor: theme.colors.background,
                                                        color: theme.colors.textPrimary
                                                    }}
                                                >
                                                    <option value="">All Payments</option>
                                                    <option value="Pending">Pending</option>
                                                    <option value="Completed">Completed</option>
                                                    <option value="Failed">Failed</option>
                                                </select>
                                            </div>
                                            <InputField
                                                label="From Date"
                                                type="date"
                                                name="dateFrom"
                                                value={transactionFilters.dateFrom}
                                                onChange={handleFilterChange}
                                            />
                                            <InputField
                                                label="To Date"
                                                type="date"
                                                name="dateTo"
                                                value={transactionFilters.dateTo}
                                                onChange={handleFilterChange}
                                            />
                                            <InputField
                                                label="Min Amount"
                                                type="number"
                                                name="minAmount"
                                                value={transactionFilters.minAmount}
                                                onChange={handleFilterChange}
                                                placeholder="0"
                                            />
                                            <InputField
                                                label="Max Amount"
                                                type="number"
                                                name="maxAmount"
                                                value={transactionFilters.maxAmount}
                                                onChange={handleFilterChange}
                                                placeholder="1000000"
                                            />
                                        </div>
                                        <div className="flex space-x-2 mt-4">
                                            <Button
                                                onClick={applyFilters}
                                                style={{
                                                    backgroundColor: theme.colors.buttonPrimary,
                                                    color: theme.colors.buttonText
                                                }}
                                            >
                                                Apply Filters
                                            </Button>
                                            <Button
                                                onClick={clearFilters}
                                                style={{
                                                    backgroundColor: theme.colors.buttonSecondary,
                                                    color: theme.colors.buttonText
                                                }}
                                            >
                                                Clear Filters
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                                {tabLoading ? (
                  <div className="space-y-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm" style={{ backgroundColor: theme.colors.background }}>
                          <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                          <div className="flex-1">
                            <div className="bg-gray-300 h-4 w-2/3 mb-2 rounded"></div>
                            <div className="bg-gray-300 h-3 w-1/3 rounded"></div>
                          </div>
                          <div className="bg-gray-300 h-6 w-16 rounded"></div>
                          <div className="bg-gray-300 h-6 w-20 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-12 transition-all duration-300">
                    <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                      <FaShoppingCart className="w-10 h-10" style={{ color: theme.colors.textSecondary }} />
                    </div>
                    <h4 className="text-lg font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                      No transactions found
                    </h4>
                    <p style={{ color: theme.colors.textSecondary }}>
                      This user hasn't made any purchases yet.
                    </p>
                  </div>
                ) : (
                  <div className="transition-all duration-300 ease-in-out">
                    <div className="overflow-hidden rounded-lg shadow-sm border" style={{ borderColor: theme.colors.borderLight }}>
                      <DataTable columns={transactionColumns} data={transactions} />
                    </div>
                    {totals.transactions > 0 && (
                      <div className="mt-6 flex justify-end">
                        <Pagination
                          pageNo={transactionsPagination.pageNo}
                          size={transactionsPagination.size}
                          total={totals.transactions}
                          onChange={handleTransactionsPageChange}
                          theme={theme}
                        />
                      </div>
                    )}
                  </div>
                )}
                            </div>
                        )}

                                    {activeTab === 'reviews' && (
              <div className="transition-all duration-300 ease-in-out">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold" style={{ color: theme.colors.textPrimary }}>
                        Product Reviews ({totals.reviews})
                      </h3>
                      <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>
                        Reviews written by this user for purchased products
                      </p>
                    </div>
                    {reviews.length > 0 && (
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">Average Rating:</span>
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <MdStar
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) 
                                    ? 'text-yellow-400' 
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="ml-1 font-medium text-gray-700">
                              {(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">With Images:</span>
                          <span className="font-medium text-blue-600">
                            {reviews.filter(review => review.reviewImages && review.reviewImages.length > 0).length}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">Rating Distribution:</span>
                          <div className="flex items-center space-x-1">
                            {[5, 4, 3, 2, 1].map((rating) => {
                              const count = reviews.filter(review => review.rating === rating).length;
                              const percentage = reviews.length > 0 ? (count / reviews.length * 100).toFixed(0) : 0;
                              return (
                                <div key={rating} className="flex items-center space-x-1">
                                  <span className="text-xs text-gray-600">{rating}⭐</span>
                                  <div className="w-8 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs text-gray-500 w-6">{count}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {tabLoading ? (
                  <div className="space-y-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm" style={{ backgroundColor: theme.colors.background }}>
                          <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                          <div className="flex-1">
                            <div className="bg-gray-300 h-4 w-3/4 mb-2 rounded"></div>
                            <div className="bg-gray-300 h-3 w-1/2 mb-2 rounded"></div>
                            <div className="bg-gray-300 h-3 w-2/3 rounded"></div>
                          </div>
                          <div className="bg-gray-300 h-6 w-16 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-12 transition-all duration-300">
                    <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                      <MdStar className="w-10 h-10" style={{ color: theme.colors.textSecondary }} />
                    </div>
                    <h4 className="text-lg font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                      No reviews found
                    </h4>
                    <p style={{ color: theme.colors.textSecondary }}>
                      This user hasn't written any product reviews yet.
                    </p>
                  </div>
                ) : (
                  <div className="transition-all duration-300 ease-in-out">
                    <div className="overflow-hidden rounded-lg shadow-sm border" style={{ borderColor: theme.colors.borderLight }}>
                      <DataTable columns={reviewColumns} data={reviews} />
                    </div>
                    {totals.reviews > 0 && (
                      <div className="mt-6 flex justify-end">
                        <Pagination
                          pageNo={reviewsPagination.pageNo}
                          size={reviewsPagination.size}
                          total={totals.reviews}
                          onChange={handleReviewsPageChange}
                          theme={theme}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
                    </div>
                </div>
            </div>
        </div>
    );
}
