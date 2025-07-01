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
export default function Bank() {
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
      const res = await authAxiosClient.get("/bank/getList?query=isDeleted:false");
      setBanks(res.data.data || {});
    } catch (err) {
      console.error(err);
      toast.error("Failed to load banks");
    } finally {
      setLoading(false);
    }
  };
  console.log("resres", banks)

  useEffect(() => {
    fetchAllBanks();
  }, []);

  // ─── Form ────────────────────────────────────────────────
  const openForm = (mode, bank = { key: null, name: "" }) => {
    setFormMode(mode);
    setFormData({ key: bank.key || bank._id || null, name: bank.name || "" });
    setIsFormOpen(true);
  };



  const columns = [
    {
      key: "name",
      label: "Bank Name",
      sortable: true,
    },
    {
      key: "actions",
      label: "Actions",
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
          <button
            onClick={() => handleDelete(row._id)}
            className="p-1 rounded hover:bg-gray-200"
            style={{ color: theme.colors.error }}
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      ),
    },
  ];



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.warning("Bank name is required");

    try {
      if (formMode === "create") {
        await authAxiosClient.post("/bank/create", { name: formData.name });
        toast.success("Bank created");
      } else {
        await authAxiosClient.post("/bank/update", {
          id: formData.key,
          name: formData.name,
        });
        toast.success("Bank updated");
      }
      setIsFormOpen(false);
      fetchAllBanks();
    } catch (err) {
      console.error(err);
      toast.error("Operation failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      confirmAlert({
        title: "Confirm to submit",
        message: "Are you sure to delete this.",
        buttons: [
          {
            label: "Yes",
            onClick: async () => {
              await authAxiosClient.post("/bank/softDelete", { id });
              toast.success("Bank deleted");
              fetchAllBanks();
            },
          },
          {
            label: "No",
            onClick: () => { },
          },
        ],
      });


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
            Bank Management
          </h2>



          <Button
            onClick={() => openForm("create")}
            style={{
              backgroundColor: theme.colors.buttonPrimary,
              color: theme.colors.buttonText,
            }}
          >
            + Add Bank
          </Button>

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
            {formMode === "create" ? "Add New Bank" : "Edit Bank"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Bank Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
