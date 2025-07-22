import React, { useState, useEffect } from 'react';
import DataTable from '../../Component/Table/DataTable';
import Button from '../../Component/Atoms/Button/Button';
import InputField from '../../Component/Atoms/InputFields/Inputfield';
import Pagination from '../../Component/Atoms/Pagination/Pagination';
import { useTheme } from '../../contexts/theme/hook/useTheme';
import authAxiosClient from '../../api/authAxiosClient';
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { FaEye, FaMoneyBillWave, FaCalculator, FaExclamationTriangle, FaFilter, FaCalendar } from 'react-icons/fa';
import { MdPayment, MdInfo } from 'react-icons/md';

const AdminTransactions = () => {
  const { theme } = useTheme();

  // State for transactions list
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ pageNo: 1, size: 10 });
  const [totalRecords, setTotalRecords] = useState(0);

  // Enhanced filters state
  const [filters, setFilters] = useState({
    minAmount: '',
    maxAmount: '',
    status: '',
    paymentStatus: '',
    sellerId: '',
    buyerId: '',
    dateFrom: '',
    dateTo: '',
    paidToSeller: '',
    hasDispute: '', // New filter for dispute
    disputeStatus: '' // New filter for dispute status
  });

  // Modal states
  const [payoutModal, setPayoutModal] = useState({ show: false, data: null, notes: '' });
  const [calculationModal, setCalculationModal] = useState({ show: false, data: null });
  const [disputeModal, setDisputeModal] = useState({ show: false, data: null });
  const [showFilters, setShowFilters] = useState(false);

  // Form validation
  const [errors, setErrors] = useState({});

  // Fetch transactions list
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setErrors({});

      // Build query params, excluding empty values
      const queryParams = new URLSearchParams();
      queryParams.append('pageNo', pagination.pageNo);
      queryParams.append('size', pagination.size);

      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.toString().trim() !== '') {
          queryParams.append(key, value);
        }
      });

      const response = await authAxiosClient.get(`/order/admin/transactions?${queryParams}`);
      if (response.data?.status === true) {
        const transactionsData = response.data.data.transactions || [];
        setTransactions(transactionsData);
        setTotalRecords(response.data.data.totalRecords || 0);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch transactions');
      }
    } catch (error) {
      console.error('Fetch transactions error:', error);
      toast.error(error.message || 'Failed to fetch transactions');
      setTransactions([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  // Get dispute information for a transaction
  const getDisputeInfo = async (orderId) => {
    try {
      const response = await authAxiosClient.get(`/dispute/byOrderId/${orderId}`);
      if (response.data?.status === true) {
        setDisputeModal({ show: true, data: response.data.data });
      } else {
        toast.error('No dispute found for this order');
      }
    } catch (error) {
      console.error('Get dispute info error:', error);
      toast.error(error.message || 'Failed to get dispute information');
    }
  };

  // Get payout calculation for an order
  const getPayoutCalculation = async (orderId) => {
    try {
      if (!orderId) {
        toast.error('Order ID is required');
        return;
      }

      setLoading(true);
      const response = await authAxiosClient.get(`/order/admin/payoutCalculation/${orderId}`);

      if (response.data?.status === true) {
        setCalculationModal({ show: true, data: response.data.data });
      } else {
        throw new Error(response.data?.message || 'Failed to get payout calculation');
      }
    } catch (error) {
      console.error('Get payout calculation error:', error);
      toast.error(error.message || 'Failed to get payout calculation');
    } finally {
      setLoading(false);
    }
  };

  // Mark seller as paid
  const markSellerAsPaid = async (orderId, notes = '') => {
    try {
      if (!orderId) {
        toast.error('Order ID is required');
        return;
      }

      // Validate notes if provided
      if (notes && notes.length > 500) {
        toast.error('Notes cannot exceed 500 characters');
        return;
      }

      setLoading(true);
      const response = await authAxiosClient.post('/order/admin/markSellerPaid', {
        orderId,
        notes: notes.trim()
      });

      if (response.data?.status === true) {
        toast.success('Seller marked as paid successfully');
        setPayoutModal({ show: false, data: null, notes: '' });
        fetchTransactions(); // Refresh the list
      } else {
        throw new Error(response.data?.message || 'Failed to mark seller as paid');
      }
    } catch (error) {
      console.error('Mark seller as paid error:', error);
      toast.error(error.message || 'Failed to mark seller as paid');
    } finally {
      setLoading(false);
    }
  };

  // Form validation
  const validateFilters = () => {
    const newErrors = {};

    // Validate amount range
    if (filters.minAmount && filters.maxAmount) {
      const minAmount = parseFloat(filters.minAmount);
      const maxAmount = parseFloat(filters.maxAmount);

      if (isNaN(minAmount) || isNaN(maxAmount)) {
        newErrors.amount = 'Please enter valid numeric amounts';
      } else if (minAmount >= maxAmount) {
        newErrors.amount = 'Minimum amount must be less than maximum amount';
      }
    }

    // Validate individual amounts
    if (filters.minAmount && (isNaN(parseFloat(filters.minAmount)) || parseFloat(filters.minAmount) < 0)) {
      newErrors.minAmount = 'Please enter a valid minimum amount';
    }

    if (filters.maxAmount && (isNaN(parseFloat(filters.maxAmount)) || parseFloat(filters.maxAmount) < 0)) {
      newErrors.maxAmount = 'Please enter a valid maximum amount';
    }

    // Validate date range
    if (filters.dateFrom && filters.dateTo) {
      const fromDate = new Date(filters.dateFrom);
      const toDate = new Date(filters.dateTo);

      if (fromDate >= toDate) {
        newErrors.dateRange = 'From date must be before to date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));

    // Clear related errors
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Apply filters
  const applyFilters = () => {
    if (validateFilters()) {
      setPagination(prev => ({ ...prev, pageNo: 1 }));
      fetchTransactions();
    }
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      minAmount: '',
      maxAmount: '',
      status: '',
      paymentStatus: '',
      sellerId: '',
      buyerId: '',
      dateFrom: '',
      dateTo: '',
      paidToSeller: '',
      hasDispute: '',
      disputeStatus: ''
    });
    setErrors({});
    setPagination(prev => ({ ...prev, pageNo: 1 }));
  };

  // Handle page changes
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, pageNo: newPage }));
  };

  // Check if transaction has dispute
  const hasDispute = (transaction) => {
    return transaction.disputeId || transaction.dispute;
  };

  // Get dispute status badge
  const getDisputeStatusBadge = (dispute) => {
    if (!dispute) return null;
    
    const statusColors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'UNDER_REVIEW': 'bg-blue-100 text-blue-800',
      'RESOLVED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`text-xs px-2 py-1 rounded-full ${statusColors[dispute.status] || 'bg-gray-100 text-gray-800'}`}>
        {dispute.status}
      </span>
    );
  };

  // Confirm mark seller as paid
  const confirmMarkAsPaid = (transaction) => {
    const sellerPayout = transaction.sellerPayout;

    if (!sellerPayout) {
      toast.error('No payout information available for this transaction');
      return;
    }

    if (sellerPayout.isPaidToSeller) {
      toast.info('Seller has already been paid for this order');
      return;
    }

    // Check if there's a pending dispute
    if (hasDispute(transaction) && transaction.dispute?.status !== 'RESOLVED') {
      confirmAlert({
        title: 'Transaction Has Dispute',
        message: `This transaction has an active dispute (${transaction.dispute?.status || 'Unknown'}). Are you sure you want to proceed with payment?`,
        buttons: [
          {
            label: 'View Dispute',
            onClick: () => getDisputeInfo(transaction.orderId)
          },
          {
            label: 'Proceed Anyway',
            onClick: () => setPayoutModal({ show: true, data: transaction, notes: '' })
          },
          {
            label: 'Cancel',
            onClick: () => { }
          }
        ]
      });
      return;
    }

    confirmAlert({
      title: 'Confirm Payment',
      message: `Are you sure you want to mark seller as paid for Order #${transaction.orderNumber}?`,
      buttons: [
        {
          label: 'Yes',
          onClick: () => setPayoutModal({ show: true, data: transaction, notes: '' })
        },
        {
          label: 'No',
          onClick: () => { }
        }
      ]
    });
  };

  // Table columns configuration
  const columns = [
    {
      key: "serial",
      label: "S.No",
      width: "5%",
      render: (_, __, rowIndex) => (pagination.pageNo - 1) * pagination.size + rowIndex + 1,
    },
    {
      key: 'orderInfo',
      label: 'Order Info',
      width: "15%",
      render: (_, row) => (
        <div className="flex flex-col space-y-1">
          <span className="font-medium text-sm">{row.orderIdFor}</span>
          <span className="text-xs text-gray-500">{new Date(row.orderDate).toLocaleDateString()}</span>
          {hasDispute(row) && (
            <div className="flex items-center space-x-1">
              {/* <MdDispute className="w-3 h-3 text-orange-500" /> */}
              <span className="text-xs text-orange-600">Has Dispute</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'Buyer',
      label: 'Buyer',
      width: "12%",
      render: (_, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm">{row?.buyer?.name || 'N/A'}</span>
          <span className="text-xs text-gray-500">{row?.buyer?.email || ''}</span>
        </div>
      )
    },
    {
      key: 'Seller',
      label: 'Seller',
      width: "12%",
      render: (_, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm">{row?.seller?.name || 'N/A'}</span>
          <span className="text-xs text-gray-500">{row?.seller?.email || ''}</span>
        </div>
      )
    },
    {
      key: 'amounts',
      label: 'Amounts',
      width: "15%",
      render: (_, row) => (
        <div className="flex flex-col space-y-1">
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">Buyer:</span>
            <span className="text-sm font-medium">฿{row?.buyerPayment?.grandTotal?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">Seller:</span>
            <span className="text-sm font-medium">฿{row?.sellerPayout?.payoutAmount?.toFixed(2) || '0.00'}</span>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      width: "12%",
      render: (_, row) => (
        <div className="flex flex-col space-y-1">
          <span className={`text-xs px-2 py-1 rounded-full ${
            row?.status === 'completed' ? 'bg-green-100 text-green-800' :
            row?.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
            row?.status === 'shipped' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {row?.status?.toUpperCase()}
          </span>
          {row?.sellerPayout && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              row?.sellerPayout?.isPaidToSeller
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {row?.sellerPayout?.isPaidToSeller ? 'Paid' : 'Unpaid'}
            </span>
          )}
          {row?.dispute && getDisputeStatusBadge(row.dispute)}
        </div>
      )
    },
    {
      key: 'Actions',
      label: 'Actions',
      width: "18%",
      render: (_, transaction) => (
        <div className="flex space-x-1 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => getPayoutCalculation(transaction.orderId)}
            className="flex items-center space-x-1 mb-1"
          >
            <FaCalculator className="w-3 h-3" />
            <span>Calculate</span>
          </Button>

          {hasDispute(transaction) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => getDisputeInfo(transaction.orderId)}
              className="flex items-center space-x-1 mb-1 border-orange-300 text-orange-600 hover:bg-orange-50"
            >
              {/* <MdDispute className="w-3 h-3" /> */}
              <span>Dispute</span>
            </Button>
          )}

          {transaction.sellerPayout && !transaction.sellerPayout.isPaidToSeller && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => confirmMarkAsPaid(transaction)}
              className="flex items-center space-x-1 mb-1"
            >
              <MdPayment className="w-3 h-3" />
              <span>Mark Paid</span>
            </Button>
          )}

          {transaction.sellerPayout?.isPaidToSeller && (
            <span className="text-xs text-green-600 flex items-center space-x-1">
              <MdInfo className="w-3 h-3" />
              <span>Completed</span>
            </span>
          )}
        </div>
      )
    }
  ];

  // Load transactions on component mount and when pagination/filters change
  useEffect(() => {
    fetchTransactions();
  }, [pagination.pageNo, pagination.size]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Transaction Management</h1>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2"
        >
          <FaFilter className="w-4 h-4" />
          <span>Filters</span>
        </Button>
      </div>

      {/* Enhanced Filters Section */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-lg font-semibold mb-4">Filter Transactions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Amount Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Amount Range</label>
              <div className="flex space-x-2">
                <InputField
                  type="number"
                  name="minAmount"
                  placeholder="Min"
                  value={filters.minAmount}
                  onChange={handleFilterChange}
                  className="flex-1"
                />
                <InputField
                  type="number"
                  name="maxAmount"
                  placeholder="Max"
                  value={filters.maxAmount}
                  onChange={handleFilterChange}
                  className="flex-1"
                />
              </div>
              {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
            </div>

            {/* Order Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Order Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Payment Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Payment Status</label>
              <select
                name="paymentStatus"
                value={filters.paymentStatus}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Payment Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            {/* Seller Paid Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Seller Paid</label>
              <select
                name="paidToSeller"
                value={filters.paidToSeller}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="true">Paid</option>
                <option value="false">Unpaid</option>
              </select>
            </div>

            {/* Has Dispute */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Dispute Status</label>
              <select
                name="hasDispute"
                value={filters.hasDispute}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="true">Has Dispute</option>
                <option value="false">No Dispute</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Date From</label>
              <InputField
                type="date"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Date To</label>
              <InputField
                type="date"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
              />
              {errors.dateRange && <p className="text-xs text-red-500">{errors.dateRange}</p>}
            </div>
          </div>

          <div className="flex space-x-4 mt-4">
            <Button
              variant="primary"
              onClick={applyFilters}
              className="flex items-center space-x-2"
            >
              <FaFilter className="w-4 h-4" />
              <span>Apply Filters</span>
            </Button>
            <Button
              variant="outline"
              onClick={clearFilters}
              className="flex items-center space-x-2"
            >
              <FaCalendar className="w-4 h-4" />
              <span>Clear</span>
            </Button>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        {transactions.length === 0 && !loading && (
          <div className="p-8 text-center text-gray-500">
            <MdInfo className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No transactions found</h3>
            <p>Try adjusting your filters or check back later.</p>
          </div>
        )}

        {transactions.length > 0 && (
          <DataTable
            columns={columns}
            data={transactions}
            loading={loading}
            emptyMessage="No transactions found"
          />
        )}

        {totalRecords > 0 && totalRecords > pagination.size && (
          <div className="p-4 bg-[#F9FAFB] border-t">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-700">
                Showing {((pagination.pageNo - 1) * pagination.size) + 1} to {Math.min(pagination.pageNo * pagination.size, totalRecords)} of {totalRecords} transactions
              </p>
              <Pagination
                pageNo={pagination.pageNo}
                size={pagination.size}
                total={totalRecords}
                onChange={handlePageChange}
              />
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Payout Calculation Modal */}
      {calculationModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Payout Calculation Details</h2>
              <button
                onClick={() => setCalculationModal({ show: false, data: null })}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {calculationModal.data && (
              <div className="space-y-6">
                {/* Order Information */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Order Number</p>
                    <p className="font-medium">#{calculationModal.data.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Order Status</p>
                    <p className="font-medium">{calculationModal.data.orderStatus}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Seller</p>
                    <p className="font-medium">{calculationModal.data.seller?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payout Completed</p>
                    <p className={`font-medium ${calculationModal.data.isPayoutCompleted ? 'text-green-600' : 'text-red-600'}`}>
                      {calculationModal.data.isPayoutCompleted ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>

                {/* Dispute Information (if any) */}
                {calculationModal.data.dispute && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <h3 className="font-semibold text-orange-800 mb-2 flex items-center">
                      <FaExclamationTriangle className="w-4 h-4 mr-2" />
                      Dispute Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="font-medium">{calculationModal.data.dispute.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="font-medium">{calculationModal.data.dispute.type}</span>
                      </div>
                      {calculationModal.data.dispute.decision && (
                        <div className="flex justify-between">
                          <span>Decision:</span>
                          <span className="font-medium">{calculationModal.data.dispute.decision} favor</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Payout Breakdown */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Payout Calculation Breakdown</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Original Product Cost:</span>
                        <span className="font-medium">฿{calculationModal.data.payoutCalculation?.productCost?.toFixed(2)}</span>
                      </div>
                      
                      <hr className="border-gray-200" />
                      
                      <div className="flex justify-between items-center text-red-600">
                        <span>Service Charge ({calculationModal.data.payoutCalculation?.serviceChargeType}):</span>
                        <span>-฿{calculationModal.data.payoutCalculation?.serviceCharge?.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-red-600">
                        <span>Tax Charge ({calculationModal.data.payoutCalculation?.taxChargeType}):</span>
                        <span>-฿{calculationModal.data.payoutCalculation?.taxCharge?.toFixed(2)}</span>
                      </div>
                      
                      <hr className="border-gray-300" />
                      
                      <div className="flex justify-between items-center font-medium text-lg">
                        <span>Net Amount (Before Withdrawal):</span>
                        <span>฿{calculationModal.data.payoutCalculation?.netAmount?.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-red-600">
                        <span>Withdrawal Fee ({calculationModal.data.payoutCalculation?.withdrawalFeeType}):</span>
                        <span>-฿{calculationModal.data.payoutCalculation?.withdrawalFee?.toFixed(2)}</span>
                      </div>
                      
                      <hr className="border-gray-400" />
                      
                      <div className="flex justify-between items-center font-bold text-xl text-green-600">
                        <span>Final Payout Amount:</span>
                        <span>฿{calculationModal.data.payoutCalculation?.netAmountAfterWithdrawalFee?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  <p><strong>Note:</strong> The final payout amount is what the seller will receive after all platform fees and charges.</p>
                  {calculationModal.data.dispute && (
                    <p className="mt-2"><strong>Dispute Impact:</strong> This calculation includes adjustments based on the dispute resolution.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Mark as Paid Modal */}
      {payoutModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Confirm Seller Payment</h2>
              <button
                onClick={() => setPayoutModal({ show: false, data: null, notes: '' })}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {payoutModal.data && (
              <div className="space-y-4">
                {/* Order Info */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Order:</span>
                      <span className="font-medium">#{payoutModal.data.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Seller:</span>
                      <span className="font-medium">{payoutModal.data.seller?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Payout Amount:</span>
                      <span className="font-medium text-green-600">
                        ฿{payoutModal.data.sellerPayout?.payoutAmount?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dispute Warning */}
                {hasDispute(payoutModal.data) && payoutModal.data.dispute?.status !== 'RESOLVED' && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-orange-800">
                      <FaExclamationTriangle className="w-4 h-4" />
                      <span className="font-medium">Dispute Warning</span>
                    </div>
                    <p className="text-sm text-orange-700 mt-1">
                      This order has an active dispute ({payoutModal.data.dispute?.status}). 
                      Please ensure the dispute is resolved before processing payment.
                    </p>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Notes (Optional)
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    maxLength="500"
                    placeholder="Add any notes about this payment..."
                    value={payoutModal.notes || ''}
                    onChange={(e) => setPayoutModal(prev => ({ ...prev, notes: e.target.value }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {(payoutModal.notes || '').length}/500 characters
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <Button
                    variant="primary"
                    onClick={() => markSellerAsPaid(payoutModal.data.orderId, payoutModal.notes)}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? 'Processing...' : 'Confirm Payment'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPayoutModal({ show: false, data: null, notes: '' })}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dispute Information Modal */}
      {disputeModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Dispute Information</h2>
              <button
                onClick={() => setDisputeModal({ show: false, data: null })}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {disputeModal.data && (
              <div className="space-y-6">
                {/* Dispute Overview */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Dispute ID</p>
                    <p className="font-medium">{disputeModal.data.dispute?.disputeId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <div>{getDisputeStatusBadge(disputeModal.data.dispute)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-medium">{disputeModal.data.dispute?.disputeType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-medium">{new Date(disputeModal.data.dispute?.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Dispute Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Buyer's Complaint</h3>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded">{disputeModal.data.dispute?.disputeType}</p>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded">{disputeModal.data.dispute?.description}</p>
                  </div>

                  {disputeModal.data.dispute?.sellerResponse && (
                    <div>
                      <h3 className="font-semibold mb-2">Seller's Response</h3>
                      <p className="text-gray-700 bg-blue-50 p-3 rounded">{disputeModal.data.dispute.sellerResponse.description}</p>
                    </div>
                  )}

                  {disputeModal.data.dispute?.adminReview && (
                    <div>
                      <h3 className="font-semibold mb-2">Admin Decision</h3>
                      <div className="bg-green-50 p-3 rounded space-y-2">
                        <p><strong>Decision:</strong> {disputeModal.data.dispute.adminReview.decision} favor</p>
                        {disputeModal.data.dispute.adminReview.disputeAmountPercent > 0 && (
                          <p><strong>Refund Amount:</strong> {disputeModal.data.dispute.adminReview.disputeAmountPercent}% of order value</p>
                        )}
                        <p><strong>Note:</strong> {disputeModal.data.dispute.adminReview.decisionNote}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTransactions; 