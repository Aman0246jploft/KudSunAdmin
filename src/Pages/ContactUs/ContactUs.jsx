import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { contactUsList, markAsreadContactUs, sendContactUsReply } from "../../features/slices/settingSlice";
import Pagination from "../../Component/Atoms/Pagination/Pagination";
import DataTable from "../../Component/Table/DataTable";
import { useTheme } from "../../contexts/theme/hook/useTheme";
import { FiTrash2, FiCheckCircle, FiSlash, FiSearch, FiFilter, FiX } from "react-icons/fi";
import Modal from "./Modal";
import Button from '../../Component/Atoms/Button/Button'
import AdvancedRichTextEditor from "../../Component/RichTextEditor/AdvancedRichTextEditor";

export default function ContactUs() {
  const dispatch = useDispatch();
  const { theme } = useTheme();

  const [pagination, setPagination] = useState({ pageNo: 1, size: 10 });
  const [faqs, setFaqs] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [replyData, setReplyData] = useState({
    subject: "",
    body: "",
    to: ""
  });

  // Search and Filter State
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "" = all, "true" = resolved, "false" = unresolved
  const [dateRange, setDateRange] = useState({
    fromDate: "",
    toDate: ""
  });
  const [showFilters, setShowFilters] = useState(false);

  const selector = useSelector((state) => state?.setting);
  const { error, loading, contactUs } = selector || {};
  const { data, total } = contactUs ? contactUs : {};

  // Build query parameters for API call
  const buildQueryParams = () => {
    const params = {
      pageNo: pagination.pageNo,
      size: pagination.size,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };

    // Add search functionality
    if (searchKeyword.trim()) {
      params.keyWord = searchKeyword.trim();
      params.searchFields = 'name,contact,type'; // Search in name, contact (email/phone), and type fields
    }

    // Add status filter
    if (statusFilter !== "") {
      params.query = `isRead:${statusFilter}`;
    }

    // Add date range filter
    if (dateRange.fromDate) {
      params.fromDate = dateRange.fromDate;
    }
    if (dateRange.toDate) {
      params.toDate = dateRange.toDate;
    }

    return params;
  };

  const fetchContactUs = () => {
    const queryParams = buildQueryParams();
    dispatch(contactUsList(queryParams))
      .unwrap()
      .then((faqResult) => {
        setFaqs(faqResult.data || []);
      })
      .catch((error) => {
        console.error("Unexpected error in fetchData:", error);
        toast.error("Unexpected error occurred");
      });
  };

  useEffect(() => {
    fetchContactUs();
  }, [dispatch, pagination, searchKeyword, statusFilter, dateRange]);

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, pageNo: newPage }));
  };

  // Reset pagination when filters change
  const handleSearchChange = (value) => {
    setSearchKeyword(value);
    setPagination(prev => ({ ...prev, pageNo: 1 }));
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setPagination(prev => ({ ...prev, pageNo: 1 }));
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, pageNo: 1 }));
  };

  const clearFilters = () => {
    setSearchKeyword("");
    setStatusFilter("");
    setDateRange({ fromDate: "", toDate: "" });
    setPagination(prev => ({ ...prev, pageNo: 1 }));
  };

  const hasActiveFilters = searchKeyword || statusFilter !== "" || dateRange.fromDate || dateRange.toDate;

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const openDetailModal = (faq) => {
    setSelectedFaq(faq);
    setIsModalOpen(true);
  };

  const openReplyModal = (faq) => {
    setSelectedFaq(faq);
    setReplyData({
      subject: `Re: ${faq.type} Inquiry`,
      body: "",
      to: faq.contact
    });
    setIsReplyModalOpen(true);
  };

  const handleReplySubmit = async () => {
    if (!replyData.subject.trim() || !replyData.body.trim()) {
      toast.error("Subject and message are required");
      return;
    }
    setIsSending(true);

    try {
      const payload = {
        contactUsId: selectedFaq._id,
        subject: replyData.subject.trim(),
        body: replyData.body.trim()
      };

      await dispatch(sendContactUsReply(payload)).unwrap();
      toast.success("Reply sent successfully!");
      setIsReplyModalOpen(false);

      // Refresh the contact us list to update the status
      fetchContactUs();
    } catch (error) {
      console.error("Failed to send reply:", error);
      toast.error("Failed to send reply. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleToggleRead = async (id, currentStatus) => {
    try {
      dispatch(markAsreadContactUs({ id, isRead: !currentStatus })).unwrap()
      fetchContactUs();
    } catch (err) {
      console.error("Failed to toggle read status", err);
    }
  };

  const columns = [
    {
      key: "serial",
      label: "S.No",
      width: "5%",
      render: (_, __, rowIndex) =>
        (pagination.pageNo - 1) * pagination.size + rowIndex + 1,
    },
    {
      key: "name",
      label: "Name",
      width: "15%",
      render: (_, row) => (
        <div className="justify-end md:justify-start" title={row.name}>
          {row.name}
        </div>
      ),
    },
    {
      key: "contact",
      label: "Contact",
      width: "15%",
      render: (_, row) => (
        <div className="justify-end md:justify-start" title={row.contact}>
          {row.contact}
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      width: "10%",
      render: (_, row) => (
        <div className="justify-end md:justify-start" title={row.type}>
          {row.type}
        </div>
      ),
    },
    {
      key: "desc",
      label: "Description",
      width: "25%",
      render: (_, row) => (
        <div className="">
          {row.desc || "N/A"}
        </div>
      ),
    },
    {
      key: "media",
      label: "Media",
      disableTooltip: true,
      width: "20%",
      render: (_, row) =>
        row.image && row.image.length > 0 ? (
          <div className="justify-end md:justify-start">
            {row.image.slice(0, 2).map((url, index) => {
              const isVideo = url.match(/\.(mp4|webm|ogg)$/i);
              return (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="justify-end md:justify-start"
                >
                  {isVideo ? (
                    <video
                      src={url}
                      className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded border"
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={url}
                      alt="media"
                      className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded border"
                    />
                  )}
                </a>
              );
            })}
            {row.image.length > 2 && (
              <span className="justify-end md:justify-start">+{row.image.length - 2} more</span>
            )}
          </div>
        ) : (
          <span className="text-xs sm:text-sm">No Media</span>
        ),
    },
    {
      key: "view",
      label: "Actions",
      width: "15%",
      render: (_, row) => (
        <div className="justify-end md:justify-start">
          <button
            onClick={() => openDetailModal(row)}
            className="text-blue-600 hover:underline text-xs sm:text-sm px-1"
          >
            View
          </button>
          {isValidEmail(row.contact) && (
            <button
              onClick={() => openReplyModal(row)}
              className="text-green-600 hover:underline text-xs sm:text-sm px-1"
              disabled={!isValidEmail(row.contact)}
              title={!isValidEmail(row.contact) ? "Invalid email address" : ""}
            >
              Reply
            </button>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      width: "10%",
      render: (_, row) => (
        <div className="text-xs sm:text-sm">
          {new Date(row.createdAt).toLocaleDateString("en-IN")}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: "25%",
      render: (_, row) => (
        <div className="justify-end md:justify-start">
          <select
            value={row.isRead ? "connected" : "notconnected"}
            onChange={() => handleToggleRead(row._id, row.isRead)}
            className="border rounded px-1 sm:px-2 py-1 text-xs sm:text-sm focus:outline-none w-full max-w-[100px] sm:max-w-none"
            style={{
              color: row.isRead ? "#166534" : "#4b5563",
            }}
          >
            <option value="connected">Resolved</option>
            <option value="notconnected">Unresolved</option>
          </select>
        </div>
      ),
    }
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
            className="font-semibold whitespace-nowrap text-xl"
            style={{ color: theme.colors.textPrimary }}
          >
            Contact Us
          </div>
          <div className="flex flex-wrap justify-end items-end gap-3">
            {/* Search Input */}
            <div className="flex flex-col">
              <label
                htmlFor="keyword-search"
                className="mb-1 text-sm font-medium text-gray-700 select-none"
              >
                Search:
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="keyword-search"
                  type="text"
                  placeholder="Search by name, email, contact..."
                  value={searchKeyword}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="border border-gray-300 rounded pl-10 pr-3 py-1.5 text-sm focus:outline-none  "
                  style={{ minWidth: "200px" }}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-gray-700 select-none">
                Inquiry Status:
              </label>
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none  "
                style={{ minWidth: "140px" }}
              >
                <option value="">All Status</option>
                <option value="true">Resolved</option>
                <option value="false">Unresolved</option>
              </select>
            </div>

            {/* From Date */}
            <div className="flex flex-col">
              <label
                htmlFor="from-date"
                className="mb-1 text-sm font-medium text-gray-700 select-none"
              >
                From Date:
              </label>
              <input
                id="from-date"
                type="date"
                value={dateRange.fromDate}
                onChange={(e) => handleDateRangeChange('fromDate', e.target.value)}
                className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none  "
                style={{ minWidth: "140px" }}
              />
            </div>

            {/* To Date */}
            <div className="flex flex-col">
              <label
                htmlFor="to-date"
                className="mb-1 text-sm font-medium text-gray-700 select-none"
              >
                To Date:
              </label>
              <input
                id="to-date"
                type="date"
                value={dateRange.toDate}
                onChange={(e) => handleDateRangeChange('toDate', e.target.value)}
                className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none  "
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
                  Loading entries...
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
              <DataTable columns={columns} data={data} />
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
              total={total ? total : 0}
              onChange={handlePageChange}
              theme={theme}
            />
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedFaq && (
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 max-w-4xl mx-auto max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Contact Detail</h2>
            <div className="space-y-3">
              <div><strong>Name:</strong> {selectedFaq.name}</div>
              <div><strong>Contact:</strong> {selectedFaq.contact}</div>
              <div><strong>Type:</strong> {selectedFaq.type}</div>
              <div
                style={{
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                  maxWidth: "100%",
                  maxHeight: "150px",
                  overflowY: "auto",
                }}
              >
                <strong>Description:</strong> {selectedFaq.desc}
              </div>
              <div><strong>Date:</strong> {new Date(selectedFaq.createdAt).toLocaleString()}</div>
              <div>
                <strong>Media:</strong>
                {selectedFaq.image && selectedFaq.image.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedFaq.image.map((url, index) => {
                      const isVideo = url.match(/\.(mp4|webm|ogg)$/i);
                      return (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-16 h-16 block"
                        >
                          {isVideo ? (
                            <video
                              src={url}
                              className="w-16 h-16 object-cover rounded border"
                              muted
                              playsInline
                            />
                          ) : (
                            <img
                              src={url}
                              alt="media"
                              className="w-16 h-16 object-cover rounded border"
                            />
                          )}
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <div>No media</div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={isReplyModalOpen} onClose={() => setIsReplyModalOpen(false)}>
        {isReplyModalOpen && (
          <div className="p-0 bg-white rounded-lg shadow-sm border border-gray-200 w-full max-w-md sm:max-w-lg mx-auto flex flex-col max-h-[80vh]">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white rounded-t-lg px-4 sm:px-6 pt-4 pb-2 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Reply to Contact</h2>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">To:</label>
                <input
                  type="email"
                  value={replyData.to}
                  readOnly
                  className="w-full px-3 py-2 border rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subject:</label>
                <input
                  type="text"
                  value={replyData.subject}
                  onChange={(e) => setReplyData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message:</label>
                <div className="border rounded-md">
                  <AdvancedRichTextEditor
                    value={replyData.body}
                    onChange={(content) => setReplyData(prev => ({ ...prev, body: content }))}
                  />
                </div>
              </div>
            </div>

            {/* Sticky Footer (Actions) */}
            <div className="sticky bottom-0 z-10 bg-white rounded-b-lg px-4 sm:px-6 py-3 border-t border-gray-200 flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setIsReplyModalOpen(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <Button
                loading={isSending}
                onClick={handleReplySubmit}
                className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700   focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!replyData.subject || !replyData.body}
              >
                Send Reply
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}