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
import { FaEye, FaMoneyBillWave, FaCalculator, FaExclamationTriangle, FaFilter, FaCalendar, FaCheck, FaTimes, FaClock, FaWallet } from 'react-icons/fa';
import { MdPayment, MdInfo } from 'react-icons/md';
import { FaChartLine } from "react-icons/fa";

const AdminTransactions = () => {
  const { theme } = useTheme();

  // Tab state
  const [activeTab, setActiveTab] = useState('transactions');

  // State for transactions list
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ pageNo: 1, size: 10 });
  const [totalRecords, setTotalRecords] = useState(0);

  // State for withdrawal requests
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [withdrawalPagination, setWithdrawalPagination] = useState({ pageNo: 1, size: 10 });
  const [withdrawalTotalRecords, setWithdrawalTotalRecords] = useState(0);

  // Enhanced filters state for transactions
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
    hasDispute: '',
    disputeStatus: ''
  });

  // Filters state for withdrawal requests
  const [withdrawalFilters, setWithdrawalFilters] = useState({
    minAmount: '',
    maxAmount: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    userId: ''
  });

  // Modal states
  const [payoutModal, setPayoutModal] = useState({ show: false, data: null, notes: '' });
  const [calculationModal, setCalculationModal] = useState({ show: false, data: null });
  const [disputeModal, setDisputeModal] = useState({ show: false, data: null });
  const [withdrawalDetailModal, setWithdrawalDetailModal] = useState({ show: false, data: null });
  const [withdrawalActionModal, setWithdrawalActionModal] = useState({ show: false, data: null, action: '', notes: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [showWithdrawalFilters, setShowWithdrawalFilters] = useState(false);

  // Form validation
  const [errors, setErrors] = useState({});
  const [withdrawalErrors, setWithdrawalErrors] = useState({});

  // Fetch transactions list
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setErrors({});

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

  // Fetch withdrawal requests
  const fetchWithdrawalRequests = async () => {
    try {
      setWithdrawalLoading(true);
      setWithdrawalErrors({});

      const queryParams = new URLSearchParams();
      queryParams.append('pageNo', withdrawalPagination.pageNo);
      queryParams.append('size', withdrawalPagination.size);

      Object.entries(withdrawalFilters).forEach(([key, value]) => {
        if (value && value.toString().trim() !== '') {
          queryParams.append(key, value);
        }
      });

      const response = await authAxiosClient.get(`/order/getAllWithdrawRequests?${queryParams}`);
      if (response.data?.status === true) {
        const withdrawalData = response.data.data.data || [];
        setWithdrawalRequests(withdrawalData);
        setWithdrawalTotalRecords(response.data.data.totalRecords || 0);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch withdrawal requests');
      }
    } catch (error) {
      console.error('Fetch withdrawal requests error:', error);
      toast.error(error.message || 'Failed to fetch withdrawal requests');
      setWithdrawalRequests([]);
      setWithdrawalTotalRecords(0);
    } finally {
      setWithdrawalLoading(false);
    }
  };

  // Handle withdrawal request action (approve/reject)
  const handleWithdrawalAction = async (requestId, action, notes = '') => {
    try {
      setWithdrawalLoading(true);

      if (!requestId || !action) {
        toast.error('Request ID and action are required');
        return;
      }

      if (notes.length > 500) {
        toast.error('Notes cannot exceed 500 characters');
        return;
      }

      const response = await authAxiosClient.post('/order/changeStatus', {
        withdrawRequestId: requestId,
        status: action,
        notes: notes.trim()
      });

      if (response.data?.status === true) {
        toast.success(`Withdrawal request ${action.toLowerCase()} successfully`);
        setWithdrawalActionModal({ show: false, data: null, action: '', notes: '' });
        fetchWithdrawalRequests(); // Refresh the list
      } else {
        throw new Error(response.data?.message || `Failed to ${action.toLowerCase()} withdrawal request`);
      }
    } catch (error) {
      console.error('Withdrawal action error:', error);
      toast.error(error.message || `Failed to ${action.toLowerCase()} withdrawal request`);
    } finally {
      setWithdrawalLoading(false);
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

  // Form validation for transactions
  const validateFilters = () => {
    const newErrors = {};

    if (filters.minAmount && filters.maxAmount) {
      const minAmount = parseFloat(filters.minAmount);
      const maxAmount = parseFloat(filters.maxAmount);

      if (isNaN(minAmount) || isNaN(maxAmount)) {
        newErrors.amount = 'Please enter valid numeric amounts';
      } else if (minAmount >= maxAmount) {
        newErrors.amount = 'Minimum amount must be less than maximum amount';
      }
    }

    if (filters.minAmount && (isNaN(parseFloat(filters.minAmount)) || parseFloat(filters.minAmount) < 0)) {
      newErrors.minAmount = 'Please enter a valid minimum amount';
    }

    if (filters.maxAmount && (isNaN(parseFloat(filters.maxAmount)) || parseFloat(filters.maxAmount) < 0)) {
      newErrors.maxAmount = 'Please enter a valid maximum amount';
    }

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

  // Form validation for withdrawal requests
  const validateWithdrawalFilters = () => {
    const newErrors = {};

    if (withdrawalFilters.minAmount && withdrawalFilters.maxAmount) {
      const minAmount = parseFloat(withdrawalFilters.minAmount);
      const maxAmount = parseFloat(withdrawalFilters.maxAmount);

      if (isNaN(minAmount) || isNaN(maxAmount)) {
        newErrors.amount = 'Please enter valid numeric amounts';
      } else if (minAmount >= maxAmount) {
        newErrors.amount = 'Minimum amount must be less than maximum amount';
      }
    }

    if (withdrawalFilters.minAmount && (isNaN(parseFloat(withdrawalFilters.minAmount)) || parseFloat(withdrawalFilters.minAmount) < 0)) {
      newErrors.minAmount = 'Please enter a valid minimum amount';
    }

    if (withdrawalFilters.maxAmount && (isNaN(parseFloat(withdrawalFilters.maxAmount)) || parseFloat(withdrawalFilters.maxAmount) < 0)) {
      newErrors.maxAmount = 'Please enter a valid maximum amount';
    }

    if (withdrawalFilters.dateFrom && withdrawalFilters.dateTo) {
      const fromDate = new Date(withdrawalFilters.dateFrom);
      const toDate = new Date(withdrawalFilters.dateTo);

      if (fromDate >= toDate) {
        newErrors.dateRange = 'From date must be before to date';
      }
    }

    setWithdrawalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle filter changes for transactions
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle filter changes for withdrawal requests
  const handleWithdrawalFilterChange = (e) => {
    const { name, value } = e.target;
    setWithdrawalFilters(prev => ({ ...prev, [name]: value }));

    if (withdrawalErrors[name]) {
      setWithdrawalErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Apply filters for transactions
  const applyFilters = () => {
    if (validateFilters()) {
      setPagination(prev => ({ ...prev, pageNo: 1 }));
      fetchTransactions();
    }
  };

  // Apply filters for withdrawal requests
  const applyWithdrawalFilters = () => {
    if (validateWithdrawalFilters()) {
      setWithdrawalPagination(prev => ({ ...prev, pageNo: 1 }));
      fetchWithdrawalRequests();
    }
  };

  // Clear filters for transactions
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

  // Clear filters for withdrawal requests
  const clearWithdrawalFilters = () => {
    setWithdrawalFilters({
      minAmount: '',
      maxAmount: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      userId: ''
    });
    setWithdrawalErrors({});
    setWithdrawalPagination(prev => ({ ...prev, pageNo: 1 }));
  };

  // Handle page changes for transactions
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, pageNo: newPage }));
  };

  // Handle page changes for withdrawal requests
  const handleWithdrawalPageChange = (newPage) => {
    setWithdrawalPagination(prev => ({ ...prev, pageNo: newPage }));
  };

  // Check if transaction has dispute
  const hasDispute = (transaction) => {
    return transaction.disputeId || transaction.dispute;
  };

  // Utility function to format PromptPay ID for display
  const formatPromptPayForDisplay = (promptPayId) => {
    if (!promptPayId) return 'N/A';

    // Mobile Number: 0xx-xxx-xxxx
    if (/^0\d{9}$/.test(promptPayId)) {
      return `${promptPayId.slice(0, 3)}-${promptPayId.slice(3, 6)}-${promptPayId.slice(6)}`;
    }
    // Citizen ID or Tax ID: x-xxxx-xxxxx-xx-x
    else if (/^\d{13}$/.test(promptPayId)) {
      return `${promptPayId.slice(0, 1)}-${promptPayId.slice(1, 5)}-${promptPayId.slice(5, 10)}-${promptPayId.slice(10, 12)}-${promptPayId.slice(12)}`;
    }
    // For display in table (show last 4 digits)
    else if (promptPayId.length > 6) {
      return `****${promptPayId.slice(-4)}`;
    }

    return promptPayId;
  };

  // Utility function to get PromptPay ID type with icon
  const getPromptPayIdType = (promptPayId) => {
    if (/^0\d{9}$/.test(promptPayId)) {
      return { type: 'Mobile Number', icon: '📱' };
    } else if (/^0\d{12}$/.test(promptPayId)) {
      return { type: 'Tax ID', icon: '🏢' };
    } else if (/^[1-9]\d{12}$/.test(promptPayId)) {
      return { type: 'Citizen ID', icon: '🆔' };
    } else {
      return { type: 'PromptPay ID', icon: '💳' };
    }
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

  // Get withdrawal status badge
  const getWithdrawalStatusBadge = (status) => {
    const statusColors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800'
    };

    return (
      <span className={`text-xs px-2 py-1 rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
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

  // Confirm withdrawal action
  const confirmWithdrawalAction = (request, action) => {
    const actionText = action === 'Approved' ? 'approve' : 'reject';

    confirmAlert({
      title: `Confirm ${action}`,
      message: `Are you sure you want to ${actionText} this withdrawal request for ฿${request.amount}?`,
      buttons: [
        {
          label: 'Yes',
          onClick: () => setWithdrawalActionModal({ show: true, data: request, action, notes: '' })
        },
        {
          label: 'No',
          onClick: () => { }
        }
      ]
    });
  };

  // Table columns configuration for transactions
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
          <span className={`text-xs px-2 py-1 rounded-full ${row?.status === 'completed' ? 'bg-green-100 text-green-800' :
            row?.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
              row?.status === 'shipped' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
            }`}>
            {row?.status?.toUpperCase()}
          </span>
          {row?.sellerPayout && (
            <span className={`text-xs px-2 py-1 rounded-full ${row?.sellerPayout?.isPaidToSeller
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
              <span>Dispute</span>
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

  // Table columns configuration for withdrawal requests
  const withdrawalColumns = [
    {
      key: "serial",
      label: "S.No",
      width: "5%",
      render: (_, __, rowIndex) => (withdrawalPagination.pageNo - 1) * withdrawalPagination.size + rowIndex + 1,
    },
    {
      key: 'requestInfo',
      label: 'Request Info',
      width: "15%",
      render: (_, row) => (
        <div className="flex flex-col space-y-1">
          <span className="font-medium text-sm">#{row._id?.slice(-6) || 'N/A'}</span>
          <span className="text-xs text-gray-500">{new Date(row.createdAt).toLocaleDateString()}</span>
          <span className="text-xs text-gray-500">{new Date(row.createdAt).toLocaleTimeString()}</span>
        </div>
      )
    },
    {
      key: 'seller',
      label: 'Seller',
      width: "15%",
      render: (_, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm">{row?.userId?.userName || row?.userId?.name || 'N/A'}</span>
          <span className="text-xs text-gray-500">{row?.userId?.email || ''}</span>
          <span className="text-xs text-gray-500">ID: {row?.userId?._id?.slice(-6) || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'amounts',
      label: 'Amount Details',
      width: "15%",
      render: (_, row) => {
        const amount = row.amount || 0;
        const feeValue = row.withdrawfee || 0;
        const feeType = row.withdrawfeeType || 'FIXED';
        const calculatedFee = calculateWithdrawalFee(amount, feeValue, feeType);
        const netAmount = amount - calculatedFee;

        return (
          <div className="flex flex-col space-y-1">
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Amount:</span>
              <span className="text-sm font-medium">฿{amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Fee:</span>
              <span className="text-sm text-red-600">
                -฿{calculatedFee.toFixed(2)}
                {feeType === 'PERCENTAGE' && (
                  <span className="text-xs ml-1">({feeValue}%)</span>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Net:</span>
              <span className="text-sm font-bold text-green-600">
                ฿{netAmount.toFixed(2)}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'withdrawalMethod',
      label: 'Method',
      width: "12%",
      render: (_, row) => {
        const method = row?.withDrawMethodId;
        const isPromptPay = method?.PromptPay && method.PromptPay.trim() !== '';
        const isBank = method?.bankName && method?.accountNumber;

        if (isPromptPay) {
          return (
            <div className="flex flex-col">
              <span className="font-medium text-sm text-blue-600 flex items-center">
                <span className="mr-1">{getPromptPayIdType(method.PromptPay).icon}</span>
                {getPromptPayIdType(method.PromptPay).type}
              </span>
              <span className="text-xs text-gray-500">
                {formatPromptPayForDisplay(method.PromptPay)}
              </span>
            </div>
          );
        } else if (isBank) {
          return (
            <div className="flex flex-col">
              <span className="font-medium text-sm text-green-600 flex items-center">
                <span className="mr-1">🏦</span>
                {method.bankName || 'Bank Transfer'}
              </span>
              <span className="text-xs text-gray-500">
                ****{method.accountNumber.slice(-4)}
              </span>
            </div>
          );
        } else {
          return (
            <div className="flex flex-col">
              <span className="font-medium text-sm text-gray-600 flex items-center">
                <span className="mr-1">❓</span>
                Unknown Method
              </span>
              <span className="text-xs text-gray-500">No details</span>
            </div>
          );
        }
      }
    },
    {
      key: 'status',
      label: 'Status',
      width: "10%",
      render: (_, row) => (
        <div className="flex flex-col space-y-1">
          {getWithdrawalStatusBadge(row.status)}
          {row.status === 'pending' && (
            <span className="text-xs text-yellow-600 flex items-center space-x-1">
              <FaClock className="w-3 h-3" />
              <span>Awaiting Review</span>
            </span>
          )}
        </div>
      )
    },
    {
      key: 'Actions',
      label: 'Actions',
      width: "18%",
      render: (_, request) => (
        <div className="flex space-x-1 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWithdrawalDetailModal({ show: true, data: request })}
            className="flex items-center space-x-1 mb-1"
          >
            <FaEye className="w-3 h-3" />
            <span>View</span>
          </Button>

          {request.status === 'pending' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => confirmWithdrawalAction(request, 'Approved')}
                className="flex items-center space-x-1 mb-1 border-green-300 text-green-600 hover:bg-green-50"
              >
                <FaCheck className="w-3 h-3" />
                <span>Approve</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => confirmWithdrawalAction(request, 'Rejected')}
                className="flex items-center space-x-1 mb-1 border-red-300 text-red-600 hover:bg-red-50"
              >
                <FaTimes className="w-3 h-3" />
                <span>Reject</span>
              </Button>
            </>
          )}

          {request.status !== 'pending' && (
            <span className="text-xs text-gray-600 flex items-center space-x-1">
              <MdInfo className="w-3 h-3" />
              <span>Processed</span>
            </span>
          )}
        </div>
      )
    }
  ];

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'transactions') {
      fetchTransactions();
    } else if (activeTab === 'withdrawals') {
      fetchWithdrawalRequests();
    }
  }, [activeTab, pagination.pageNo, pagination.size, withdrawalPagination.pageNo, withdrawalPagination.size]);

  // Calculate withdrawal fee based on type
  const calculateWithdrawalFee = (amount, feeValue, feeType) => {
    if (!amount || !feeValue) return 0;

    if (feeType === 'PERCENTAGE') {
      return (amount * feeValue) / 100;
    } else {
      // FIXED type
      return feeValue;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Management</h1>
          <p className="text-gray-600 mt-1">Manage transactions, payouts, and withdrawal requests</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="primary"
            onClick={() => window.location.href = '/admin/financial-dashboard'}
            className="flex items-center space-x-2"
          >
            <FaChartLine className="w-4 h-4" />
            <span>Financial Analytics</span>
          </Button>
          {/* <Button
            variant="outline"
            onClick={() => activeTab === 'transactions' ? setShowFilters(!showFilters) : setShowWithdrawalFilters(!showWithdrawalFilters)}
            className="flex items-center space-x-2"
          >
            <FaFilter className="w-4 h-4" />
            <span>Filters</span>
          </Button> */}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'transactions'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
          >
            <div className="flex items-center space-x-2">
              <MdPayment className="w-4 h-4" />
              <span>Transactions</span>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {totalRecords}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'withdrawals'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
          >
            <div className="flex items-center space-x-2">
              <FaWallet className="w-4 h-4" />
              <span>Withdrawal Requests</span>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {withdrawalTotalRecords}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Transaction Filters */}
      {activeTab === 'transactions' && showFilters && (
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

      {/* Withdrawal Filters */}
      {activeTab === 'withdrawals' && showWithdrawalFilters && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-lg font-semibold mb-4">Filter Withdrawal Requests</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Amount Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Amount Range</label>
              <div className="flex space-x-2">
                <InputField
                  type="number"
                  name="minAmount"
                  placeholder="Min"
                  value={withdrawalFilters.minAmount}
                  onChange={handleWithdrawalFilterChange}
                  className="flex-1"
                />
                <InputField
                  type="number"
                  name="maxAmount"
                  placeholder="Max"
                  value={withdrawalFilters.maxAmount}
                  onChange={handleWithdrawalFilterChange}
                  className="flex-1"
                />
              </div>
              {withdrawalErrors.amount && <p className="text-xs text-red-500">{withdrawalErrors.amount}</p>}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                name="status"
                value={withdrawalFilters.status}
                onChange={handleWithdrawalFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* User ID */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">User ID</label>
              <InputField
                type="text"
                name="userId"
                placeholder="Enter User ID"
                value={withdrawalFilters.userId}
                onChange={handleWithdrawalFilterChange}
              />
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Date From</label>
              <InputField
                type="date"
                name="dateFrom"
                value={withdrawalFilters.dateFrom}
                onChange={handleWithdrawalFilterChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Date To</label>
              <InputField
                type="date"
                name="dateTo"
                value={withdrawalFilters.dateTo}
                onChange={handleWithdrawalFilterChange}
              />
              {withdrawalErrors.dateRange && <p className="text-xs text-red-500">{withdrawalErrors.dateRange}</p>}
            </div>
          </div>

          <div className="flex space-x-4 mt-4">
            <Button
              variant="primary"
              onClick={applyWithdrawalFilters}
              className="flex items-center space-x-2"
            >
              <FaFilter className="w-4 h-4" />
              <span>Apply Filters</span>
            </Button>
            <Button
              variant="outline"
              onClick={clearWithdrawalFilters}
              className="flex items-center space-x-2"
            >
              <FaCalendar className="w-4 h-4" />
              <span>Clear</span>
            </Button>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Transactions Tab Content */}
        {activeTab === 'transactions' && (
          <>
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
          </>
        )}

        {/* Withdrawal Requests Tab Content */}
        {activeTab === 'withdrawals' && (
          <>
            {withdrawalRequests.length === 0 && !withdrawalLoading && (
              <div className="p-8 text-center text-gray-500">
                <FaWallet className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No withdrawal requests found</h3>
                <p>Try adjusting your filters or check back later.</p>
              </div>
            )}

            {withdrawalRequests.length > 0 && (
              <DataTable
                columns={withdrawalColumns}
                data={withdrawalRequests}
                loading={withdrawalLoading}
                emptyMessage="No withdrawal requests found"
              />
            )}

            {withdrawalTotalRecords > 0 && withdrawalTotalRecords > withdrawalPagination.size && (
              <div className="p-4 bg-[#F9FAFB] border-t">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-700">
                    Showing {((withdrawalPagination.pageNo - 1) * withdrawalPagination.size) + 1} to {Math.min(withdrawalPagination.pageNo * withdrawalPagination.size, withdrawalTotalRecords)} of {withdrawalTotalRecords} requests
                  </p>
                  <Pagination
                    pageNo={withdrawalPagination.pageNo}
                    size={withdrawalPagination.size}
                    total={withdrawalTotalRecords}
                    onChange={handleWithdrawalPageChange}
                  />
                </div>
              </div>
            )}
          </>
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
                  {/* <div>
                    <p className="text-sm text-gray-600">Payout Completed</p>
                    <p className={`font-medium ${calculationModal.data.isPayoutCompleted ? 'text-green-600' : 'text-red-600'}`}>
                      {calculationModal.data.isPayoutCompleted ? 'Yes' : 'No'}
                    </p>
                  </div> */}
                </div>

                {/* Dispute Information (if any) */}
                {calculationModal.data.disputeInfo && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <h3 className="font-semibold text-orange-800 mb-2 flex items-center">
                      <FaExclamationTriangle className="w-4 h-4 mr-2" />
                      Dispute Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Dispute ID:</span>
                        <span className="font-medium">{calculationModal.data.disputeInfo.disputeId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={`font-medium px-2 py-1 rounded text-xs ${calculationModal.data.disputeInfo.status === 'RESOLVED'
                          ? 'bg-green-100 text-green-800'
                          : calculationModal.data.disputeInfo.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                          }`}>
                          {calculationModal.data.disputeInfo.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reason:</span>
                        <span className="font-medium">{calculationModal.data.disputeInfo.disputeReason}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span className="font-medium">
                          {new Date(calculationModal.data.disputeInfo.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {calculationModal.data.disputeInfo.hasResolution && (
                        <>
                          <hr className="border-orange-200 my-2" />
                          <div className="bg-orange-100 p-3 rounded">
                            <h4 className="font-semibold text-orange-900 mb-2">Resolution Details</h4>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span>Decision:</span>
                                <span className={`font-medium px-2 py-1 rounded text-xs ${calculationModal.data.disputeInfo.decision === 'SELLER'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-purple-100 text-purple-800'
                                  }`}>
                                  {calculationModal.data.disputeInfo.decision} FAVOR
                                </span>
                              </div>
                              {calculationModal.data.disputeInfo.disputeAmountPercent > 0 && (
                                <div className="flex justify-between">
                                  <span>Dispute Amount:</span>
                                  <span className="font-medium">{calculationModal.data.disputeInfo.disputeAmountPercent}%</span>
                                </div>
                              )}
                              {calculationModal.data.disputeInfo.decisionNote && (
                                <div className="mt-2">
                                  <span className="font-medium">Note:</span>
                                  <p className="text-gray-700 mt-1">{calculationModal.data.disputeInfo.decisionNote}</p>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span>Resolved:</span>
                                <span className="font-medium">
                                  {new Date(calculationModal.data.disputeInfo.resolvedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Dispute Adjustment Details */}
                {calculationModal.data.disputeAdjustment && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">Payment Adjustment Due to Dispute</h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-blue-700">{calculationModal.data.disputeAdjustment.description}</p>
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Original Amount:</span>
                            <span className="font-medium">฿{calculationModal.data.disputeAdjustment.originalAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Adjusted Amount:</span>
                            <span className="font-medium">฿{calculationModal.data.disputeAdjustment.adjustedAmount.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Seller Receives:</span>
                            <span className="font-medium text-green-600">{calculationModal.data.disputeAdjustment.sellerReceivePercent}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Buyer Refund:</span>
                            <span className="font-medium text-blue-600">{calculationModal.data.disputeAdjustment.buyerRefundPercent}%</span>
                          </div>
                        </div>
                      </div>
                      {calculationModal.data.disputeAdjustment.adjustmentAmount > 0 && (
                        <div className="mt-2 p-2 bg-blue-100 rounded">
                          <div className="flex justify-between">
                            <span className="font-medium">Refund Amount:</span>
                            <span className="font-bold text-blue-800">฿{calculationModal.data.disputeAdjustment.adjustmentAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Payout Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Payout Calculation Breakdown</h3>
                    {calculationModal.data.payoutCalculation?.isEstimated && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                        Estimated
                      </span>
                    )}
                    {!calculationModal.data.payoutCalculation?.isEstimated && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        Processed
                      </span>
                    )}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-3">
                      {/* Show original amount if different from product cost (due to dispute) */}
                      {calculationModal.data.payoutCalculation?.originalProductCost !== calculationModal.data.payoutCalculation?.productCost && (
                        <>
                          <div className="flex justify-between items-center text-gray-600">
                            <span>Original Order Amount:</span>
                            <span className="font-medium">฿{calculationModal.data.payoutCalculation?.originalProductCost?.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Amount After Dispute Adjustment:</span>
                            <span className="font-medium text-blue-600">฿{calculationModal.data.payoutCalculation?.productCost?.toFixed(2)}</span>
                          </div>
                        </>
                      )}

                      {calculationModal.data.payoutCalculation?.originalProductCost === calculationModal.data.payoutCalculation?.productCost && (
                        <div className="flex justify-between items-center">
                          <span>Product Cost:</span>
                          <span className="font-medium">฿{calculationModal.data.payoutCalculation?.productCost?.toFixed(2)}</span>
                        </div>
                      )}

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
                        <span className="text-blue-600">฿{calculationModal.data.payoutCalculation?.netAmount?.toFixed(2)}</span>
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

                      {/* Fee Settings Info */}
                      {calculationModal.data.payoutCalculation?.feeSettings && (
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <details className="text-sm text-gray-600">
                            <summary className="cursor-pointer font-medium hover:text-gray-800">
                              View Fee Settings Details
                            </summary>
                            <div className="mt-2 space-y-1 pl-4">
                              {calculationModal.data.payoutCalculation.feeSettings.serviceCharge && (
                                <div>Service Charge: {calculationModal.data.payoutCalculation.feeSettings.serviceCharge.value}{calculationModal.data.payoutCalculation.feeSettings.serviceCharge.type === 'PERCENTAGE' ? '%' : ' ฿'}</div>
                              )}
                              {calculationModal.data.payoutCalculation.feeSettings.tax && (
                                <div>Tax: {calculationModal.data.payoutCalculation.feeSettings.tax.value}{calculationModal.data.payoutCalculation.feeSettings.tax.type === 'PERCENTAGE' ? '%' : ' ฿'}</div>
                              )}
                              {calculationModal.data.payoutCalculation.feeSettings.withdrawalFee && (
                                <div>Withdrawal Fee: {calculationModal.data.payoutCalculation.feeSettings.withdrawalFee.value}{calculationModal.data.payoutCalculation.feeSettings.withdrawalFee.type === 'PERCENTAGE' ? '%' : ' ฿'}</div>
                              )}
                            </div>
                          </details>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  <div className="space-y-2">
                    <p><strong>Note:</strong> The final payout amount is what the seller will receive after all platform fees and charges.</p>

                    {calculationModal.data.payoutCalculation?.isEstimated && (
                      <p className="text-yellow-700">
                        <strong>Estimated Calculation:</strong> These amounts are estimated based on current fee settings. Actual amounts may vary when payment is processed.
                      </p>
                    )}

                    {!calculationModal.data.payoutCalculation?.isEstimated && (
                      <p className="text-green-700">
                        <strong>Processed Payment:</strong> These amounts reflect the actual processed payment transaction.
                      </p>
                    )}

                    {calculationModal.data.disputeInfo && (
                      <p className="text-orange-700">
                        <strong>Dispute Impact:</strong> This calculation includes adjustments based on the dispute resolution.
                        {calculationModal.data.disputeInfo.status === 'RESOLVED' ? ' The dispute has been resolved.' : ' The dispute is still pending resolution.'}
                      </p>
                    )}

                    {calculationModal.data.payoutCalculation?.hasDispute && !calculationModal.data.payoutCalculation?.isDisputeResolved && (
                      <p className="text-red-700">
                        <strong>Pending Dispute:</strong> This order has an unresolved dispute. Final payout amounts may change based on dispute resolution.
                      </p>
                    )}
                  </div>
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

      {/* Withdrawal Detail Modal */}
      {withdrawalDetailModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Withdrawal Request Details</h2>
              <button
                onClick={() => setWithdrawalDetailModal({ show: false, data: null })}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {withdrawalDetailModal.data && (
              <div className="space-y-6">
                {/* Request Information */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Request ID</p>
                    <p className="font-medium">#{withdrawalDetailModal.data._id?.slice(-8) || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <div className="mt-1">{getWithdrawalStatusBadge(withdrawalDetailModal.data.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Request Date</p>
                    <p className="font-medium">{new Date(withdrawalDetailModal.data.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="font-medium">{new Date(withdrawalDetailModal.data.updatedAt).toLocaleString()}</p>
                  </div>
                </div>

                {/* Seller Information */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Seller Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Name:</span>
                      <span className="font-medium ml-2">{withdrawalDetailModal.data.userId?.userName || withdrawalDetailModal.data.userId?.name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Email:</span>
                      <span className="font-medium ml-2">{withdrawalDetailModal.data.userId?.email || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">User ID:</span>
                      <span className="font-medium ml-2">{withdrawalDetailModal.data.userId?._id || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Amount Breakdown */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Amount Breakdown</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Withdrawal Amount:</span>
                        <span className="font-medium text-green-600">฿{withdrawalDetailModal.data.amount?.toFixed(2) || '0.00'}</span>
                      </div>

                      {(() => {
                        const amount = withdrawalDetailModal.data.amount || 0;
                        const feeValue = withdrawalDetailModal.data.withdrawfee || 0;
                        const feeType = withdrawalDetailModal.data.withdrawfeeType || 'FIXED';
                        const calculatedFee = calculateWithdrawalFee(amount, feeValue, feeType);

                        return (
                          <div className="flex justify-between items-center text-red-600">
                            <span className="flex flex-col">
                              <span>Withdrawal Fee ({feeType}):</span>
                              {feeType === 'PERCENTAGE' && (
                                <span className="text-xs text-gray-500">
                                  {feeValue}% of ฿{amount.toFixed(2)}
                                </span>
                              )}
                              {feeType === 'FIXED' && (
                                <span className="text-xs text-gray-500">
                                  Fixed amount
                                </span>
                              )}
                            </span>
                            <span>-฿{calculatedFee.toFixed(2)}</span>
                          </div>
                        );
                      })()}

                      <hr className="border-gray-300" />

                      {(() => {
                        const amount = withdrawalDetailModal.data.amount || 0;
                        const feeValue = withdrawalDetailModal.data.withdrawfee || 0;
                        const feeType = withdrawalDetailModal.data.withdrawfeeType || 'FIXED';
                        const calculatedFee = calculateWithdrawalFee(amount, feeValue, feeType);
                        const netAmount = amount - calculatedFee;

                        return (
                          <div className="flex justify-between items-center font-bold text-lg text-blue-600">
                            <span>Net Amount to Transfer:</span>
                            <span>฿{netAmount.toFixed(2)}</span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Withdrawal Method */}
                {withdrawalDetailModal.data.withDrawMethodId && (() => {
                  const method = withdrawalDetailModal.data.withDrawMethodId;
                  const isPromptPay = method?.PromptPay && method.PromptPay.trim() !== '';
                  const isBank = method?.bankName && method?.accountNumber;

                  if (isPromptPay) {
                    return (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                          <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs mr-2">P</span>
                          PromptPay Method
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-blue-700">PromptPay ID:</span>
                            <span className="font-medium ml-2">{method.PromptPay}</span>
                          </div>
                          <div>
                            <span className="text-blue-700">ID Type:</span>
                            <span className="font-medium ml-2 flex items-center">
                              <span className="mr-1">{getPromptPayIdType(method.PromptPay).icon}</span>
                              {getPromptPayIdType(method.PromptPay).type}
                            </span>
                          </div>
                          {method.accountHolderName && (
                            <div>
                              <span className="text-blue-700">Account Holder:</span>
                              <span className="font-medium ml-2">{method.accountHolderName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  } else if (isBank) {
                    return (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h3 className="font-semibold text-green-800 mb-2 flex items-center">
                          <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs mr-2">B</span>
                          Bank Transfer Method
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-green-700">Bank Name:</span>
                            <span className="font-medium ml-2">{method.bankName}</span>
                          </div>
                          <div>
                            <span className="text-green-700">Account Number:</span>
                            <span className="font-medium ml-2">{method.accountNumber}</span>
                          </div>
                          <div>
                            <span className="text-green-700">Account Holder:</span>
                            <span className="font-medium ml-2">{method.accountHolderName || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-800 mb-2">Withdrawal Method</h3>
                        <p className="text-gray-600 text-sm">No valid withdrawal method found</p>
                      </div>
                    );
                  }
                })()}

                {/* Notes Section */}
                {withdrawalDetailModal.data.notes && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-2">Notes</h3>
                    <p className="text-yellow-700">{withdrawalDetailModal.data.notes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                {withdrawalDetailModal.data.status === 'pending' && (
                  <div className="flex space-x-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setWithdrawalDetailModal({ show: false, data: null });
                        confirmWithdrawalAction(withdrawalDetailModal.data, 'Approved');
                      }}
                      className="flex-1 border-green-300 text-green-600 hover:bg-green-50"
                    >
                      Approve Request
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setWithdrawalDetailModal({ show: false, data: null });
                        confirmWithdrawalAction(withdrawalDetailModal.data, 'Rejected');
                      }}
                      className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                    >
                      Reject Request
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Withdrawal Action Modal */}
      {withdrawalActionModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {withdrawalActionModal.action === 'Approved' ? 'Approve' : 'Reject'} Withdrawal Request
              </h2>
              <button
                onClick={() => setWithdrawalActionModal({ show: false, data: null, action: '', notes: '' })}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {withdrawalActionModal.data && (
              <div className="space-y-4">
                {/* Request Info */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Seller:</span>
                      <span className="font-medium">{withdrawalActionModal.data.userId?.userName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Amount:</span>
                      <span className="font-medium text-green-600">
                        ฿{withdrawalActionModal.data.amount?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    {(() => {
                      const amount = withdrawalActionModal.data.amount || 0;
                      const feeValue = withdrawalActionModal.data.withdrawfee || 0;
                      const feeType = withdrawalActionModal.data.withdrawfeeType || 'FIXED';
                      const calculatedFee = calculateWithdrawalFee(amount, feeValue, feeType);

                      return (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Fee ({feeType}):
                              {feeType === 'PERCENTAGE' && (
                                <span className="text-xs text-gray-500 block">{feeValue}%</span>
                              )}
                            </span>
                            <span className="font-medium text-red-600">
                              -฿{calculatedFee.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="text-sm text-gray-600 font-medium">Net Transfer:</span>
                            <span className="font-medium text-blue-600">
                              ฿{(amount - calculatedFee).toFixed(2)}
                            </span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Action Warning */}
                <div className={`p-3 rounded-lg ${withdrawalActionModal.action === 'Approved'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                  }`}>
                  <div className={`flex items-center space-x-2 ${withdrawalActionModal.action === 'Approved' ? 'text-green-800' : 'text-red-800'
                    }`}>
                    {withdrawalActionModal.action === 'Approved' ? (
                      <FaCheck className="w-4 h-4" />
                    ) : (
                      <FaTimes className="w-4 h-4" />
                    )}
                    <span className="font-medium">
                      {withdrawalActionModal.action === 'Approved' ? 'Approval Action' : 'Rejection Action'}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${withdrawalActionModal.action === 'Approved' ? 'text-green-700' : 'text-red-700'
                    }`}>
                    {withdrawalActionModal.action === 'Approved'
                      ? 'This action will process the withdrawal and transfer funds to the seller\'s account.'
                      : 'This action will reject the withdrawal request and refund the amount to the seller\'s wallet.'
                    }
                  </p>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Notes (Optional)
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    maxLength="500"
                    placeholder={`Add notes for ${withdrawalActionModal.action.toLowerCase()} this request...`}
                    value={withdrawalActionModal.notes || ''}
                    onChange={(e) => setWithdrawalActionModal(prev => ({ ...prev, notes: e.target.value }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {(withdrawalActionModal.notes || '').length}/500 characters
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <Button
                    variant={withdrawalActionModal.action === 'Approved' ? 'primary' : 'outline'}
                    onClick={() => handleWithdrawalAction(
                      withdrawalActionModal.data._id,
                      withdrawalActionModal.action,
                      withdrawalActionModal.notes
                    )}
                    disabled={withdrawalLoading}
                    className={`flex-1 ${withdrawalActionModal.action === 'Rejected' ? 'border-red-300 text-red-600 hover:bg-red-50' : ''}`}
                  >
                    {withdrawalLoading ? 'Processing...' : `Confirm ${withdrawalActionModal.action}`}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setWithdrawalActionModal({ show: false, data: null, action: '', notes: '' })}
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
    </div>
  );
};

export default AdminTransactions; 