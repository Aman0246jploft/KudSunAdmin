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
import { FaEye, FaMoneyBillWave, FaCalculator } from 'react-icons/fa';
import { MdPayment } from 'react-icons/md';

const AdminTransactions = () => {
  const { theme } = useTheme();

  // State for transactions list
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ pageNo: 1, size: 10 });
  const [totalRecords, setTotalRecords] = useState(0);

  // Filters state
  const [filters, setFilters] = useState({
    minAmount: '',
    maxAmount: '',
    status: '',
    paymentStatus: '',
    sellerId: '',
    buyerId: '',
    dateFrom: '',
    dateTo: '',
    paidToSeller: ''
  });

  // Modal states
  const [payoutModal, setPayoutModal] = useState({ show: false, data: null });
  const [calculationModal, setCalculationModal] = useState({ show: false, data: null });

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


  // Get payout calculation for an order
  const getPayoutCalculation = async (orderId) => {
    console.log(orderId)
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
        setPayoutModal({ show: false, data: null });
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
      paidToSeller: ''
    });
    setErrors({});
    setPagination(prev => ({ ...prev, pageNo: 1 }));
  };

  // Handle page changes
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, pageNo: newPage }));
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

    confirmAlert({
      title: 'Confirm Payment',
      message: `Are you sure you want to mark seller as paid for Order #${transaction.orderNumber}?`,
      buttons: [
        {
          label: 'Yes',
          onClick: () => setPayoutModal({ show: true, data: transaction })
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
      key: 'Buyer',
      label: 'Buyer',
      render: (_, row) => {

        return (
          <div className="flex flex-col">
            <span className="font-medium">{row?.buyer?.name || 'N/A'}</span>
            <span className="text-sm text-gray-500">{row?.buyer?.email || ''}</span>
          </div>
        )
      }
    },
    {
      key: 'Seller',
      label: 'Seller',
      render: (_, row) => {


        return (
          <div className="flex flex-col">
            <span className="font-medium">{row?.seller?.name || 'N/A'}</span>
            <span className="text-sm text-gray-500">{row?.seller?.email || ''}</span>
          </div>
        )
      }
    },
    {
      key: 'Grand Total',
      label: 'Buyer Payment',
      render: (_, payment) => (
        <span className="font-medium">฿{payment?.buyerPayment?.grandTotal?.toFixed(2) || '0.00'}</span>
      )
    },
    {
      key: 'Seller Payout',
      label: 'sellerPayout',
      render: (_, payout) => {
        if (!payout) {
          return (
            <div className="flex flex-col">
              <span className="font-medium text-gray-400">No payout</span>
              <span className="text-sm px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                N/A
              </span>
            </div>
          );
        }

        return (
          <div className="flex flex-col">
            <span className="font-medium">฿{payout?.sellerPayout?.payoutAmount?.toFixed(2) || '0.00'}</span>
            <span className={`text-sm px-2 py-1 rounded-full ${payout?.sellerPayout?.isPaidToSeller
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
              }`}>
              {payout?.sellerPayout?.isPaidToSeller ? 'Paid' : 'Pending'}
            </span>
          </div>
        );
      }
    },
    {
      key: 'Status',
      label: 'Order Status',
      render: (_, status) => (
        // <span className={`px-2 py-1  rounded-full text-sm ${status?.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
        //   status?.status  === 'shipped' ? 'bg-blue-100 text-blue-800' :
        //     status?.status  === 'CONFIRMED' ? 'bg-yellow-100 text-yellow-800' :
        //       'bg-gray-100 text-gray-800'
        //   }`}>
        <span>
          {status?.status}
        </span>
      )
    },
    {
      key: 'Actions',
      label: 'actions',
      render: (_, transaction) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => getPayoutCalculation(transaction.orderId)}
            className="flex items-center space-x-1"
          >
            <FaCalculator className="w-3 h-3" />
            <span>Calculate</span>
          </Button>

          {transaction.sellerPayout && !transaction.sellerPayout.isPaidToSeller && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => confirmMarkAsPaid(transaction)}
              className="flex items-center space-x-1"
            >
              <MdPayment className="w-3 h-3" />
              <span>Mark Paid</span>
            </Button>
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
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
      </div>

      {/* Filters Section */}


      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        {transactions.length === 0 && !loading && (
          <div className="p-8 text-center text-gray-500">
            No transactions found. Try adjusting your filters.
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

        {/* {loading && (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading transactions...</p>
          </div>
        )} */}


        {totalRecords > 0 && totalRecords > pagination.size && (
          <div className=" p-1 bg-[#F9FAFB] border-t">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-700">

              </p>


              <Pagination
                pageNo={pagination.pageNo}
                size={pagination.size}
                total={totalRecords}
                onChange={handlePageChange}
                // theme={theme}
              />

            </div>
          </div>
        )}
      </div>

      {/* Payout Calculation Modal */}
      {calculationModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Payout Calculation</h2>
              <button
                onClick={() => setCalculationModal({ show: false, data: null })}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            {calculationModal.data && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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

                <hr />

                <div className="space-y-3">
                  <h3 className="font-semibold">Payout Breakdown</h3>
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Product Cost:</span>
                        <span>฿{calculationModal.data.payoutCalculation?.productCost?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-red-600">
                        <span>Service Charge:</span>
                        <span>-฿{calculationModal.data.payoutCalculation?.serviceCharge?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-red-600">
                        <span>Tax Charge:</span>
                        <span>-฿{calculationModal.data.payoutCalculation?.taxCharge?.toFixed(2)}</span>
                      </div>
                      <hr />
                      <div className="flex justify-between font-medium">
                        <span>Net Amount:</span>
                        <span>฿{calculationModal.data.payoutCalculation?.netAmount?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-red-600">
                        <span>Withdrawal Fee:</span>
                        <span>-฿{calculationModal.data.payoutCalculation?.withdrawalFee?.toFixed(2)}</span>
                      </div>
                      <hr />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Final Payout:</span>
                        <span className="text-green-600">
                          ฿{calculationModal.data.payoutCalculation?.netAmountAfterWithdrawalFee?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mark as Paid Modal */}
      {payoutModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Mark Seller as Paid</h2>
              <button
                onClick={() => setPayoutModal({ show: false, data: null })}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            {payoutModal.data && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Order Number</p>
                  <p className="font-medium">#{payoutModal.data.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Seller</p>
                  <p className="font-medium">{payoutModal.data.seller?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payout Amount</p>
                  <p className="font-medium text-green-600">
                    ${payoutModal.data.sellerPayout?.payoutAmount?.toFixed(2)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
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

                <div className="flex space-x-4">
                  <Button
                    variant="primary"
                    onClick={() => markSellerAsPaid(payoutModal.data.orderId, payoutModal.notes)}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Confirm Payment'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPayoutModal({ show: false, data: null })}
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