import React, { useEffect, useState } from "react";
import authAxiosClient from "../../api/authAxiosClient";
import { toast } from "react-toastify";
import { useTheme } from "../../contexts/theme/hook/useTheme";
import Modal from "./Modal";
import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css
import { FiEdit, FiTrash2 } from "react-icons/fi";
import DataTable from "../../Component/Table/DataTable";
import Button from "../../Component/Atoms/Button/Button";

export default function WithDrawlSetting() {
  const { theme } = useTheme();

  const [banks, setBanks] = useState({});
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create"); // "create" | "edit"
  const [formData, setFormData] = useState({ key: null, name: "" });

  // ─── Fetch ───────────────────────────────────────────────
  const fetchAllBanks = async () => {
    setLoading(true);
    try {
      const res = await authAxiosClient.get("/wSetting/getList?query=isDeleted:false");
      setBanks(res.data.data || {});
    } catch (err) {
      console.error(err);
      toast.error("Failed to load banks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBanks();
  }, []);

  // ─── Form ────────────────────────────────────────────────
  const openForm = (mode, bank = { key: null, name: "", value: "" }) => {
    setFormMode(mode);
    setFormData({
      key: bank.key || bank._id || null,
      name: bank.name || "",
      value: bank.value || "",
    });
    setIsFormOpen(true);
  };



  const columns = [
    {
      key: "name",
      label: "Title",
      sortable: true,
      render: (name) =>
        name
      // ?.toLowerCase()
      // .split(" ")
      // .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      // .join(" "),
    },

    {
      key: "value",
      label: "value",
      sortable: true,
      render: (name) =>
        name
      // ?.toLowerCase()
      // .split(" ")
      // .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      // .join(" "),
    },


    {
      key: "actions",
      label: "Actions",
      width: "10%",
      headerStyle: { textAlign: 'right' },
      disableTooltip: true,
      render: (_, row) => (
        <div className="text-right space-x-2">
          <button
            onClick={() => openForm("edit", row)}
            className="p-1 rounded hover:bg-gray-200"
            style={{ color: theme.colors.textPrimary }}
          >
            <FiEdit size={18} />
          </button>
          {/* <button
            onClick={() => handleDelete(row._id)}
            className="p-1 rounded hover:bg-gray-200"
            style={{ color: theme.colors.error }}
          >
            <FiTrash2 size={18} />
          </button> */}
        </div>
      ),
    },
  ];



const handleSubmit = async (e) => {
  e.preventDefault();

  if (formMode === "create") {
    if (!formData.name.trim()) return toast.warning("Title is required");
    try {
      await authAxiosClient.post("/wSetting/create", {
        name: formData.name,
        value: formData.value || "",
      });
      toast.success("Setting created");
      setIsFormOpen(false);
      fetchAllBanks();
    } catch (err) {
      console.error(err);
      toast.error("Create failed");
    }
  } else {
    if (!String(formData.value || "").trim()) {
  return toast.warning("Value is required");
}


    // Convert value to number if needed
    const numericValue = Number(formData.value);

if (["Maximum Amount", "Minimum Amount"].includes(formData.name)) {
  if (isNaN(numericValue) || numericValue <= 0) {
    return toast.warning(`${formData.name} must be a positive number`);
  }

  const minSetting = banks?.data?.find(b => b.name === "Minimum Amount");
  const maxSetting = banks?.data?.find(b => b.name === "Maximum Amount");

  if (formData.name === "Maximum Amount" && minSetting) {
    const minValue = Number(minSetting.value);
    if (numericValue === minValue) {
      return toast.warning("Maximum Amount cannot be equal to Minimum Amount");
    }
    if (numericValue < minValue) {
      return toast.warning("Maximum Amount cannot be less than Minimum Amount");
    }
  }

  if (formData.name === "Minimum Amount" && maxSetting) {
    const maxValue = Number(maxSetting.value);
    if (numericValue === maxValue) {
      return toast.warning("Minimum Amount cannot be equal to Maximum Amount");
    }
    if (numericValue > maxValue) {
      return toast.warning("Minimum Amount cannot be greater than Maximum Amount");
    }
  }
}


    try {
      await authAxiosClient.post("/wSetting/update", {
        id: formData.key,
        value: numericValue,
      });
      toast.success("Value updated");
      setIsFormOpen(false);
      fetchAllBanks();
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    }
  }
};



  const handleDelete = async (id) => {
    try {
      const confirmed = window.confirm("Are you sure you want to delete this?");
      if (!confirmed) return;

      await authAxiosClient.post("/bank/hardDelete", { id });
      toast.success("Bank deleted");
      fetchAllBanks();
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
            Withdrawl Management
          </h2>



          {/* <Button
            onClick={() => openForm("create")}
            style={{
              backgroundColor: theme.colors.buttonPrimary,
              color: theme.colors.buttonText,
            }}
          >
            + Add Bank
          </Button> */}

        </div>

        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : (
          <DataTable columns={columns} data={banks?.data || []} />
        )}
      </div>

      {isFormOpen && (
        <Modal isOpen onClose={() => setIsFormOpen(false)}>
          <h2 className="text-lg font-semibold mb-4">
            {formMode === "create" ? "Withdrawl Management" : "Update"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formMode === "create" && (
              <div>
                <label className="block mb-1 font-medium">Title</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  maxLength={35}
                />
              </div>
            )}

            <div>
              <label className="block mb-1 font-medium">Value</label>
              <input
                type="number"
                value={formData.value}
                
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                className="px-4 py-2 border rounded"
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                {formMode === "create" ? "Create" : "Update"}
              </button>
            </div>
          </form>

        </Modal>
      )}
    </div>
  );
}
