import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { contactUsList, feeSettingList, markAsreadContactUs, updateFee } from "../../features/slices/settingSlice";
import Pagination from "../../Component/Atoms/Pagination/Pagination";
import DataTable from "../../Component/Table/DataTable";
import { useTheme } from "../../contexts/theme/hook/useTheme";
import { FiTrash2, FiCheckCircle, FiSlash } from "react-icons/fi";
import Modal from "./Modal";

export default function FeeSetting() {
  const dispatch = useDispatch();
  const { theme } = useTheme();

  const [pagination, setPagination] = useState({ pageNo: 1, size: 10 });
  const [faqs, setFaqs] = useState([]);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editingValues, setEditingValues] = useState({ type: "", value: "" });

  const selector = useSelector((state) => state?.setting);
  const { error, loading, feeSettingList2 } = selector || {};
  const { data, total } = feeSettingList2 || {};
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);

  useEffect(() => {
    dispatch(feeSettingList(pagination))
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
      await dispatch(updateFee({ id, isActive: !currentStatus })).unwrap();
      // Refresh list after update
      const faqResult = await dispatch(feeSettingList(pagination)).unwrap();
      setFaqs(faqResult.data || []);
    } catch (err) {
      console.error("Failed to toggle read status", err);
      toast.error("Failed to update status");
    }
  };

  const startEditing = (row) => {
    setEditingRowId(row._id);
    setEditingValues({ type: row.type, value: row.value });
  };

  const cancelEditing = () => {
    setEditingRowId(null);
    setEditingValues({ type: "", value: "" });
  };

  const saveEdit = async (row) => {
    try {
      await dispatch(updateFee({ id: row._id, type: editingValues.type, value: editingValues.value })).unwrap();
      // Refresh list
      const faqResult = await dispatch(feeSettingList(pagination)).unwrap();
      setFaqs(faqResult.data || []);
      cancelEditing();
      toast.success("Updated successfully");
    } catch (err) {
      console.error("Failed to update fee", err);
      toast.error("Failed to update fee");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleKeyDown = (e, row) => {
    if (e.key === "Enter") {
      saveEdit(row);
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  };
  const handleTypeChange = async (id, newType) => {
    try {
      await dispatch(updateFee({ id, type: newType })).unwrap();
      // Refresh list
      const faqResult = await dispatch(feeSettingList(pagination)).unwrap();
      setFaqs(faqResult.data || []);
      toast.success("Type updated successfully");
    } catch (error) {
      console.error("Failed to update type", error);
      toast.error("Failed to update type");
    }
  };

  const columns = [
    {
      key: "serial",
      label: "S.No",
      width: "5%",
      render: (_, __, rowIndex) => (pagination.pageNo - 1) * pagination.size + rowIndex + 1,
    },
    {
      key: "name",
      label: "Name",
      width: "15%",
    },
    {
      key: "type",
      label: "Type",
      width: "15%",
      render: (_, row) => (
        <select
          value={row.type}
          onChange={(e) => handleTypeChange(row._id, e.target.value)}
          className="border rounded px-1 py-0.5"
          style={{ width: "100%" }}
        >
          <option value="PERCENTAGE">PERCENTAGE</option>
          <option value="FIXED">FIXED</option>
        </select>
      ),
    },
    {
      key: "value",
      label: "Value",
      width: "15%",
      render: (_, row) =>
        editingRowId === row._id ? (
          <input
            type="number"
            name="value"
            value={editingValues.value}
            onChange={handleInputChange}
            onBlur={() => saveEdit(row)}
            onKeyDown={(e) => handleKeyDown(e, row)}
            className="border rounded px-1 py-0.5 w-full"
          />
        ) : (
          <div
            onDoubleClick={() => startEditing(row)}
            style={{ cursor: "pointer" }}
            title="Double click to edit"
          >
            {row.value}
          </div>
        ),
    },
    {
      key: "actions",
      label: "Status",
      width: "10%",
      render: (_, row) => (
        <button
          onClick={() => handleToggleRead(row._id, row.isActive)}
          className="p-1 rounded hover:bg-gray-200"
          title={row.isActive ? "Mark as Unread" : "Mark as Read"}
          style={{ color: row.isActive ? "green" : "gray" }}
        >
          {row.isActive ? <span className=" text-green-800"> Active </span> : <span> InActive </span>}
        </button>
      ),
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
          className="flex justify-between items-center px-2 py-2"
          style={{ borderBottom: `1px solid ${theme.colors.borderLight}` }}
        >
          <div className="font-semibold text-xl" style={{ color: theme.colors.textPrimary }}>
            Fee Setting
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

        <div className="py-2 px-2 border-t" style={{ borderColor: theme.colors.borderLight }}>
          <div className="flex justify-end">
            <Pagination pageNo={pagination.pageNo} size={pagination.size} total={total || 0} onChange={handlePageChange} theme={theme} />
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedFaq && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Contact Detail</h2>
            <div>
              <strong>Name:</strong> {selectedFaq.name}
            </div>
            <div>
              <strong>Contact:</strong> {selectedFaq.contact}
            </div>
            <div>
              <strong>Type:</strong> {selectedFaq.type}
            </div>
            <div>
              <strong>Description:</strong> {selectedFaq.desc}
            </div>
            <div>
              <strong>Date:</strong> {new Date(selectedFaq.createdAt).toLocaleString()}
            </div>
            <div>
              <strong>Images:</strong>
              {selectedFaq.image && selectedFaq.image.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedFaq.image.map((img, index) => (
                    <img key={index} src={img} alt="contact" className="w-16 h-16 object-cover rounded border" />
                  ))}
                </div>
              ) : (
                <div>No images</div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
