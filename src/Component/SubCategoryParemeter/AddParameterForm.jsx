import React, { useState } from "react";
import Button from "../Atoms/Button/Button";
import { useTheme } from "../../contexts/theme/hook/useTheme";
import { useDispatch } from "react-redux";
import { useParams } from "react-router";
import { toast } from "react-toastify";
import {
  subCategoryParameter,
  addParameter,
  updateParameter,
} from "../../features/slices/categorySlice";

export default function AddParameterForm({ onClose, pagination, editData }) {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const param = useParams();
  const [keyInput, setKeyInput] = useState(editData?.key || "");

  const [values, setValues] = useState(
    editData?.values?.map((val) => val.value) || [""]
  );


  const isEdit = !!editData;

  const handleKeyChange = (e) => setKeyInput(e.target.value);

  const handleValueChange = (index, value) => {
    setValues((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleAddValueField = () => {
    setValues((prev) => [...prev, ""]);
  };

  const handleRemoveValueField = (index) => {
    setValues((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedKey = keyInput.trim();
    const trimmedValues = values.map((v) => v.trim()).filter((v) => v);

    if (!trimmedKey || trimmedValues.length === 0) {
      toast.error("Both key and at least one value are required.");
      return;
    }


    // Move this line up here so it's available in both add and edit flows
    const formData = new FormData();
    formData.append("key", trimmedKey);
    trimmedValues.forEach((val) => {
      formData.append("values", val);
    });

    if (isEdit) {
      const formData = new FormData();
      formData.append("newKey", trimmedKey);
      trimmedValues.forEach((val) => {
        formData.append("newValues", val);
      });

      dispatch(updateParameter({ subCategoryId: param?.id, paramKey: editData?.key, formData }))
        .then((result) => {
          if (updateParameter.fulfilled.match(result)) {
            toast.success("Parameter updated successfully");
            dispatch(
              subCategoryParameter({ subCategoryId: param?.id, pagination })
            );
            onClose();
          } else {
            const { message, code } = result.payload || {};
            toast.error(`Update failed [${code}]: ${message}`);
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error("Unexpected error occurred");
        });
    } else {
      dispatch(addParameter({ subCategoryId: param?.id, formData }))
        .then((result) => {
          if (addParameter.fulfilled.match(result)) {
            toast.success("Parameter added successfully");
            dispatch(
              subCategoryParameter({ subCategoryId: param?.id, pagination })
            );
            onClose();
          } else {
            const { message, code } = result.payload || {};
            toast.error(`Failed [${code}]: ${message}`);
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error("Unexpected error occurred");
        });
    }
  };

  return (
    <div className="w-full max-w-full overflow-hidden">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 sm: p-3 sm:p-4 md:p-6 rounded w-full"
        style={{
          backgroundColor: theme.colors.background,
          color: theme.colors.textPrimary,
        }}
      >
        <h3 className="text-lg sm:text-xl font-bold break-words">
          {isEdit ? "Update Parameter" : "Add New Parameter"}
        </h3>

        {/* Parameter Key Section */}
        <div className="w-full">
          <label className="block mb-2 font-medium text-sm sm:text-base">
            Parameter Key
          </label>
          <input
            type="text"
            name="key"
            required
            value={keyInput}
            onChange={handleKeyChange}
            className="w-full p-2 sm:p-3 rounded text-sm sm:text-base"
            style={{
              backgroundColor: theme.colors.inputBackground,
              border: `1px solid ${theme.colors.border}`,
              color: theme.colors.textPrimary,
            }}
            placeholder="Enter parameter key"
          />
        </div>

        {/* Values Section */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-3">
            <label className="block font-medium text-sm sm:text-base">
              Values ({values.length})
            </label>
            <button
              type="button"
              onClick={handleAddValueField}
              className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm rounded-md transition-colors duration-200 font-medium"
            >
              + Add Value
            </button>
          </div>
          
          {/* Values Grid Container with max height and scroll for many values */}
          <div className="max-h-64 sm:max-h-80 overflow-y-auto border rounded-md p-3 sm:p-4" 
               style={{ 
                 borderColor: theme.colors.border,
                 backgroundColor: theme.colors.inputBackground || 'transparent'
               }}>
            
            {/* Grid Layout for Values */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {values.map((val, index) => (
                <div key={index} className="relative group">
                  {/* Value Input with Index Label */}
                  <div className="relative">
                    {/* <span className="absolute -top-2 left-2 px-1 text-xs text-gray-500 bg-inherit z-10">
                      #{index + 1}
                    </span> */}
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => handleValueChange(index, e.target.value)}
                      className="w-full p-2.5 sm:p-3 rounded-md border text-sm   focus:border-blue-500 transition-all duration-200"
                      style={{
                        backgroundColor: theme.colors.background,
                        border: `1px solid ${theme.colors.border}`,
                        color: theme.colors.textPrimary,
                      }}
                      placeholder={`Value ${index + 1}`}
                    />
                    
                    {/* Remove button - appears on hover/focus */}
                    {values.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveValueField(index)}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 flex items-center justify-center"
                        title="Remove this value"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Empty state when no values */}
              {values.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  <p className="text-sm">No values added yet</p>
                  <p className="text-xs mt-1">Click "Add Value" to get started</p>
                </div>
              )}
            </div>

            {/* Quick Actions for Multiple Values */}
            {values.length > 3 && (
              <div className="flex items-center justify-between mt-4 pt-3 border-t" 
                   style={{ borderColor: theme.colors.border }}>
                <span className="text-xs text-gray-500">
                  {values.filter(v => v.trim()).length} of {values.length} values filled
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      // Add 3 more values at once
                      setValues(prev => [...prev, "", "", ""]);
                    }}
                    className="text-xs text-blue-500 hover:text-blue-600 underline"
                  >
                    Add 3 more
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Remove empty values
                      setValues(prev => prev.filter(v => v.trim()));
                    }}
                    className="text-xs text-orange-500 hover:text-orange-600 underline"
                  >
                    Remove empty
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 sm:space-x-0 pt-4">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            {isEdit ? "Update" : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  );
}