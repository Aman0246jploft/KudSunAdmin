// const res = await authAxiosClient.get("/location/all");
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTheme } from "../../contexts/theme/hook/useTheme";
import { toast } from "react-toastify";
import Modal from "./Modal"; // Generic modal wrapper
import authAxiosClient from "../../api/authAxiosClient";

export default function Location() {
  const { theme } = useTheme();

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create"); // "create" | "edit"
  const [formData, setFormData] = useState({ key: null, value: "", parentId: "" });

  // ─── Data Fetch ─────────────────────────────────────────────────────────

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await authAxiosClient.get("/location/all");
      setLocations(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load locations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ─── Form Handling ───────────────────────────────────────────────────────

  const openForm = (mode, loc = { key: null, value: "", parentId: "" }) => {
    setFormMode(mode);
    setFormData({ key: loc.key, value: loc.value, parentId: loc.parentId || "" });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.value.trim()) return toast.warning("Value cannot be empty");

console.log("formData",formData)

    try {
      if (formMode === "create") {
        await authAxiosClient.post("/location/create", {
          value: formData.value,
          parentId: formData.parentId || null,
        });
        toast.success("Created successfully");
      } else {
        await authAxiosClient.post(`/location/update`, {
          id: formData.key,
          value: formData.value,
          parentId: formData.parentId || null,
        });
        toast.success("Updated successfully");
      }
      setIsFormOpen(false);
      fetchAll();
    } catch (err) {
      console.error(err);
      toast.error("Operation failed");
    }
  };

  const handleDelete = async (key) => {
    if (!window.confirm("Are you sure you want to delete this location?")) return;
    try {
      await authAxiosClient.post(`/location/update`,{id: key, isDeleted:true});
      toast.success("Deleted successfully");
      fetchAll();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  // ─── Rendering ──────────────────────────────────────────────────────────

  return (
    <div className="p-4" style={{ backgroundColor: theme.colors.background }}>
      <div
        className="rounded-lg shadow-sm border overflow-hidden"
        style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.backgroundSecondary }}
      >
        <div
          className="flex justify-between items-center px-4 py-3 border-b"
          style={{ borderColor: theme.colors.borderLight }}
        >
          <h2 style={{ color: theme.colors.textPrimary }} className="text-xl font-semibold">
            Location Management
          </h2>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            onClick={() => openForm("create")}
          >
            + Add Province / District
          </button>
        </div>

        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: theme.colors.background }}>
                <th className="px-4 py-2 text-left">Province</th>
                <th className="px-4 py-2 text-left">District</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {locations.length === 0 && (
                <tr>
                  <td className="px-4 py-2 text-center text-gray-400" colSpan={3}>
                    No locations found
                  </td>
                </tr>
              )}
              {locations.map((parent) => (
                <React.Fragment key={parent.key}>
                  <tr>
                    <td className="px-4 py-2 font-medium">{parent.value}</td>
                    <td className="px-4 py-2 italic text-gray-500">—</td>
                    <td className="px-4 py-2 text-right space-x-2">
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={() =>
                          openForm("create", { value: "", parentId: parent.key })
                        }
                      >
                        + District
                      </button>
                      <button
                        className="text-green-600 hover:underline"
                        onClick={() =>
                          openForm("edit", { key: parent.key, value: parent.value, parentId: null })
                        }
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:underline"
                        onClick={() => handleDelete(parent.key)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>

                  {parent.children.map((child) => (
                    <tr key={child.key} className="bg-gray-50">
                      <td className="px-6 py-1 text-gray-700">↳ {parent.value}</td>
                      <td className="px-4 py-1">{child.value}</td>
                      <td className="px-4 py-1 text-right space-x-2">
                        <button
                          className="text-green-600 hover:underline"
                          onClick={() =>
                            openForm("edit", {
                              key: child.key,
                              value: child.value,
                              parentId: parent.key,
                            })
                          }
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:underline"
                          onClick={() => handleDelete(child.key)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isFormOpen && (
        <Modal isOpen onClose={() => setIsFormOpen(false)}>
          <h2 className="text-lg font-semibold mb-4">
            {formMode === "create" ? "Add New" : "Edit"}{" "}
            {formData.parentId ? "District" : "Province"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Name</label>
              <input
                type="text"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            {!formData.parentId && (
              <div>
                <label className="block mb-1 font-medium">Type</label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Province</option>
                  {locations.map((prov) => (
                    <option key={prov.key} value={prov.key}>
                      {prov.value}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
