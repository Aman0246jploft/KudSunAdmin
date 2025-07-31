import React, { useEffect, useState } from "react";
import authAxiosClient from "../../api/authAxiosClient";
import { toast } from "react-toastify";
import { useTheme } from "../../contexts/theme/hook/useTheme";
import Modal from "./Modal";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { FiEdit, FiTrash2, FiGlobe, FiPhone, FiClock } from "react-icons/fi";
import DataTable from "../../Component/Table/DataTable";
import Button from "../../Component/Atoms/Button/Button";
import Pagination from "../../Component/Atoms/Pagination/Pagination";

export default function Carrier() {
  const { theme } = useTheme();

  const [carriers, setCarriers] = useState({});
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create"); // "create" | "edit"
  const [formData, setFormData] = useState({
    key: null,
    name: "",
    contact: "",
    website: "",
    estimatedDays: "",
    isDisable: false
  });
  const [pagination, setPagination] = useState({ pageNo: 1, size: 10 });
  const [totalRecords, setTotalRecords] = useState(0);

  // ─── Fetch ───────────────────────────────────────────────
  const fetchAllCarriers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        query: "isDeleted:false",
        pageNo: pagination.pageNo,
        size: pagination.size
      });
      
      const res = await authAxiosClient.get(`/carrier/getList?${queryParams}`);
      const responseData = res.data.data || {};
      setCarriers(responseData);
      setTotalRecords(responseData.total || 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load carriers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCarriers();
  }, [pagination.pageNo, pagination.size]);

  // ─── Pagination ──────────────────────────────────────────
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, pageNo: newPage }));
  };

  // ─── Form ────────────────────────────────────────────────
  const openForm = (mode, carrier = {
    key: null,
    name: "",
    contact: "",
    website: "",
    estimatedDays: "",
    isDisable: false
  }) => {
    setFormMode(mode);
    setFormData({
      key: carrier.key || carrier._id || null,
      name: carrier.name || "",
      contact: carrier.contact || "",
      website: carrier.website || "",
      estimatedDays: carrier.estimatedDays || "",
      isDisable: carrier.isDisable || false
    });
    setIsFormOpen(true);
  };

  const columns = [
    {
      key: "name",
      label: "Carrier Name",
      sortable: true,
      render: (name) =>
        name
          // ?.toLowerCase()
          // .split(" ")
          // .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          // .join(" "),
    },

    // {
    //   key: "isDisable",
    //   label: "Status",
    //   render: (isDisable) => (
    //     <span
    //       className={`px-2 py-1 rounded-full text-xs font-medium ${
    //         isDisable
    //           ? "bg-red-100 text-red-800"
    //           : "bg-green-100 text-green-800"
    //       }`}
    //     >
    //       {isDisable ? "Disabled" : "Active"}
    //     </span>
    //   ),
    // },
         {
       key: "actions",
       label: "Actions",
       disableTooltip: true,
       headerStyle: { textAlign: "right" },
       cellStyle: { textAlign: "right" },
       render: (_, row) => (
         <div className="text-right space-x-2">
          <button
            onClick={() => openForm("edit", row)}
            className="p-1 rounded hover:bg-gray-200"
            style={{ color: theme.colors.textPrimary }}
            title="Edit Carrier"
          >
            <FiEdit size={18} />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="p-1 rounded hover:bg-gray-200"
            style={{ color: theme.colors.error }}
            title="Delete Carrier"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.warning("Carrier name is required");

    // Validate website URL if provided
    if (formData.website && formData.website.trim()) {
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(formData.website.trim())) {
        return toast.warning("Please enter a valid website URL");
      }
    }

    // Validate estimated days if provided
    if (formData.estimatedDays && (isNaN(formData.estimatedDays) || parseInt(formData.estimatedDays) < 1)) {
      return toast.warning("Estimated days must be a positive number");
    }

    try {
      const payload = {
        name: formData.name.trim(),
        contact: formData.contact.trim() || undefined,
        website: formData.website.trim() || undefined,
        estimatedDays: formData.estimatedDays ? parseInt(formData.estimatedDays) : undefined,
        isDisable: formData.isDisable
      };

      if (formMode === "create") {
        await authAxiosClient.post("/carrier/create", payload);
        toast.success("Carrier created successfully");
      } else {
        await authAxiosClient.post("/carrier/update", {
          id: formData.key,
          ...payload
        });
        toast.success("Carrier updated successfully");
      }
      setIsFormOpen(false);
      setPagination((prev) => ({ ...prev, pageNo: 1 })); // Reset to first page
      fetchAllCarriers();
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "Operation failed";
      toast.error(errorMessage);
    }
  };

const handleDelete = async (id) => {
  try {
    const confirmed = window.confirm("Are you sure you want to delete this carrier?");
    if (!confirmed) return;

    await authAxiosClient.post("/carrier/softDelete", { id });
    toast.success("Carrier deleted successfully");
    setPagination((prev) => ({ ...prev, pageNo: 1 })); // Reset to first page
    fetchAllCarriers();
  } catch (err) {
    console.error(err);
    toast.error("Delete failed");
  }
};

  // ─── UI ─────────────────────────────────────────────────
  return (
    <div className="p-4" style={{ backgroundColor: theme.colors.background }}>
      <div
        className="rounded-lg shadow-sm border overflow-hidden"
        style={{
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.backgroundSecondary,
        }}
      >
        <div
          className="flex justify-between items-center px-4 py-3 border-b"
          style={{ borderColor: theme.colors.borderLight }}
        >
          <h2 style={{ color: theme.colors.textPrimary }} className="text-xl font-semibold">
            Carrier Management
          </h2>

          <Button
            onClick={() => openForm("create")}
            style={{
              backgroundColor: theme.colors.buttonPrimary,
              color: theme.colors.buttonText,
            }}
          >
            + Add Carrier
          </Button>
        </div>

        <div className="relative" style={{ minHeight: "300px" }}>
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
                  Loading carriers...
                </p>
              </div>
            </div>
          ) : (
            <div className="px-1 pt-1">
              <DataTable columns={columns} data={carriers?.data || []} />
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
              total={totalRecords}
              onChange={handlePageChange}
              theme={theme}
            />
          </div>
        </div>
      </div>

      {isFormOpen && (
        <Modal isOpen onClose={() => setIsFormOpen(false)}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: theme.colors.textPrimary }}>
            {formMode === "create" ? "Add New Carrier" : "Edit Carrier"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium" style={{ color: theme.colors.textPrimary }}>
                Carrier Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border rounded px-3 py-2"
                style={{
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.background,
                  color: theme.colors.textPrimary
                }}
                maxLength={50}
                placeholder="Enter carrier name"
                required
              />
            </div>
            


            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                className="px-4 py-2 border rounded hover:bg-gray-50"
                style={{
                  borderColor: theme.colors.border,
                  color: theme.colors.textPrimary
                }}
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded hover:opacity-90"
                style={{
                  backgroundColor: theme.colors.buttonPrimary,
                  color: theme.colors.buttonText
                }}
              >
                {formMode === "create" ? "Create Carrier" : "Update Carrier"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
} 