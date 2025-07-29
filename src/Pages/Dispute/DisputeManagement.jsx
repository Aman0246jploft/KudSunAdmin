import React, { useState, useEffect } from 'react';

import DataTable from '../../Component/Table/DataTable';
import Button from '../../Component/Atoms/Button/Button';

import DisputeModal from './DisputeModal';
import Loader from '../../Component/Common/Loader';
import authAxiosClient from '../../api/authAxiosClient';
import { toast } from 'react-toastify';
import { FaEye } from 'react-icons/fa6';


const DisputeManagement = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({
    pageNo: 1,
    size: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    disputeType: '',
    q: ''
  });



  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        ...filters,
        pageNo: pagination.pageNo,
        size: pagination.size
      });

      const response = await authAxiosClient.get(`/dispute/adminListAll?${queryParams}`);

      setDisputes(response.data.data.disputes);
      setPagination(prev => ({
        ...prev,
        total: response.data.data.total
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch disputes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, [pagination.pageNo, pagination.size, filters]);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, pageNo: newPage }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, pageNo: 1 })); // Reset to first page on filter change
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, pageNo: 1 }));
  };

  const handleViewDispute = (dispute) => {
    setSelectedDispute(dispute);
    setShowModal(true);
  };


  // Prepare disputes with serial number and fallback-safe fields
  const mappedDisputes = disputes?.map((item, index) => {

    return {
      // ...item,
      serial: (pagination.pageNo - 1) * pagination.size + index + 1,
      disputeId: item?.disputeId || '-',
      orderId: item?.orderId?.orderId || '-',
      buyer: item?.raisedBy?.userName || '-',
      seller: item?.sellerId?.userName || '-',
      type: item?.disputeType?.toLowerCase().replace(/_/g, ' ') || '-',
      amount: item?.orderId?.grandTotal?.toFixed(2) || '-',
      status: item?.status || '-',
      created: item?.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-',
      // statusBadge: item?.status || '-',
      all: item
    };
  });



  const columns = [
    { key: "serial", label: "S.No", width: "10%" },
    {
      key: 'disputeId',
      label: 'Dispute ID',
      width: "15%"
    },
    {
      key: 'orderId',
      label: 'orderIdText',
      width: "15%",

    },
    {
      key: 'buyer',
      label: 'Buyer',
      width: "15%",
    },
    {
      key: 'seller',
      label: 'Seller',
      width: "15%",
    },
    {
      key: 'type',
      label: 'Type',
      width: "15%",

    },
    {
      key: 'amount',
      label: 'Amount',
      width: "10%",
    },
    {
      key: 'status',
      label: 'Status',
      width: "15%",
    },
    {
      key: 'created',
      label: 'Created',
      width: "15%",
    },
    {
      key: 'Action',
      label: 'Action',
      width: "15%",
      render: (value, row, rowIndex) => {
        return (
          <div className="flex md:justify-start justify-end gap-2">
            <button
              onClick={() => handleViewDispute(row?.all)}
              className="p-1 rounded hover:bg-gray-200"
              title="View Dispute"
            >
              <FaEye size={18} />
            </button>
          </div>
        );
      },
    },

  ];



  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Dispute Management</h1>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="border rounded px-3 py-2 w-full sm:w-auto"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <input
              type="text"
              name="q"
              value={filters.q}
              onChange={handleFilterChange}
              placeholder="Search disputes..."
              className="border rounded px-3 py-2 w-full sm:w-auto"
            />
            <Button type="submit" variant="secondary" className="w-full sm:w-auto">
              Search
            </Button>
          </form>
        </div>

      </div>

      {loading ? (
        <Loader />
      ) : (
        <DataTable
          columns={columns}
          data={mappedDisputes || []}
        />
      )}

      {showModal && (
        <DisputeModal
          dispute={selectedDispute}
          onClose={() => {
            setShowModal(false);
            setSelectedDispute(null);
          }}
          onUpdate={fetchDisputes}
        />
      )}
    </div>
  );
};

export default DisputeManagement; 