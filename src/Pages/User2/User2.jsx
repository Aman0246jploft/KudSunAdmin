import React, { useState, useEffect } from "react";
import DataTable from "../../Component/Table/DataTable";
import { FiCheckCircle, FiEdit, FiSlash, FiTrash2, FiLock } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { IoEyeOutline } from "react-icons/io5";
import { FaRegEyeSlash } from "react-icons/fa6";
import { IoInformationCircle } from "react-icons/io5";
import {
  adminChangeUserPassword,
  userList as fetchUserList,
  hardDelete,
  softDelete,
  update,
  getSellerRequests,
  sellerVerification,
} from "../../features/slices/userSlice";
import { RiTriangularFlagFill } from "react-icons/ri";
import { useTheme } from "../../contexts/theme/hook/useTheme";
import Pagination from "../../Component/Atoms/Pagination/Pagination";
import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css
import Modal from "./Modal";
import { FaEye } from "react-icons/fa";
import { RiTriangularFlagLine } from "react-icons/ri";
import { toast } from "react-toastify";
import { byUser } from "../../features/slices/settingSlice";
import { useNavigate } from 'react-router-dom';


export default function User2() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pagination, setPagination] = useState({ pageNo: 1, size: 10 });
  const [showSellerRequests, setShowSellerRequests] = useState(true);
  const [showReportedRequests, setshowReportedRequests] = useState(false);
  const [showFlageduser, setshowFlageduser] = useState(false);

  const { userList, loading, error } = useSelector((state) => state.user || {});
  const [newPassword, setNewPassword] = useState("");
  const { users = [], total = 0 } = userList || {};
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [registrationDateStart, setRegistrationDateStart] = useState("");
  const [registrationDateEnd, setRegistrationDateEnd] = useState("");
  const [sortBy, setSortBy] = useState("userName");
  const [sortOrder, setSortOrder] = useState("asc");
  const [userStatusFilter, setUserStatusFilter] = useState(""); // "", "enabled", "disabled"
  const [keyWord, setKeyword] = useState(""); // New keyword state

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [reportsPagination, setReportsPagination] = useState({ pageNo: 1, size: 5 });
  const [reportsTotal, setReportsTotal] = useState(0);
  const [flagLoading, setFlagLoading] = useState(false);

  const [sellerRequestDetails, setSellerRequestDetails] = useState(null);
  const [sellerRequestLoading, setSellerRequestLoading] = useState(false);

  const handleSort = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    fetchData({ sortBy: newSortBy, sortOrder: newSortOrder }); // or trigger query
  };

  useEffect(() => {
    const isDisable = userStatusFilter === "enabled" ? false : userStatusFilter === "disabled" ? true : undefined;

    dispatch(
      fetchUserList({
        ...pagination,
        showSellerRequests: true,
        reported: showReportedRequests,
        isFlagedReported: showFlageduser,
        registrationDateStart,
        registrationDateEnd,
        sortBy,
        sortOrder,
        keyWord, // Add keyword parameter
        ...(isDisable !== undefined && { isDisable }), // only include if defined
      })
    )
      .then((result) => {
        if (!fetchUserList.fulfilled.match(result)) {
          const { message, code } = result.payload || {};
          console.error(`Fetch failed [${code}]: ${message}`);
        }
      })
      .catch((error) => {
        console.error("Unexpected error:", error);
      });
  }, [
    dispatch,
    pagination,
    showSellerRequests,
    registrationDateStart,
    registrationDateEnd,
    sortBy,
    showReportedRequests,
    sortOrder,
    showFlageduser,
    keyWord, // Add keyword to dependency array
  ]);

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, pageNo: newPage }));
  };

  const handleApproveSeller = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };


  const handleChangePassword = () => {
    dispatch(
      adminChangeUserPassword({ userId: selectedUser?._id, newPassword })
    )
      .then((result) => {
        if (!adminChangeUserPassword.fulfilled.match(result)) {
          const { message, code } = result.payload || {};
          console.error(`Password update failed [${code}]: ${message}`);
        } else {
          toast.success("Password Updated");
          setIsModalOpen(false);
          setSelectedUser(null);
        }
      })
      .catch((error) => {
        console.error("Unexpected error:", error);
      })
      .finally(() => {
        // Optional: Reset password input or any loading states here
        setNewPassword("");
      });
  };

  const handleToggleStatus = (user) => {
    dispatch(update({ id: user._id, isDisable: !user?.isDisable }))
      .unwrap()
      .then(() => {
        // Include all parameters when refetching
        const isDisable = userStatusFilter === "enabled" ? false : userStatusFilter === "disabled" ? true : undefined;
        dispatch(fetchUserList({
          ...pagination,
          showSellerRequests,
          reported: showReportedRequests,
          registrationDateStart,
          registrationDateEnd,
          sortBy,
          sortOrder,
          keyWord, // Add keyword parameter
          ...(isDisable !== undefined && { isDisable })
        }));
      })
      .catch((err) => {
        console.error("Failed to toggle user status:", err);
      });
  };

  const handleTogglePreferredSeller = (user) => {
    dispatch(update({ id: user._id, is_Preferred_seller: !user?.is_Preferred_seller }))
      .unwrap()
      .then(() => {
        // Include all parameters when refetching
        const isDisable = userStatusFilter === "enabled" ? false : userStatusFilter === "disabled" ? true : undefined;
        dispatch(fetchUserList({
          ...pagination,
          showSellerRequests,
          reported: showReportedRequests,
          registrationDateStart,
          registrationDateEnd,
          sortBy,
          sortOrder,
          keyWord, // Add keyword parameter
          ...(isDisable !== undefined && { isDisable })
        }));
      })
      .catch((err) => {
        console.error("Failed to toggle preferred seller status:", err);
        toast.error("Failed to update preferred seller status");
      });
  };

  const handleEdit = (user) => {
    setSelectedUser(user); // Set the user to state
    setIsModalOpen(true); // Open the modal
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
            dispatch(softDelete({ id: product._id }))
              .unwrap()
              .then((res) => {
                dispatch(fetchUserList({
                  ...pagination,
                  keyWord, // Add keyword parameter
                }));
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

  const fetchUserReports = async (userId, pageNo = 1, size = 5) => {
    console.log("userIduserId", userId);
    try {
      setReportLoading(true);
      // Include pagination parameters in the API call
      const res = await dispatch(
        byUser({
          userId: userId?._id,
          pageNo,
          size,
        })
      ).unwrap();

      // Set the reports data with pagination info
      setReports(res.data?.reports || []);
      setReportsTotal(res.data?.totalCount || 0);
      setReportsPagination({ pageNo: res.data?.pageNo || 1, size: res.data?.size || 5 });
    } catch (err) {
      toast.error("Failed to fetch reports");
      console.error(err);
    } finally {
      setReportLoading(false);
    }
  };

  const handleReportsPageChange = (newPage) => {
    fetchUserReports(selectedUser, newPage, reportsPagination.size);
  };

  const handleToggleFlagUser = async () => {
    if (!selectedUser?._id) {
      toast.error("No user selected");
      return;
    }

    try {
      setFlagLoading(true);

      const newFlagStatus = !selectedUser?.isFlagedReported;

      const result = await dispatch(update({
        id: selectedUser._id,
        isFlagedReported: newFlagStatus
      }));

      if (update.fulfilled.match(result)) {
        // Update selectedUser state to reflect the change
        setSelectedUser(prev => ({
          ...prev,
          isFlagedReported: newFlagStatus
        }));

        toast.success(`User ${newFlagStatus ? 'flagged' : 'unflagged'} successfully`);

        // Refresh the main user list to reflect changes
        dispatch(fetchUserList({
          ...pagination,
          showSellerRequests,
          reported: showReportedRequests,
          registrationDateStart,
          registrationDateEnd,
          sortBy,
          sortOrder,
          keyWord, // Add keyword parameter
          ...(userStatusFilter === "enabled" ? { isDisable: false } :
            userStatusFilter === "disabled" ? { isDisable: true } : {})
        }));
      } else {
        // Handle API error response
        const { message, code } = result.payload || {};
        console.error(`Flag update failed [${code}]: ${message}`);
        toast.error(message || "Failed to update flag status");
      }
    } catch (err) {
      console.error("Unexpected error while toggling flag status:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setFlagLoading(false);
    }
  };

  // Fetch seller request details when modal opens
  useEffect(() => {
    if (isModalOpen === 'seller-request' && selectedUser?._id) {
      setSellerRequestLoading(true);
      dispatch(getSellerRequests({ userId: selectedUser._id, status: 'Pending', size: 1 }))
        .unwrap()
        .then((res) => {
          setSellerRequestDetails(res?.data?.data?.[0] || null);
        })
        .catch(() => {
          setSellerRequestDetails(null);
        })
        .finally(() => setSellerRequestLoading(false));
    } else if (!isModalOpen) {
      setSellerRequestDetails(null);
    }
  }, [isModalOpen, selectedUser, dispatch]);

  const handleSellerRequestAction = async (status) => {
    if (!sellerRequestDetails?._id) return;
    try {
      await dispatch(sellerVerification({ id: sellerRequestDetails._id, status })).unwrap();
      toast.success(`Seller request ${status === 'Approved' ? 'approved' : 'rejected'} successfully`);
      setIsModalOpen(false);
      setSelectedUser(null);
      setSellerRequestDetails(null);
      dispatch(fetchUserList({
        ...pagination,
        showSellerRequests: true,
        keyWord, // Add keyword parameter
      }));
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const columns = [


    {
      key: "serial",
      label: "S.No",
      width: "1%",
      render: (_, __, rowIndex) =>
        (pagination.pageNo - 1) * pagination.size + rowIndex + 1,
    },
    {
      key: "userName",
      label: "User Name",
      sortable: true, // enables click to sort
      sortKey: "userName",
      render: (value) => (value && value.trim() ? value : "-"),
    },
    { key: "email", label: "Email" },
    { key: "phoneNumber", label: "Phone" },
    {
      key: "gender",
      label: "Gender",
      render: (value) => (value && value.trim() ? value : "-"),
    },

    {
      key: "Location",
      label: "Location",
      render: (_, value) => {
        return `${value?.userAddress?.province?.name} / ${value?.userAddress?.district?.name}` || "-";
      }
    },


    {
      key: "dob",
      label: "DOB",
      render: (value) =>
        value ? new Date(value).toLocaleDateString("en-GB") : "-",
    },

    {
      key: "is_Preferred_seller",
      label: "Preferred Seller",
      width: "7%",
      render: (value, row) => (
        <div className="flex items-center justify-end md:justify-start">
          <input
            type="checkbox"
            checked={row.is_Preferred_seller || false}
            onChange={() => handleTogglePreferredSeller(row)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded   cursor-pointer"
            title={row.is_Preferred_seller ? "Remove from preferred sellers" : "Mark as preferred seller"}
          />
        </div>
      ),
    },

    {
      key: "status",
      label: "Status",
      render: (value, row) => (
        <select
          value={row.isDisable ? "disabled" : "enabled"}
          onChange={(e) => handleToggleStatus(row)}
          className="border rounded px-2 py-1 text-sm focus:outline-none "
          style={{
            // backgroundColor: row.isDisable ? "#f3f4f6" : "#dcfce7",
            color: row.isDisable ? "#4b5563" : "#166534",
            // borderColor: row.isDisable ? "#d1d5db" : "#86efac"
          }}
        >
          <option value="enabled">Active</option>
          <option value="disabled">Inactive</option>
        </select>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      render: (value, row) => {
        const isPendingSeller =
          showSellerRequests && row.sellerVerificationStatus === "Pending";
        const isReported = row?.reportCount > 0;
        return (
          <div className="flex gap-2 justify-end md:justify-start">
            {showSellerRequests ? (
              <>
                <button
                  onClick={() => handleDelete(row)}
                  className="p-1 rounded hover:bg-gray-200"
                  style={{ color: theme.colors.error }}
                  title="Delete"
                >
                  <FiTrash2 size={18} />
                </button>
                <button
                  onClick={() => {
                    setSelectedUser(row);
                    setIsModalOpen(true);
                  }}
                  className="p-1 rounded hover:bg-gray-200"
                  style={{ color: theme.colors.textPrimary }}
                  title="Change Password"
                >
                  <FiLock size={18} />
                </button>
                <button
                  onClick={() => {
                    setSelectedUser(row);
                    setIsModalOpen('seller-request');
                  }}
                  className="p-1 rounded hover:bg-gray-200"
                  style={{ color: theme.colors.textPrimary }}
                  title="View Seller Request"
                >
                  <FaEye size={18} />
                </button>


                <button
                  onClick={() => navigate(`/user/${row?._id}`)}
                  title="Info"
                  className="p-1 rounded hover:bg-gray-200"
                  style={{ color: "black" }}
                >
                  <IoInformationCircle size={18} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setSelectedUser(row);
                    setIsModalOpen(true);
                  }}
                  className="p-1 rounded hover:bg-gray-200"
                  style={{ color: theme.colors.textPrimary }}
                  title="Change Password"
                >
                  <FiLock size={18} />
                </button>
                <button
                  onClick={() => handleDelete(row)}
                  className="p-1 rounded hover:bg-gray-200"
                  style={{ color: theme.colors.error }}
                >
                  <FiTrash2 size={18} />
                </button>
                <button
                  onClick={() => navigate(row?._id)}
                  title="Info"
                  className="p-1 rounded hover:bg-gray-200"
                  style={{ color: "black" }}
                >
                  <IoInformationCircle size={18} />
                </button>

                {showReportedRequests && isReported && (
                  <button
                    onClick={() => {
                      setReportModalOpen(true);
                      setSelectedUser(row);
                      setReportsPagination({ pageNo: 1, size: 5 }); // Reset pagination
                      fetchUserReports(row, 1, 5); // Fetch first page
                    }}
                    className="p-1 rounded hover:bg-gray-200 "
                    // style={{ color: theme.colors.primary }}
                    title="View Reports"
                  >
                    <IoEyeOutline size={18} />
                  </button>
                )}
              </>
            )}
          </div>
        );
      },
    },
  ];

  const rowHeight = 40;
  const headerHeight = 56;
  const minTableHeight = headerHeight + rowHeight * pagination.size;

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
        <div
          className="flex justify-between items-end px-2 py-2"
          style={{ borderBottom: `1px solid ${theme.colors.borderLight}` }}
        >
          <div
            className="font-semibold text-xl"
            style={{ color: theme.colors.textPrimary }}
          >
            Seller Request  List
          </div>

        </div>

        <div className="relative" style={{ minHeight: `${minTableHeight}px` }}>
          {loading ? (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ backgroundColor: theme.colors.backgroundSecondary }}
            >
              <div className="text-center">
                <div
                  className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto"
                  style={{ borderColor: theme.colors.primary }}
                ></div>
                <p
                  className="mt-2"
                  style={{ color: theme.colors.textSecondary }}
                >
                  Loading users...
                </p>
              </div>
            </div>
          )  : (
            <div className="px-1 pt-1">
              <DataTable
                columns={columns}
                data={users}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
            </div>
          )}
        </div>

        <div
          className="py-2 px-2 border-t"
          style={{ borderColor: theme.colors.borderLight }}
        >
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

        <Modal
          isOpen={!!isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedUser(null);
            setNewPassword("");
          }}
        >
          {selectedUser && isModalOpen === true && (
            <div className="p-0 bg-white  rounded-lg shadow-sm border border-gray-200  w-full max-w-md sm:max-w-lg mx-auto flex flex-col max-h-[80vh]">
              {/* Header */}
              <div className="sticky top-0 z-10 bg-white  rounded-t-lg px-4 sm:px-6 pt-4 pb-2 border-b border-gray-200 ">
                <h2 className="text-2xl font-bold text-gray-900 -1">Change Password</h2>
                <p className="text-sm text-gray-600 ">
                  Update password for{' '}
                  <span className="font-medium text-gray-800 ">{selectedUser.userName}</span>
                </p>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
                {/* Password Input Field */}
                <div className="space-y-2">
                  <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 ">New Password</label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2.5 pr-10 border border-gray-300  rounded-lg   focus:border-blue-500 placeholder-gray-400 text-gray-900  transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-gray-400 hover:text-gray-600 -200 transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <IoEyeOutline size={20} /> : <FaRegEyeSlash size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Sticky Footer (Actions) */}
              <div className="sticky bottom-0 z-10 bg-white  rounded-b-lg px-4 sm:px-6 py-3 border-t border-gray-200  flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handleChangePassword()}
                  className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700   focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!newPassword.trim()}
                >
                  Change Password
                </button>
              </div>
            </div>
          )}



          {selectedUser && isModalOpen === 'seller-request' && (
            <div className="p-0 bg-white  rounded-lg shadow-sm border border-gray-200  w-full max-w-md sm:max-w-lg mx-auto flex flex-col max-h-[80vh]">
              {/* Header */}
              <div className="sticky top-0 z-10 bg-white  rounded-t-lg px-4 sm:px-6 pt-4 pb-2 border-b border-gray-200 ">
                <h2 className="text-2xl font-bold text-gray-900 -1">Seller Request Details</h2>
                <p className="text-sm text-gray-600 ">
                  Request for: <span className="font-medium text-gray-800 ">{selectedUser.userName}</span>
                </p>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
                {sellerRequestLoading ? (
                  <div className="text-center py-4">Loading seller request...</div>
                ) : sellerRequestDetails ? (
                  <div className="mb-4 space-y-2">
                    <p><span className="font-medium">Legal Name:</span> {sellerRequestDetails.legalFullName || '-'}</p>
                    <p><span className="font-medium">ID Number:</span> {sellerRequestDetails.idNumber || '-'}</p>
                    <p><span className="font-medium">Payment Payout Method:</span> {sellerRequestDetails.paymentPayoutMethod || '-'}</p>

                    {/* Conditional payout info */}
                    {sellerRequestDetails.paymentPayoutMethod === 'BankTransfer' && sellerRequestDetails.bankDetails ? (
                      <div className="pl-2 space-y-1">
                        <p><span className="font-medium">Bank Name:</span> {sellerRequestDetails.bankDetails.bankName || '-'}</p>
                        <p><span className="font-medium">Account Number:</span> {sellerRequestDetails.bankDetails.accountNumber || '-'}</p>
                        <p><span className="font-medium">Account Holder Name:</span> {sellerRequestDetails.bankDetails.accountHolderName || '-'}</p>
                        <p><span className="font-medium">Bank Book Image:</span> {sellerRequestDetails.bankDetails.bankBookUrl ? (
                          <a href={sellerRequestDetails.bankDetails.bankBookUrl} target="_blank" rel="noopener noreferrer">
                            <img
                              src={sellerRequestDetails.bankDetails.bankBookUrl}
                              alt="Bank Book"
                              className="max-w-full h-auto w-24 sm:w-32 object-cover border rounded mt-1 inline-block hover:shadow-lg cursor-pointer"
                            />
                          </a>
                        ) : ('-')}
                        </p>
                      </div>
                    ) : sellerRequestDetails.paymentPayoutMethod === 'PromptPay' ? (
                      <p><span className="font-medium">PromptPay ID:</span> {sellerRequestDetails.promptPayId || '-'}</p>
                    ) : null}

                    <p><span className="font-medium">Verification Status:</span> {sellerRequestDetails.verificationStatus || '-'}</p>
                    <p><span className="font-medium">Created At:</span> {sellerRequestDetails.createdAt ? new Date(sellerRequestDetails.createdAt).toLocaleString() : '-'}</p>
                    <p><span className="font-medium">Updated At:</span> {sellerRequestDetails.updatedAt ? new Date(sellerRequestDetails.updatedAt).toLocaleString() : '-'}</p>

                    {/* User Info */}
                    <div className="pt-2">
                      <h3 className="font-semibold text-gray-800 ">User Info</h3>
                      <p><span className="font-medium">User ID:</span> {sellerRequestDetails.userId?._id || '-'}</p>
                      <p><span className="font-medium">Email:</span> {sellerRequestDetails.userId?.email || '-'}</p>
                      <p><span className="font-medium">Phone:</span> {selectedUser.phoneNumber || '-'}</p>
                    </div>

                    {/* Images */}
                    <div className="pt-2">
                      <h3 className="font-semibold text-gray-800 ">Documents</h3>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div>
                          <span className="font-medium">ID Document Front:</span>{' '}
                          {sellerRequestDetails.idDocumentFrontUrl ? (
                            <a href={sellerRequestDetails.idDocumentFrontUrl} target="_blank" rel="noopener noreferrer">
                              <img
                                src={sellerRequestDetails.idDocumentFrontUrl}
                                alt="ID Document Front"
                                className="max-w-full h-auto w-24 sm:w-32 object-cover border rounded mt-1 inline-block hover:shadow-lg cursor-pointer"
                              />
                            </a>
                          ) : ('-')}
                        </div>
                        <div>
                          <span className="font-medium">Selfie With ID:</span>{' '}
                          {sellerRequestDetails.selfieWithIdUrl ? (
                            <a href={sellerRequestDetails.selfieWithIdUrl} target="_blank" rel="noopener noreferrer">
                              <img
                                src={sellerRequestDetails.selfieWithIdUrl}
                                alt="Selfie With ID"
                                className="max-w-full h-auto w-24 sm:w-32 object-cover border rounded mt-1 inline-block hover:shadow-lg cursor-pointer"
                              />
                            </a>
                          ) : ('-')}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-red-500">No seller request found.</div>
                )}
              </div>

              {/* Sticky Footer (Actions) */}
              <div className="sticky bottom-0 z-10 bg-white  rounded-b-lg px-4 sm:px-6 py-3 border-t border-gray-200  flex flex-col sm:flex-row gap-2">
                <button
                  className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-green-700  focus:ring-green-500 focus:ring-offset-2 transition-colors"
                  onClick={() => handleSellerRequestAction('Approved')}
                  disabled={sellerRequestLoading || !sellerRequestDetails}
                >
                  Accept
                </button>
                <button
                  className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-red-700  focus:ring-red-500 focus:ring-offset-2 transition-colors"
                  onClick={() => handleSellerRequestAction('Rejected')}
                  disabled={sellerRequestLoading || !sellerRequestDetails}
                >
                  Reject
                </button>
              </div>
            </div>
          )}


        </Modal>

        {/* Updated Reports Modal */}
        {reportModalOpen && (
          <Modal
            isOpen={reportModalOpen}
            onClose={() => {
              setReportModalOpen(false);
              setSelectedUser(null);
              setReports([]);
              setReportsTotal(0);
              setReportsPagination({ pageNo: 1, size: 5 });
            }}
          >
            <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 max-w-4xl mx-auto max-h-[80vh] overflow-y-auto">
              <div className="mb-4 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    Users Who Reported: {selectedUser?.userName}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Total Reports: {reportsTotal}
                  </p>
                </div>
                <button
                  onClick={handleToggleFlagUser}
                  disabled={flagLoading}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed `}
                >
                  {flagLoading ? 'Updating...' : selectedUser?.isFlagedReported ? <RiTriangularFlagFill className=" text-red-500" /> : <RiTriangularFlagLine />}
                </button>
              </div>

              {reportLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p className="ml-2">Loading reports...</p>
                </div>
              ) : reports.length > 0 ? (
                <>
                  <div className="space-y-4 mb-4">
                    {reports.map((report, index) => (
                      <div key={report._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">
                                {((reportsPagination.pageNo - 1) * reportsPagination.size + index + 1)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                Reporter ID: {report.reportedBy._id}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(report.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${report.isDisable
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                            }`}>
                            {report.isDisable ? 'Disabled' : 'Active'}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <span className="font-medium text-gray-700">Title:</span>
                            <p className="text-gray-900">{report.title}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Description:</span>
                            <p className="text-gray-900">{report.description}</p>
                          </div>
                          {report.image && report.image.length > 0 && (
                            <div>
                              <span className="font-medium text-gray-700">Images:</span>
                              <div className="flex gap-2 mt-1">
                                {report.image.map((img, imgIndex) => (
                                  <img
                                    key={imgIndex}
                                    src={img}
                                    alt={`Report evidence ${imgIndex + 1}`}
                                    className="w-16 h-16 object-cover rounded border"
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination for Reports */}
                  {reportsTotal > reportsPagination.size && (
                    <div className="flex justify-center mt-4 pt-4 border-t border-gray-200">
                      <Pagination
                        pageNo={reportsPagination.pageNo}
                        size={reportsPagination.size}
                        total={reportsTotal}
                        onChange={handleReportsPageChange}
                        theme={theme}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No reports found for this user.</p>
                </div>
              )}
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}