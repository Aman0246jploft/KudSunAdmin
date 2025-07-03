import React, { useState, useEffect } from "react";
import DataTable from "../../Component/Table/DataTable";
import { FiCheckCircle, FiEdit, FiSlash, FiTrash2 } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { IoEyeOutline } from "react-icons/io5";
import { FaRegEyeSlash } from "react-icons/fa6";
import {
  adminChangeUserPassword,
  userList as fetchUserList,
  hardDelete,
  softDelete,
  update,
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

export default function User() {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pagination, setPagination] = useState({ pageNo: 1, size: 10 });
  const [showSellerRequests, setShowSellerRequests] = useState(false);
  const [showReportedRequests, setshowReportedRequests] = useState(false);
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

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [reportsPagination, setReportsPagination] = useState({ pageNo: 1, size: 5 });
  const [reportsTotal, setReportsTotal] = useState(0);
  const [flagLoading, setFlagLoading] = useState(false);

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
        showSellerRequests,
        reported: showReportedRequests,
        registrationDateStart,
        registrationDateEnd,
        sortBy,
        sortOrder,
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
  ]);

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, pageNo: newPage }));
  };

  const handleApproveSeller = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  console.log("reportsreports", reports);

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
    dispatch(update({ id: user._id, isDisable: !user?.isDisable })) // Rename this action if it's misleading (e.g. it's toggling, not deleting)
      .unwrap()
      .then(() => {
        dispatch(fetchUserList(pagination)); // Fetch updated user list
      })
      .catch((err) => {
        console.error("Failed to toggle user status:", err);
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
                dispatch(fetchUserList(pagination));
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

  const columns = [
    {
      key: "serial",
      label: "S.No",
      width: "10%",
      render: (_, __, rowIndex) =>
        (pagination.pageNo - 1) * pagination.size + rowIndex + 1,
    },
    {
      key: "userName",
      label: "User Name",
      sortable: true, // enables click to sort
      sortKey: "userName",
    },
    { key: "email", label: "Email" },
    { key: "phoneNumber", label: "Phone" },
    { key: "gender", label: "Gender" },
    // {
    //   key: "userAddress",
    //   label: "Location",
    //   sortable: true,
    //   sortKey: "userAddress.city", // backend expects this
    //   render: (value) => {
    //     if (!value) return "-";
    //     const { city, state, country } = value;
    //     return [city, state, country].filter(Boolean).join(", ");
    //   },
    // },

    {
      key: "dob",
      label: "DOB",
      render: (value) =>
        value ? new Date(value).toLocaleDateString("en-GB") : "-",
    },

    {
      key: "status",
      label: "Status",
      render: (value, row) => (
        <button
          onClick={() => handleToggleStatus(row)}
          className="p-1 rounded hover:bg-gray-200"
          title={row.isDisable ? "Enable User" : "Disable User"}
          style={{ color: row.isDisable ? "gray" : "green" }}
        >
          {!row.isDisable ? (
            <FiCheckCircle color="green" size={18} />
          ) : (
            <FiSlash color="gray" size={18} />
          )}
        </button>
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
          <div className="flex gap-2">
            {isPendingSeller ? (
              <>
                <button
                  onClick={() => {
                    setIsModalOpen(true);
                    setSelectedUser(row);
                  }}
                  className="p-1 rounded hover:bg-gray-200 "
                  style={{ color: theme.colors.textPrimary }}
                >
                  <FaEye size={18} />
                </button>

                {/* <button
                  className="px-2 py-1 rounded bg-green-500 text-white hover:bg-green-600 text-sm"
                  onClick={() => handleApproveSeller(row)}
                >
                  Approve
                </button>
                <button
                  className="px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-sm"
                  onClick={() => handleRejectSeller(row)}
                >
                  Reject
                </button> */}
              </>
            ) : (
              <>
                <button
                  onClick={() => handleEdit(row)}
                  className="p-1 rounded hover:bg-gray-200"
                  style={{ color: theme.colors.textPrimary }}
                >
                  <FiEdit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(row)}
                  className="p-1 rounded hover:bg-gray-200"
                  style={{ color: theme.colors.error }}
                >
                  <FiTrash2 size={18} />
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
            User List
          </div>
          <div className="flex flex-wrap  justify-end items-end gap-3">
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showSellerRequests}
                onChange={(e) => {
                  setShowSellerRequests(e.target.checked);
                  setPagination((prev) => ({ ...prev, pageNo: 1 }));
                }}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">
                Seller Request
              </span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showReportedRequests}
                onChange={(e) => {
                  setshowReportedRequests(e.target.checked);
                  setPagination((prev) => ({ ...prev, pageNo: 1 }));
                }}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">
                Reported User
              </span>
            </label>

            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-gray-700 select-none">
                User Status:
              </label>
              <select
                value={userStatusFilter}
                onChange={(e) => {
                  setUserStatusFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, pageNo: 1 })); // Reset to page 1
                }}
                className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ minWidth: "140px" }}
              >
                <option value="">All</option>
                <option value="enabled">Enabled Users</option>
                <option value="disabled">Disabled Users</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="reg-start"
                className="mb-1 text-sm font-medium text-gray-700 select-none"
              >
                Registration Start:
              </label>
              <input
                id="reg-start"
                type="date"
                value={registrationDateStart}
                onChange={(e) => setRegistrationDateStart(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ minWidth: "140px" }}
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="reg-end"
                className="mb-1 text-sm font-medium text-gray-700 select-none"
              >
                Registration End:
              </label>
              <input
                id="reg-end"
                type="date"
                value={registrationDateEnd}
                onChange={(e) => setRegistrationDateEnd(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ minWidth: "140px" }}
              />
            </div>
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
          ) : error ? (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ backgroundColor: theme.colors.backgroundSecondary }}
            >
              <div
                className="text-center font-semibold"
                style={{ color: theme.colors.error }}
              >
                Error: {error}
              </div>
            </div>
          ) : (
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
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedUser(null);
            setNewPassword("");
          }}
        >
          {selectedUser && (
            <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 max-w-md mx-auto">
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Change Password
                </h2>
                <p className="text-sm text-gray-600">
                  Update password for{" "}
                  <span className="font-medium text-gray-800">
                    {selectedUser.userName}
                  </span>
                </p>
              </div>

              {/* Form */}
              <div className="space-y-4">
                {/* Password Input Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="new-password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg 
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                     placeholder-gray-400 text-gray-900 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center justify-center w-10 
                     text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <IoEyeOutline size={20} />
                      ) : (
                        <FaRegEyeSlash size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleChangePassword()}
                    className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium
                   hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!newPassword.trim()}
                  >
                    Change Password
                  </button>
                </div>
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