import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { updateAppSetting, termAndPolicy } from "../../features/slices/settingSlice";
import AdvancedRichTextEditor from "../../Component/RichTextEditor/AdvancedRichTextEditor";

export default function PrivacyPolicy() {
  const dispatch = useDispatch();
  const staticSettings = useSelector((state) => state.setting.termAndPolicy || {});
  const [editData, setEditData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [privacyPolicy, setPrivacyPolicy] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(termAndPolicy());
      } catch (error) {
        console.error("Failed to fetch terms and policy:", error);
        toast.error("Failed to load privacy policy");
      }
    };
    fetchData();
  }, [dispatch]);

  useEffect(() => {
    // Find the privacy policy entry
    const policy = Object.values(staticSettings).find(item => item.key === "Privacy_Policy");
    if (policy) {
      setPrivacyPolicy(policy);
      setEditData(policy.value || "");
    }
  }, [staticSettings]);

  const handleUpdate = async () => {
    if (!privacyPolicy) return;

    setIsLoading(true);
    try {
      const payload = {
        id: privacyPolicy._id,
        name: privacyPolicy.name,
        key: privacyPolicy.key,
        value: editData
      };

      const result = await dispatch(updateAppSetting(payload));
      if (updateAppSetting.fulfilled.match(result)) {
        toast.success("Privacy Policy updated successfully");
      } else {
        toast.error(result.payload?.message || "Update failed");
      }
    } catch (err) {
      toast.error("Failed to update Privacy Policy");
    } finally {
      setIsLoading(false);
    }
  };

  if (!privacyPolicy) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Privacy Policy</h2>
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {new Date(privacyPolicy.updatedAt || privacyPolicy.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <AdvancedRichTextEditor
            value={editData}
            onChange={setEditData}
          />
          <div className="flex justify-end mt-6">
            <button
              onClick={handleUpdate}
              disabled={isLoading || editData === privacyPolicy.value}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                editData !== privacyPolicy.value && !isLoading
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isLoading ? "Updating..." : "Update"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 