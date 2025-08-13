import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import authAxiosClient from '../../api/authAxiosClient';
import Button from '../../Component/Atoms/Button/Button';
import InputField from '../../Component/Atoms/InputFields/Inputfield';
import Loader from '../../Component/Common/Loader';
import { useTheme } from '../../contexts/theme/hook/useTheme';
import { FaChartLine } from "react-icons/fa";
import {
  FaMoneyBillWave, FaExchangeAlt, FaExclamationTriangle,
  FaCalendarAlt, FaFilter, FaDownload, FaEye, FaSearch, FaCreditCard,
  FaUsers, FaShoppingCart, FaPiggyBank
} from 'react-icons/fa';
import { MdTrendingUp, MdTrendingDown, MdInfo } from 'react-icons/md';




export default function AdminFinancialDashboard() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Product search state
  const [productSearch, setProductSearch] = useState('');
  const [productResults, setProductResults] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productFinancialData, setProductFinancialData] = useState(null);

  // Money flow analysis state
  const [moneyFlowData, setMoneyFlowData] = useState(null);

  // Money flow detail modal state
  const [detailModal, setDetailModal] = useState({ show: false, data: null });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);

      const response = await authAxiosClient.get(`/order/admin/financial-dashboard?${queryParams}`);
      if (response.data?.status) {
        setDashboardData(response.data.data);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error(error.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setProductResults([]);
      return;
    }

    try {
      const response = await authAxiosClient.get(`/sellProduct/search?q=${encodeURIComponent(searchTerm)}&limit=10`);
      if (response.data?.status) {
        setProductResults(response.data.data || []);
      }
    } catch (error) {
      console.error('Product search error:', error);
    }
  };  

  const fetchProductFinancials = async (productId) => {
    try {
      setLoading(true);
      const response = await authAxiosClient.get(`/order/admin/product-financial/${productId}?includeHistory=true`);
      if (response.data?.status) {
        setProductFinancialData(response.data.data);
      } else {
        throw new Error('Failed to fetch product financial data');
      }
    } catch (error) {
      console.error('Product financial fetch error:', error);
      toast.error('Failed to fetch product financial data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMoneyFlowData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);

      const response = await authAxiosClient.get(`/order/admin/money-flow?${queryParams}`);
      if (response.data?.status) {
        setMoneyFlowData(response.data.data);
      }
    } catch (error) {
      console.error('Money flow fetch error:', error);
      toast.error('Failed to fetch money flow data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'money-flow') {
      fetchMoneyFlowData();
    }
  }, [activeTab]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    fetchDashboardData();
    if (activeTab === 'money-flow') {
      fetchMoneyFlowData();
    }
  };

  const clearFilters = () => {
    setFilters({ dateFrom: '', dateTo: '' });
  };

  const formatCurrency = (amount) => `฿${(amount || 0).toFixed(2)}`;

  const formatNumber = (num) => (num || 0).toLocaleString();

  const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = "blue" }) => {
    const colorClasses = {
      blue: "bg-blue-50 border-blue-200 text-blue-800",
      green: "bg-green-50 border-green-200 text-green-800",
      red: "bg-red-50 border-red-200 text-red-800",
      yellow: "bg-yellow-50 border-yellow-200 text-yellow-800",
      purple: "bg-purple-50 border-purple-200 text-purple-800"
    };

    return (
      <div className={`p-4 lg:p-6 rounded-lg border ${colorClasses[color]}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs sm:text-sm font-medium opacity-75">{title}</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-1 break-words">{value}</p>
            {subtitle && <p className="text-xs sm:text-sm opacity-60 mt-1">{subtitle}</p>}
          </div>
          <div className="flex flex-col items-end ml-2">
            {/* <Icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 opacity-60" /> */}
            {trend && (
              <div className={`flex items-center mt-2 text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? <MdTrendingUp className="w-3 h-3 mr-1" /> : <MdTrendingDown className="w-3 h-3 mr-1" />}
                <span className="text-xs">{trend.value}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const TabButton = ({ tabKey, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(tabKey)}
      className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 font-medium text-xs sm:text-sm rounded-lg transition-all ${isActive
        ? 'bg-blue-500 text-white shadow-md'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
    >
      {label}
    </button>
  );

  if (loading && !dashboardData) {
    return <Loader />;
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Financial Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Complete financial analytics and money flow tracking</p>
        </div>
        {/* <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center space-x-2 w-full sm:w-auto"
          >
            <FaFilter className="w-4 h-4" />
            <span>Filters</span>
          </Button>

        </div> */}
      </div>

      {/* Filters */}
      {true && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-lg font-semibold mb-4">Date Range Filter</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* From Date */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
                className="w-full p-2 rounded-lg border border-gray-300    "
              />
            </div>

            {/* To Date */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
                className="w-full p-2 rounded-lg border border-gray-300    "
              />
            </div>

            {/* Buttons */}
            <div className="flex space-x-2  ">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1  opacity-0">To Date</label>

                <button
                  variant="primary"
                  onClick={applyFilters}
                  className="w-full p-2 rounded-lg border border-gray-300  bg-[#3B82F6] text-white  "
                >
                  Apply
                </button>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1  opacity-0">To Date</label>

                <button
                  variant="primary"
                  onClick={clearFilters}
                  className="w-full p-2 rounded-lg border bg-[#3B82F6] border-gray-300 text-white    "
                >
                  Clear
                </button>
              </div>

            </div>
          </div>
        </div>


      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 bg-gray-50 p-2 rounded-lg">
        <TabButton tabKey="overview" label="Overview" isActive={activeTab === 'overview'} onClick={setActiveTab} />
        <TabButton tabKey="product-analysis" label="Product Analysis" isActive={activeTab === 'product-analysis'} onClick={setActiveTab} />
        {/* <TabButton tabKey="money-flow" label="Money Flow" isActive={activeTab === 'money-flow'} onClick={setActiveTab} /> */}
        <TabButton tabKey="disputes" label="Disputes" isActive={activeTab === 'disputes'} onClick={setActiveTab} />
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && dashboardData && (
        <div className="space-y-4 sm:">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              title="Total GMV"
              value={formatCurrency(dashboardData.overview.orders.totalGMV)}
              subtitle={`${formatNumber(dashboardData.overview.orders.totalOrders)} orders`}
              icon={FaShoppingCart}
              color="blue"
            />
            <StatCard
              title="Platform Revenue"
              value={formatCurrency(dashboardData.platformRevenue?.reduce((sum, rev) => sum + rev.totalAmount, 0) || 0)}
              subtitle="All revenue streams"
              icon={FaPiggyBank}
              color="green"
            />
            {/* <StatCard
              title="Seller Payouts"
              value={formatCurrency(dashboardData.overview.sellerPayouts.totalSellerPayouts)}
              subtitle={`${formatNumber(dashboardData.overview.sellerPayouts.payoutCount)} payouts`}
              icon={FaMoneyBillWave}
              color="purple"
            /> */}
            <StatCard
              title="Disputes"
              value={formatNumber(dashboardData.overview.disputes?.reduce((sum, d) => sum + d.count, 0) || 0)}
              subtitle="Total disputes"
              icon={FaExclamationTriangle}
              color="red"
            />
          </div>

          {/* Revenue Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">Platform Revenue Breakdown</h3>
              <div className="space-y-3">
                {dashboardData.platformRevenue?.map((rev, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 rounded space-y-1 sm:space-y-0">
                    <span className="font-medium text-sm sm:text-base">{rev._id.replace(/_/g, ' ')}</span>
                    <div className="text-left sm:text-right">
                      <span className="font-bold text-green-600 text-sm sm:text-base">{formatCurrency(rev.totalAmount)}</span>
                      <span className="text-xs text-gray-500 block">{formatNumber(rev.count)} transactions</span>
                    </div>
                  </div>
                )) || []}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
              <div className="space-y-3">
                {dashboardData.paymentMethodBreakdown?.map((method, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 rounded space-y-1 sm:space-y-0">
                    <span className="font-medium flex items-center text-sm sm:text-base">
                      <FaCreditCard className="w-4 h-4 mr-2" />
                      {method._id.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <div className="text-left sm:text-right">
                      <span className="font-bold text-sm sm:text-base">{formatCurrency(method.totalAmount)}</span>
                      <span className="text-xs text-gray-500 block">{formatNumber(method.count)} orders</span>
                    </div>
                  </div>
                )) || []}
              </div>
            </div>
          </div>

          {/* Daily Trends Chart */}
          <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4">30-Day Transaction Trends</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 sm:p-3 text-xs sm:text-sm">Date</th>
                    <th className="text-right p-2 sm:p-3 text-xs sm:text-sm">Orders</th>
                    <th className="text-right p-2 sm:p-3 text-xs sm:text-sm">GMV</th>
                    <th className="text-right p-2 sm:p-3 text-xs sm:text-sm">Buyers</th>
                    <th className="text-right p-2 sm:p-3 text-xs sm:text-sm">Sellers</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.dailyTrends?.slice(-7).map((day, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2 sm:p-3 text-xs sm:text-sm">{new Date(day.date).toLocaleDateString()}</td>
                      <td className="p-2 sm:p-3 text-right text-xs sm:text-sm">{formatNumber(day.orderCount)}</td>
                      <td className="p-2 sm:p-3 text-right text-xs sm:text-sm">{formatCurrency(day.totalGMV)}</td>
                      <td className="p-2 sm:p-3 text-right text-xs sm:text-sm">{formatNumber(day.uniqueBuyerCount)}</td>
                      <td className="p-2 sm:p-3 text-right text-xs sm:text-sm">{formatNumber(day.uniqueSellerCount)}</td>
                    </tr>
                  )) || []}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Product Analysis Tab */}
      {activeTab === 'product-analysis' && (
        <div className="space-y-4 sm:">
          <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4">Product Financial Analysis</h3>

            {/* Product Search */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Search Product</label>
              <div className="relative">
                <InputField
                  type="text"
                  placeholder="Search by product name or ID..."
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    searchProducts(e.target.value);
                  }}
                  className="pr-10"
                />
                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              {/* Search Results */}
              {productResults.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                  {productResults.map((product) => (
                    <button
                      key={product._id}
                      onClick={() => {
                        setSelectedProduct(product);
                        setProductSearch(product.title);
                        setProductResults([]);
                        fetchProductFinancials(product._id);
                      }}
                      className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0 flex items-center space-x-3"
                    >
                      {product.productImages?.[0] && (
                        <img
                          src={product.productImages[0]}
                          alt={product.title}
                          className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate">{product.title}</p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {formatCurrency(product.fixedPrice)} • {product.saleType}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Financial Data */}
            {productFinancialData && (
              <div className="space-y-4 sm:">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-4 bg-gray-50 rounded-lg">
                  {productFinancialData.product.productImages?.[0] && (
                    <img
                      src={productFinancialData.product.productImages[0]}
                      alt={productFinancialData.product.title}
                      className="w-16 h-16 object-cover rounded flex-shrink-0 mx-auto sm:mx-0"
                    />
                  )}
                  <div className="text-center sm:text-left">
                    <h4 className="font-bold text-lg">{productFinancialData.product.title}</h4>
                    <p className="text-gray-600">By {productFinancialData.product.userId?.userName}</p>
                    <p className="text-sm text-gray-500">
                      Status: {productFinancialData.product.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="Total Sales"
                    value={formatNumber(productFinancialData.financialSummary.totalSales)}
                    subtitle={formatCurrency(productFinancialData.financialSummary.totalRevenue)}
                    icon={FaShoppingCart}
                    color="blue"
                  />
                  <StatCard
                    title="Platform Revenue"
                    value={formatCurrency(productFinancialData.platformRevenue.total)}
                    subtitle="All fees collected"
                    icon={FaPiggyBank}
                    color="green"
                  />
                  <StatCard
                    title="Seller Earned"
                    value={formatCurrency(productFinancialData.sellerPayouts.totalPaidToSeller)}
                    subtitle={`${productFinancialData.sellerPayouts.payoutCount} payouts`}
                    icon={FaMoneyBillWave}
                    color="purple"
                  />
                  <StatCard
                    title="Disputes"
                    value={formatNumber(productFinancialData.disputes?.total || 0)}
                    subtitle={`${formatCurrency(productFinancialData.disputes?.totalFinancialImpact || 0)} impact`}
                    icon={FaExclamationTriangle}
                    color={productFinancialData.disputes?.total > 0 ? "red" : "yellow"}
                  />
                </div>

                {/* Transaction History */}
                {productFinancialData.transactionHistory && (
                  <div className="bg-white border rounded-lg">
                    <div className="p-4 border-b">
                      <h4 className="font-semibold">Transaction History</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="text-left p-2 sm:p-3 text-xs sm:text-sm">Order</th>
                            <th className="text-left p-2 sm:p-3 text-xs sm:text-sm">Buyer</th>
                            <th className="text-right p-2 sm:p-3 text-xs sm:text-sm">Amount</th>
                            <th className="text-right p-2 sm:p-3 text-xs sm:text-sm">Seller Payout</th>
                            <th className="text-right p-2 sm:p-3 text-xs sm:text-sm">Dispute Impact</th>
                            <th className="text-center p-2 sm:p-3 text-xs sm:text-sm">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productFinancialData.transactionHistory.map((transaction, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                              <td className="p-2 sm:p-3">
                                <div>
                                  <span className="font-medium text-xs sm:text-sm">{transaction.orderNumber}</span>
                                  <span className="text-xs text-gray-500 block">
                                    {new Date(transaction.orderDate).toLocaleDateString()}
                                  </span>
                                </div>
                              </td>
                              <td className="p-2 sm:p-3 text-xs sm:text-sm">{transaction.buyer?.userName}</td>
                              <td className="p-2 sm:p-3 text-right text-xs sm:text-sm">{formatCurrency(transaction.amounts.totalOrderValue)}</td>
                              <td className="p-2 sm:p-3 text-right">
                                {transaction.sellerPayout ? (
                                  <div>
                                    <span className="font-medium text-xs sm:text-sm">{formatCurrency(transaction.sellerPayout.netAmount)}</span>
                                    {transaction.dispute && transaction.dispute.financialImpact > 0 && (
                                      <span className="text-xs text-red-600 block">
                                        (Dispute adjusted)
                                      </span>
                                    )}
                                  </div>
                                ) : <span className="text-xs sm:text-sm">Pending</span>}
                              </td>
                              <td className="p-2 sm:p-3 text-right">
                                {transaction.dispute && transaction.dispute.financialImpact > 0 ? (
                                  <div>
                                    <span className="font-medium text-red-600 text-xs sm:text-sm">
                                      {formatCurrency(transaction.dispute.financialImpact)}
                                    </span>
                                    <span className="text-xs text-gray-500 block">
                                      {transaction.dispute.status}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="p-2 sm:p-3 text-center">
                                <div className="flex flex-col items-center space-y-1">
                                  <span className={`text-xs px-2 py-1 rounded-full ${transaction.orderStatus === 'completed' ? 'bg-green-100 text-green-800' :
                                    transaction.orderStatus === 'delivered' ? 'bg-blue-100 text-blue-800' :
                                      transaction.orderStatus === 'dispute' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {transaction.orderStatus.toUpperCase()}
                                  </span>
                                  {transaction.dispute && (
                                    <span className={`text-xs px-2 py-1 rounded-full ${transaction.dispute.status === 'RESOLVED'
                                      ? 'bg-orange-100 text-orange-800'
                                      : 'bg-red-100 text-red-800'
                                      }`}>
                                      {transaction.dispute.status}
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Money Flow Tab */}
      {activeTab === 'money-flow' && (
        <div className="space-y-4 sm:">
          <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4">Complete Money Flow Analysis</h3>

            {moneyFlowData && (
              <div className="space-y-4 sm:">
                {/* Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="Total Orders"
                    value={formatNumber(moneyFlowData.summary.totalOrders)}
                    subtitle="Analyzed transactions"
                    icon={FaShoppingCart}
                    color="blue"
                  />
                  <StatCard
                    title="Gross GMV"
                    value={formatCurrency(moneyFlowData.summary.totalGMV)}
                    subtitle="Total buyer payments"
                    icon={FaMoneyBillWave}
                    color="green"
                  />
                  <StatCard
                    title="Platform Revenue"
                    value={formatCurrency(moneyFlowData.summary.totalPlatformRevenue)}
                    subtitle="Total fees collected"
                    icon={FaPiggyBank}
                    color="purple"
                  />
                  {/* <StatCard
                    title="Seller Payouts"
                    value={formatCurrency(moneyFlowData.summary.totalSellerPayouts)}
                    subtitle="Net to sellers"
                    icon={FaExchangeAlt}
                    color="yellow"
                  /> */}
                </div>

                {/* Detailed Flow - Mobile Card View */}
                <div className="lg:hidden">
                  <div className="bg-white border rounded-lg">
                    <div className="p-4 border-b">
                      <h4 className="font-semibold">Detailed Money Flow by Order</h4>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      <div className="space-y-3 p-4">
                        {moneyFlowData.orders?.map((order, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-3">
                            {/* Order Header */}
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-medium text-sm">{order.orderId}</span>
                                <span className="text-xs text-gray-500 block">
                                  {new Date(order.orderDate).toLocaleDateString()}
                                </span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDetailModal({ show: true, data: order })}
                                title="View detailed money flow"
                                className="p-2"
                              >
                                <FaEye className="w-3 h-3" />
                              </Button>
                            </div>

                            {/* Participants */}
                            <div className="bg-white rounded p-2">
                              <p className="text-xs font-medium text-gray-600 mb-1">Participants</p>
                              <div className="text-xs space-y-1">
                                <div className="flex items-center">
                                  <span className="mr-2">👤</span>
                                  <span className="truncate">{order.buyer.name}</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="mr-2">🏪</span>
                                  <span className="truncate">{order.seller.name}</span>
                                </div>
                              </div>
                            </div>

                            {/* Financial Details */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-blue-50 rounded p-2">
                                <p className="text-xs font-medium text-blue-700">Buyer Paid</p>
                                <p className="text-sm font-bold text-blue-600">
                                  {formatCurrency(order.moneyFlow.buyerPayment.grandTotal)}
                                </p>
                              </div>
                              <div className="bg-green-50 rounded p-2">
                                <p className="text-xs font-medium text-green-700">Platform Revenue</p>
                                <p className="text-sm font-bold text-green-600">
                                  {formatCurrency(order.moneyFlow.platformRevenue.totalPlatformRevenue)}
                                </p>
                              </div>
                              <div className="bg-purple-50 rounded p-2 col-span-2">
                                <p className="text-xs font-medium text-purple-700">Seller Received</p>
                                <p className="text-sm font-bold text-purple-600">
                                  {formatCurrency(
                                    order.moneyFlow.sellerPayouts
                                      .filter(txn => txn.tnxType === 'credit')
                                      .reduce((sum, txn) => sum + (txn.netAmount || 0), 0)
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Flow - Desktop Table View */}
                <div className="hidden lg:block bg-white border rounded-lg">
                  <div className="p-4 border-b">
                    <h4 className="font-semibold">Detailed Money Flow by Order</h4>
                  </div>
                  <div className="overflow-x-auto max-h-96">
                    <table className="min-w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="text-left p-3 text-sm">Order</th>
                          <th className="text-left p-3 text-sm">Participants</th>
                          <th className="text-right p-3 text-sm">Buyer Paid</th>
                          <th className="text-right p-3 text-sm">Platform Revenue</th>
                          <th className="text-right p-3 text-sm">Seller Received</th>
                          <th className="text-center p-3 text-sm">Flow</th>
                        </tr>
                      </thead>
                      <tbody>
                        {moneyFlowData.orders?.map((order, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-3">
                              <div>
                                <span className="font-medium text-sm">{order.orderId}</span>
                                <span className="text-xs text-gray-500 block">
                                  {new Date(order.orderDate).toLocaleDateString()}
                                </span>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="text-xs">
                                <div>👤 {order.buyer.name}</div>
                                <div>🏪 {order.seller.name}</div>
                              </div>
                            </td>
                            <td className="p-3 text-right">
                              <span className="font-medium text-blue-600 text-sm">
                                {formatCurrency(order.moneyFlow.buyerPayment.grandTotal)}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <span className="font-medium text-green-600 text-sm">
                                {formatCurrency(order.moneyFlow.platformRevenue.totalPlatformRevenue)}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <span className="font-medium text-purple-600 text-sm">
                                {formatCurrency(
                                  order.moneyFlow.sellerPayouts
                                    .filter(txn => txn.tnxType === 'credit')
                                    .reduce((sum, txn) => sum + (txn.netAmount || 0), 0)
                                )}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDetailModal({ show: true, data: order })}
                                title="View detailed money flow"
                              >
                                <FaEye className="w-3 h-3" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Disputes Tab */}
      {activeTab === 'disputes' && dashboardData && (
        <div className="space-y-4 sm:">
          <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4">Dispute Financial Impact Analysis</h3>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {dashboardData.overview.disputes?.map((dispute, index) => (
                <StatCard
                  key={index}
                  title={`${dispute._id === 'BUYER' ? 'Buyer Favor' : dispute._id === 'SELLER' ? 'Seller Favor' : dispute._id} Disputes`}
                  value={formatNumber(dispute.count)}
                  subtitle={`${formatCurrency(dispute.totalOrderValue)} total value`}
                  icon={FaExclamationTriangle}
                  color={dispute._id === 'BUYER' ? 'red' : dispute._id === 'SELLER' ? 'green' : 'yellow'}
                />
              ))}

              {/* Total Impact Card */}
              <StatCard
                title="Total Financial Impact"
                value={formatCurrency(
                  dashboardData.overview.disputes?.reduce((sum, d) => {
                    if (d._id === 'BUYER') {
                      return sum + (d.totalOrderValue * (d.avgRefundPercent || 0) / 100);
                    }
                    return sum;
                  }, 0) || 0
                )}
                subtitle="Estimated refunds"
                icon={FaMoneyBillWave}
                color="purple"
              />
            </div>

            {/* Dispute Impact Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
              {/* Resolution Distribution */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Resolution Distribution</h4>
                <div className="space-y-3">
                  {dashboardData.overview.disputes?.map((dispute, index) => {
                    const totalDisputes = dashboardData.overview.disputes.reduce((sum, d) => sum + d.count, 0);
                    const percentage = totalDisputes > 0 ? ((dispute.count / totalDisputes) * 100).toFixed(1) : 0;

                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${dispute._id === 'BUYER' ? 'bg-red-500' :
                            dispute._id === 'SELLER' ? 'bg-green-500' : 'bg-gray-500'
                            }`}></div>
                          <span className="text-sm font-medium">
                            {dispute._id === 'BUYER' ? 'Buyer Favor' :
                              dispute._id === 'SELLER' ? 'Seller Favor' : dispute._id}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold">{dispute.count}</span>
                          <span className="text-xs text-gray-500 ml-1">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Financial Impact Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Financial Impact Summary</h4>
                <div className="space-y-3">
                  {dashboardData.overview.disputes?.map((dispute, index) => {
                    const estimatedImpact = dispute._id === 'BUYER'
                      ? (dispute.totalOrderValue * (dispute.avgRefundPercent || 0) / 100)
                      : 0;

                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            {dispute._id === 'BUYER' ? 'Buyer Refunds' :
                              dispute._id === 'SELLER' ? 'Seller Protection' : dispute._id}
                          </span>
                          <span className={`font-medium ${dispute._id === 'BUYER' ? 'text-red-600' : 'text-green-600'
                            }`}>
                            {formatCurrency(estimatedImpact)}
                          </span>
                        </div>
                        {dispute.avgRefundPercent > 0 && (
                          <div className="text-xs text-gray-500">
                            Avg refund: {dispute.avgRefundPercent.toFixed(1)}% of order value
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Dispute Trends */}
            {dashboardData.overview.disputes && dashboardData.overview.disputes.length > 0 && (
              <div className="bg-white border rounded-lg p-4">
                <h4 className="font-semibold mb-3">Dispute Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">
                      {dashboardData.overview.disputes.reduce((sum, d) => sum + d.count, 0)}
                    </div>
                    <div className="text-xs sm:text-sm text-blue-700">Total Disputes</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded">
                    <div className="text-xl sm:text-2xl font-bold text-green-600">
                      {formatCurrency(dashboardData.overview.disputes.reduce((sum, d) => sum + d.totalOrderValue, 0))}
                    </div>
                    <div className="text-xs sm:text-sm text-green-700">Total Disputed Value</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded">
                    <div className="text-xl sm:text-2xl font-bold text-purple-600">
                      {dashboardData.overview.disputes.reduce((sum, d) => sum + d.count, 0) > 0
                        ? ((dashboardData.overview.disputes.reduce((sum, d) => sum + d.totalOrderValue, 0) /
                          dashboardData.overview.disputes.reduce((sum, d) => sum + d.count, 0))).toFixed(0)
                        : '0'}
                    </div>
                    <div className="text-xs sm:text-sm text-purple-700">Avg Dispute Value</div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Money Flow with Dispute Filter */}
            {moneyFlowData && (
              <div className="bg-white border rounded-lg p-4 mt-6">
                <h4 className="font-semibold mb-3">Orders with Dispute Impact</h4>

                {/* Mobile Card View */}
                <div className="lg:hidden">
                  <div className="max-h-64 overflow-y-auto">
                    <div className="space-y-3">
                      {moneyFlowData.orders?.filter(order => order.moneyFlow.disputeImpact.length > 0).map((order, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-3">
                          {/* Order Header */}
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-medium text-sm">{order.orderId}</span>
                              <span className="text-xs text-gray-500 block">
                                {new Date(order.orderDate).toLocaleDateString()}
                              </span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDetailModal({ show: true, data: order })}
                              title="View detailed dispute impact"
                              className="p-2"
                            >
                              <FaEye className="w-3 h-3" />
                            </Button>
                          </div>

                          {/* Participants */}
                          <div className="bg-white rounded p-2">
                            <p className="text-xs font-medium text-gray-600 mb-1">Participants</p>
                            <div className="text-xs space-y-1">
                              <div className="flex items-center">
                                <span className="mr-2">👤</span>
                                <span className="truncate">{order.buyer.name}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="mr-2">🏪</span>
                                <span className="truncate">{order.seller.name}</span>
                              </div>
                            </div>
                          </div>

                          {/* Financial Details */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-blue-50 rounded p-2">
                              <p className="text-xs font-medium text-blue-700">Order Value</p>
                              <p className="text-sm font-bold text-blue-600">
                                {formatCurrency(order.moneyFlow.buyerPayment.grandTotal)}
                              </p>
                            </div>
                            <div className="bg-red-50 rounded p-2">
                              <p className="text-xs font-medium text-red-700">Dispute Impact</p>
                              <p className="text-sm font-bold text-red-600">
                                {formatCurrency(
                                  order.moneyFlow.disputeImpact.reduce((sum, dispute) => sum + dispute.financialImpact, 0)
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto max-h-64">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="text-left p-3 text-sm">Order</th>
                        <th className="text-left p-3 text-sm">Participants</th>
                        <th className="text-right p-3 text-sm">Order Value</th>
                        <th className="text-right p-3 text-sm">Dispute Impact</th>
                        <th className="text-center p-3 text-sm">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {moneyFlowData.orders?.filter(order => order.moneyFlow.disputeImpact.length > 0).map((order, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div>
                              <span className="font-medium text-sm">{order.orderId}</span>
                              <span className="text-xs text-gray-500 block">
                                {new Date(order.orderDate).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-xs">
                              <div>👤 {order.buyer.name}</div>
                              <div>🏪 {order.seller.name}</div>
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <span className="font-medium text-sm">
                              {formatCurrency(order.moneyFlow.buyerPayment.grandTotal)}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <span className="font-medium text-red-600 text-sm">
                              {formatCurrency(
                                order.moneyFlow.disputeImpact.reduce((sum, dispute) => sum + dispute.financialImpact, 0)
                              )}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDetailModal({ show: true, data: order })}
                              title="View detailed dispute impact"
                            >
                              <FaEye className="w-3 h-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {moneyFlowData.orders?.filter(order => order.moneyFlow.disputeImpact.length > 0).length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <FaExclamationTriangle className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm sm:text-base">No orders with dispute impact found in the selected date range</p>
                  </div>
                )}
              </div>
            )}

            {/* Additional Insights */}
            {/* {dashboardData.overview.disputes && dashboardData.overview.disputes.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                  <MdInfo className="w-5 h-5 mr-2" />
                  Dispute Management Insights
                </h4>
                <div className="text-sm text-yellow-700 space-y-1">
                  <p>• Monitor dispute patterns to identify potential product or seller issues</p>
                  <p>• Track resolution times to improve customer satisfaction</p>
                  <p>• Use dispute data to refine platform policies and fee structures</p>
                  <p>• Consider implementing preventive measures for high-dispute categories</p>
                </div>
              </div>
            )} */}
          </div>
        </div>
      )}

      {/* Detailed Money Flow Modal */}
      {detailModal.show && detailModal.data && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold">Detailed Money Flow</h2>
              <button
                onClick={() => setDetailModal({ show: false, data: null })}
                className="text-gray-500 hover:text-gray-700 text-2xl p-1"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 sm:">
              {/* Order Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Order ID</p>
                  <p className="font-medium text-sm sm:text-base">{detailModal.data.orderId}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Order Date</p>
                  <p className="font-medium text-sm sm:text-base">{new Date(detailModal.data.orderDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Buyer</p>
                  <p className="font-medium text-sm sm:text-base">{detailModal.data.buyer.name}</p>
                  <p className="text-xs text-gray-500">{detailModal.data.buyer.email}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Seller</p>
                  <p className="font-medium text-sm sm:text-base">{detailModal.data.seller.name}</p>
                  <p className="text-xs text-gray-500">{detailModal.data.seller.email}</p>
                </div>
              </div>

              {/* Products */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Products</h3>
                <div className="space-y-2">
                  {detailModal.data.products.map((product, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                      {product.images?.[0] && (
                        <img src={product.images[0]} alt={product.title} className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded flex-shrink-0" />
                      )}
                      <span className="font-medium text-sm sm:text-base truncate">{product.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Money Flow Visualization */}
              <div className="space-y-4">
                <h3 className="font-semibold text-base sm:text-lg">Money Flow Breakdown</h3>

                {/* Step 1: Buyer Payment */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center text-sm sm:text-base">
                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">1</span>
                    Buyer Payment
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span>Product Amount:</span>
                      <span className="font-medium">{formatCurrency(detailModal.data.moneyFlow.buyerPayment.productAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span className="font-medium">{formatCurrency(detailModal.data.moneyFlow.buyerPayment.shippingCharge)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Buyer Protection Fee:</span>
                      <span className="font-medium">{formatCurrency(detailModal.data.moneyFlow.buyerPayment.buyerProtectionFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span className="font-medium">{formatCurrency(detailModal.data.moneyFlow.buyerPayment.tax)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base sm:text-lg col-span-1 sm:col-span-2 border-t pt-2">
                      <span>Total Paid:</span>
                      <span className="text-blue-600">{formatCurrency(detailModal.data.moneyFlow.buyerPayment.grandTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Step 2: Platform Revenue */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center text-sm sm:text-base">
                    <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">2</span>
                    Platform Revenue
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span>Buyer Protection Fee:</span>
                      <span className="font-medium">{formatCurrency(detailModal.data.moneyFlow.platformRevenue.buyerProtectionFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span className="font-medium">{formatCurrency(detailModal.data.moneyFlow.platformRevenue.tax)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service Charges:</span>
                      <span className="font-medium">{formatCurrency(detailModal.data.moneyFlow.platformRevenue.serviceCharges)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax Charges:</span>
                      <span className="font-medium">{formatCurrency(detailModal.data.moneyFlow.platformRevenue.taxCharges)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Withdrawal Fees:</span>
                      <span className="font-medium">{formatCurrency(detailModal.data.moneyFlow.platformRevenue.withdrawalFees)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base sm:text-lg col-span-1 sm:col-span-2 border-t pt-2">
                      <span>Total Platform Revenue:</span>
                      <span className="text-green-600">{formatCurrency(detailModal.data.moneyFlow.platformRevenue.totalPlatformRevenue)}</span>
                    </div>
                  </div>
                </div>

                {/* Step 3: Seller Payouts */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-3 flex items-center text-sm sm:text-base">
                    <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">3</span>
                    Seller Payouts
                  </h4>
                  {detailModal.data.moneyFlow.sellerPayouts.length > 0 ? (
                    <div className="space-y-3">
                      {detailModal.data.moneyFlow.sellerPayouts.map((payout, index) => (
                        <div key={index} className="bg-white p-3 rounded border">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            <div className="flex justify-between">
                              <span>Type:</span>
                              <span className="font-medium">{payout.tnxType.toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Status:</span>
                              <span className={`font-medium ${payout.tnxStatus === 'completed' ? 'text-green-600' : 'text-orange-600'}`}>
                                {payout.tnxStatus.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Amount:</span>
                              <span className="font-medium">{formatCurrency(payout.amount || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Net Amount:</span>
                              <span className="font-medium">{formatCurrency(payout.netAmount || 0)}</span>
                            </div>
                            {payout.serviceCharge && (
                              <div className="flex justify-between">
                                <span>Service Charge:</span>
                                <span className="font-medium">{formatCurrency(parseFloat(payout.serviceCharge) || 0)}</span>
                              </div>
                            )}
                            {payout.withdrawfee && (
                              <div className="flex justify-between">
                                <span>Withdrawal Fee:</span>
                                <span className="font-medium">{formatCurrency(payout.withdrawfee || 0)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No seller payouts yet</p>
                  )}
                </div>

                {/* Step 4: Dispute Impact (if any) */}
                {detailModal.data.moneyFlow.disputeImpact.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-3 flex items-center text-sm sm:text-base">
                      <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">!</span>
                      Dispute Impact
                    </h4>
                    <div className="space-y-2">
                      {detailModal.data.moneyFlow.disputeImpact.map((dispute, index) => (
                        <div key={index} className="bg-white p-3 rounded border">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            <div className="flex justify-between">
                              <span>Dispute ID:</span>
                              <span className="font-medium">{dispute.disputeId}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Status:</span>
                              <span className="font-medium">{dispute.status}</span>
                            </div>
                            <div className="flex justify-between col-span-1 sm:col-span-2">
                              <span>Financial Impact:</span>
                              <span className="font-medium text-red-600">{formatCurrency(dispute.financialImpact)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-3 text-sm sm:text-base">Flow Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Buyer Paid:</span>
                      <span className="font-medium text-blue-600">{formatCurrency(detailModal.data.moneyFlow.buyerPayment.grandTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform Earned:</span>
                      <span className="font-medium text-green-600">{formatCurrency(detailModal.data.moneyFlow.platformRevenue.totalPlatformRevenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Seller Received:</span>
                      <span className="font-medium text-purple-600">
                        {formatCurrency(
                          detailModal.data.moneyFlow.sellerPayouts
                            .filter(txn => txn.tnxType === 'credit')
                            .reduce((sum, txn) => sum + (txn.netAmount || 0), 0)
                        )}
                      </span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-medium">
                      <span>Total Accounted:</span>
                      <span>{formatCurrency(
                        detailModal.data.moneyFlow.platformRevenue.totalPlatformRevenue +
                        detailModal.data.moneyFlow.sellerPayouts
                          .filter(txn => txn.tnxType === 'credit')
                          .reduce((sum, txn) => sum + (txn.netAmount || 0), 0)
                      )}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

; 