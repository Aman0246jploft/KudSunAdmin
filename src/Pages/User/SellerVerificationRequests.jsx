import React, { useState, useEffect } from "react";
import DataTable from "../../Component/Table/DataTable";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../../contexts/theme/hook/useTheme";
import Pagination from "../../Component/Atoms/Pagination/Pagination";
import { toast } from "react-toastify";
import authAxiosClient from "../../api/authAxiosClient";
import SellerVerification from "./SellerVerification";
import Modal from "./Modal";

export default function SellerVerificationRequests() {
  const { theme } = useTheme();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ pageNo: 1, size: 10 });
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    keyWord: "",
    status: "",
    fromDate: "",
    toDate: "",
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch seller verification requests
  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        ...pagination,
        keyWord: filters.keyWord,
        searchFields: filters.keyWord && filters.keyWord !== "" ? 'userName' : "",
        "query": `verificationStatus:${filters.status || ""},isDeleted:false`,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        populate: "userId|userName email phoneNumber",
      };
      if (filters.status == "") {
        delete params.query
      }
      // if(filters.status )
      const res = await authAxiosClient.get("/sellerVerification/getList", { params });
      setRequests(res.data.data?.data || []);
      setTotal(res.data.data?.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch requests");
      toast.error(err.response?.data?.message || err.message || "Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line
  }, [pagination, filters]);

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, pageNo: newPage }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, pageNo: 1 }));
  };

  const handleView = (request) => {
    setSelectedRequest(request);
    setModalOpen(true);
  };

  // const handleStatusChange = async (request, status) => {
  //   try {
  //     setLoading(true);
  //     await authAxiosClient.post("/sellerVerification/changeVerificationStatus", {
  //       id: request._id,
  //       status,
  //     });
  //     toast.success(`Request ${status.toLowerCase()} successfully`);
  //     fetchRequests();
  //   } catch (err) {
  //     toast.error(err.response?.data?.message || err.message || "Failed to update status");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleStatusChange = async (request, status) => {
    const confirmed = window.confirm(`Are you sure you want to ${status.toLowerCase()} this request?`);
    if (!confirmed) return;

    try {
      setLoading(true);
      await authAxiosClient.post("/sellerVerification/changeVerificationStatus", {
        id: request._id,
        status,
      });
      toast.success(`Request ${status.toLowerCase()} successfully`);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: "serial",
      label: "S.No",
      width: "8%",
      render: (_, __, rowIndex) => (pagination.pageNo - 1) * pagination.size + rowIndex + 1,
    },
    {
      key: "userId",
      label: "User Name",
      render: (value, row) => value?.userName || "-",
    },
    {
      key: "userId",
      label: "Email",
      render: (value) => value?.email || "-",
    },
    {
      key: "userId",
      label: "Phone",
      render: (value) => value?.phoneNumber || "-",
    },
    {
      key: "legalFullName",
      label: "Legal Name",
    },
    {
      key: "idNumber",
      label: "ID Number",
    },
    {
      key: "paymentPayoutMethod",
      label: "Payout Method",
    },
    {
      key: "verificationStatus",
      label: "Status",
      render: (value) => value || "-",
    },
    {
      key: "actions",
      label: "Actions",
      render: (value, row) => (
        <div className="flex gap-2 justify-end md:justify-start">
          <button
            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => handleView(row)}
          >
            View
          </button>
          {row.verificationStatus === "Pending" && (
            <>
              <button
                className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={() => handleStatusChange(row, "Approved")}
              >
                Approve
              </button>
              <button
                className="px-2 py-1 bg-red-500 text-white rounded text-red-500 hover:bg-red-600"
                onClick={() => handleStatusChange(row, "Rejected")}
              >
                Reject
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

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
        <div className="flex justify-between items-end px-2 py-2" style={{ borderBottom: `1px solid ${theme.colors.borderLight}` }}>
          <div className="font-semibold text-xl" style={{ color: theme.colors.textPrimary }}>
            Seller Verification Requests
          </div>
          <div className="flex flex-wrap gap-3 items-end">
            {/* <input
              type="text"
              name="keyWord"
              value={filters.keyWord}
              onChange={handleFilterChange}
              placeholder="Search by name, email, etc."
              className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ minWidth: "180px" }}
            /> */}
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ minWidth: "140px" }}
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <input
              type="date"
              name="fromDate"
              value={filters.fromDate}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ minWidth: "140px" }}
            />
            <input
              type="date"
              name="toDate"
              value={filters.toDate}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ minWidth: "140px" }}
            />
          </div>
        </div>
        <div className="relative" style={{ minHeight: "400px" }}>
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: theme.colors.backgroundSecondary }}>
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: theme.colors.primary }}></div>
                <p className="mt-2" style={{ color: theme.colors.textSecondary }}>
                  Loading requests...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: theme.colors.backgroundSecondary }}>
              <div className="text-center font-semibold" style={{ color: theme.colors.error }}>
                Error: {error}
              </div>
            </div>
          ) : (
            <div className="px-1 pt-1">
              <DataTable columns={columns} data={requests} />
            </div>
          )}
        </div>
        <div className="py-2 px-2 border-t" style={{ borderColor: theme.colors.borderLight }}>
          <div className="flex justify-end">
            <Pagination
              pageNo={pagination.pageNo}
              size={pagination.size}
              total={total}
              onChange={handlePageChange}
              theme={theme}
            />
          </div>
        </div>
        {modalOpen && (
          <Modal
            isOpen={modalOpen}
            onClose={() => {
              setModalOpen(false);
              setSelectedRequest(null);
            }}
          >

            <SellerVerification
              onClose={() => {
                setModalOpen(false);
                setSelectedRequest(null);
              }}
              data={{ sellerVerification: [selectedRequest] }}
              onActionComplete={fetchRequests}
            />
          </Modal>
        )}
      </div>
    </div>
  );
} 