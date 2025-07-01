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

  console.log("editDataeditData", editData)

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
    console.log("654654", trimmedKey, trimmedValues)

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
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 rounded"
      style={{
        backgroundColor: theme.colors.background,
        color: theme.colors.textPrimary,
      }}
    >
      <h3 className="text-lg font-bold">
        {isEdit ? "Update Parameter" : "Add New Parameter"}
      </h3>


      <div>
        <label className="block mb-1 font-medium">Parameter Key</label>
        <input
          type="text"
          name="key"
          required
          value={keyInput}
          onChange={handleKeyChange}
          className="w-full p-2 rounded"
          style={{
            backgroundColor: theme.colors.inputBackground,
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.textPrimary,
          }}
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Values</label>
        {values.map((val, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={val}
              onChange={(e) => handleValueChange(index, e.target.value)}
              className="flex-1 p-2 rounded"
              style={{
                backgroundColor: theme.colors.inputBackground,
                border: `1px solid ${theme.colors.border}`,
                color: theme.colors.textPrimary,
              }}
            />
            {values.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveValueField(index)}
                className="text-red-500"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddValueField}
          className="mt-1 text-blue-500 text-sm"
        >
          + Add More Value
        </button>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
}
