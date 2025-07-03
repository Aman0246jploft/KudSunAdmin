import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { contactUsList, markAsreadContactUs } from "../../features/slices/settingSlice";
import Pagination from "../../Component/Atoms/Pagination/Pagination";
import DataTable from "../../Component/Table/DataTable";
import { useTheme } from "../../contexts/theme/hook/useTheme";
import { FiTrash2, FiCheckCircle, FiSlash } from "react-icons/fi";
import Modal from "./Modal";

export default function Faqs() {
  const dispatch = useDispatch();
  const { theme } = useTheme();

  const [pagination, setPagination] = useState({ pageNo: 1, size: 10 });
  const [faqs, setFaqs] = useState([]);


  const selector = useSelector((state) => state?.setting);
  const { error, loading, contactUs } = selector || {};
  const { data, total } = contactUs ? contactUs : {};
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);



  useEffect(() => {
    dispatch(contactUsList(pagination))
      .unwrap()
      .then((faqResult) => {
        setFaqs(faqResult.data || []);
      })
      .catch((error) => {
        console.error("Unexpected error in fetchData:", error);
        toast.error("Unexpected error occurred");
      });
  }, [dispatch, pagination]);

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, pageNo: newPage }));
  };

  const openDetailModal = (faq) => {
    setSelectedFaq(faq);
    setIsModalOpen(true);
  };



  const handleToggleRead = async (id, currentStatus) => {
    try {
      // TODO: Call your API to update isRead status
      dispatch(markAsreadContactUs({ id, isRead: !currentStatus }))


      // Refresh list after update
      dispatch(contactUsList(pagination))
        .unwrap()
        .then((faqResult) => {
          setFaqs(faqResult.data || []);
        });
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
    },
    {
      key: "contact",
      label: "Contact",
      width: "15%",
    },
    {
      key: "type",
      label: "Type",
      width: "10%",
    },
    {
      key: "desc",
      label: "Description",
      width: "25%",
      render: (_, row) => row.desc || "N/A",
    },
    {
      key: "media",
      label: "Media",
      disableTooltip: true,
      width: "20%",
      render: (_, row) =>
        row.image && row.image.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {row.image.slice(0, 2).map((url, index) => {
              const isVideo = url.match(/\.(mp4|webm|ogg)$/i);
              return (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 block"
                >
                  {isVideo ? (
                    <video
                      src={url}
                      className="w-10 h-10 object-cover rounded border"
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={url}
                      alt="media"
                      className="w-10 h-10 object-cover rounded border"
                    />
                  )}
                </a>
              );
            })}
            {row.image.length > 2 && (
              <span className="text-xs text-gray-500">+{row.image.length - 2} more</span>
            )}
          </div>
        ) : (
          "No Media"
        ),
    }
    ,
    {
      key: "view",
      label: "View",
      width: "10%",
      render: (_, row) => (
        <button
          onClick={() => openDetailModal(row)}
          className="text-blue-600 hover:underline"
        >
          View
        </button>
      ),
    },

    {
      key: "createdAt",
      label: "Date",
      width: "10%",
      render: (_, row) =>
        new Date(row.createdAt).toLocaleDateString("en-IN"),
    },
    {
      key: "actions",
      label: "Status",
      width: "10%",
      render: (_, row) => (
        <button
          onClick={() => handleToggleRead(row._id, row.isRead)}
          className="p-1 rounded hover:bg-gray-200"
          title={row.isRead ? "Mark as Unread" : "Mark as Read"}
          style={{ color: row.isRead ? "green" : "gray" }}
        >
          {row.isRead ? (
            <span className=" text-green-800"> Connected </span>
          ) : (
            <span> Not Connected </span>

          )}
        </button>
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
          className="flex justify-between items-center px-2 py-2"
          style={{ borderBottom: `1px solid ${theme.colors.borderLight}` }}
        >
          <div className="font-semibold text-xl" style={{ color: theme.colors.textPrimary }}>
            Contact Us
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
                <p className="mt-2" style={{ color: theme.colors.textSecondary }}>
                  Loading entries...
                </p>
              </div>
            </div>
          ) : error ? (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ backgroundColor: theme.colors.backgroundSecondary }}
            >
              <div className="text-center font-semibold" style={{ color: theme.colors.error }}>
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
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Contact Detail</h2>
            <div><strong>Name:</strong> {selectedFaq.name}</div>
            <div><strong>Contact:</strong> {selectedFaq.contact}</div>
            <div><strong>Type:</strong> {selectedFaq.type}</div>
            <div
              style={{
                wordBreak: "break-word",
                whiteSpace: "normal",
                maxWidth: "100%",
                maxHeight: "150px",    // set max height as needed
                overflowY: "auto",     // enable vertical scrollbar when content overflows
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
        )}
      </Modal>

    </div>
  );
}
