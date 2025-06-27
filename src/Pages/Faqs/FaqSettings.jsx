import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../../contexts/theme/hook/useTheme";
import DataTable from "../../Component/Table/DataTable";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import Pagination from "../../Component/Atoms/Pagination/Pagination";
import Button from "../../Component/Atoms/Button/Button";
import Modal from "./Modal";
import {
  createAppsetting,
  deleteSetting,
  getFAQs,
  updateAppSetting,
} from "../../features/slices/settingSlice";

export default function FaqSettings() {
  const { theme } = useTheme();
  const faqs = useSelector((state) => state.setting?.faqs?.faqs || []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    key: "",
    name: "",
    value: "",
  });

  const [pagination, setPagination] = useState({ pageNo: 1, size: 10 });
  const [filters, setFilters] = useState({ keyword: "" });
  const dispatch = useDispatch();
  const extractNumberFromKey = (key) => {
    const match = key.match(/\d+/);
    return match ? Number(match[0]) : "";
  };

  const handleEdit = (row) => {
    setEditMode(true);
    setFormData({
      id: row._id || "",
      key: extractNumberFromKey(row.key) || "",
      name: row.name || "",
      value: row.value || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (row) => {
    dispatch(deleteSetting(row._id))
      .then((result) => {
        if (deleteSetting.fulfilled.match(result)) {
          dispatch(getFAQs());
        } else {
          const { message, code } = result.payload || {};
          console.error(`deleteSetting failed [${code}]: ${message}`);
        }
      })
      .catch((error) => {
        console.error("Unexpected error:", error);
      });
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, pageNo: newPage }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "key" ? Number(value) : value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.value || formData.key === "") {
      alert("All fields are required.");
      return;
    }

    let payload = {
      name: formData.name,
      value: formData.value,
      key: `faq${formData.key}`,
    };

    if (editMode) {
      payload["id"] = formData.id;

      dispatch(updateAppSetting(payload))
        .then((result) => {
          if (updateAppSetting.fulfilled.match(result)) {
            dispatch(getFAQs());
          } else {
            const { message, code } = result.payload || {};
            console.error(`updateAppSetting failed [${code}]: ${message}`);
          }
        })
        .catch((error) => {
          console.error("Unexpected error:", error);
        });
    } else {
      dispatch(createAppsetting(payload))
        .then((result) => {
          if (createAppsetting.fulfilled.match(result)) {
            dispatch(getFAQs());
          } else {
            const { message, code } = result.payload || {};
            console.error(`createAppsetting failed [${code}]: ${message}`);
          }
        })
        .catch((error) => {
          console.error("Unexpected error:", error);
        });
    }

    setIsModalOpen(false);
    setFormData({ key: "", name: "", value: "" });
    setEditMode(false);
  };

  const filteredFaqs = faqs.filter((faq) =>
    faq.name?.toLowerCase().includes(filters.keyword.toLowerCase())
  );

  const paginatedFaqs = filteredFaqs.slice(
    (pagination.pageNo - 1) * pagination.size,
    pagination.pageNo * pagination.size
  );

  const columns = [
    {
      key: "name",
      label: "FAQ Title",
      width: "30%",
    },
    {
      key: "value",
      label: "FAQ Answer",
      width: "60%",
    },
    {
      key: "actions",
      label: "Actions",
      width: "10%",
      render: (_, row) => (
        <div className="flex gap-2">
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
        <div
          className="flex justify-between items-center px-2 py-2"
          style={{ borderBottom: `1px solid ${theme.colors.borderLight}` }}
        >
          <div
            className="font-semibold text-xl"
            style={{ color: theme.colors.textPrimary }}
          >
            FAQ Settings
          </div>

          <div className="flex justify-center items-center gap-3">
            <Button
              onClick={() => {
                setEditMode(false);
                setFormData({ key: "", name: "", value: "" });
                setIsModalOpen(true);
              }}
              style={{
                backgroundColor: theme.colors.buttonPrimary,
                color: theme.colors.buttonText,
              }}
            >
              Add FAQ
            </Button>
          </div>
        </div>

        <div className="relative" style={{ minHeight: "300px" }}>
          {faqs.length === 0 ? (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ backgroundColor: theme.colors.backgroundSecondary }}
            >
              <p
                className="text-center"
                style={{ color: theme.colors.textSecondary }}
              >
                No FAQs found.
              </p>
            </div>
          ) : (
            <div className="px-1 pt-1">
              <DataTable columns={columns} data={paginatedFaqs} />
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
              total={filteredFaqs.length}
              onChange={handlePageChange}
              theme={theme}
            />
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div
          className="space-y-4 p-4"
          style={{ color: theme.colors.textPrimary }}
        >
          <h2 className="text-lg font-semibold">
            {editMode ? "Edit FAQ" : "Add FAQ"}
          </h2>
          <div>
            <label className="block mb-1">Key (number)</label>
            <input
              type="number"
              name="key"
              value={formData.key}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">FAQ Title</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">FAQ Answer</label>
            <textarea
              name="value"
              value={formData.value}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              onClick={() => setIsModalOpen(false)}
              style={{
                backgroundColor: theme.colors.border,
                color: theme.colors.textPrimary,
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              style={{
                backgroundColor: theme.colors.buttonPrimary,
                color: theme.colors.buttonText,
              }}
            >
              {editMode ? "Update FAQ" : "Add FAQ"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
