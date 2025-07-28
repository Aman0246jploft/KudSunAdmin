import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  acceptParameterValueByAdmin,
  deleteParameterFromSubCategory,
  rejectParameterValueByAdmin,
  subCategory,
  subCategoryParameter,
} from "../../features/slices/categorySlice";
import DataTable from "../Table/DataTable";
import Pagination from "../Atoms/Pagination/Pagination";
import Modal from "./Modal";

import Button from "../Atoms/Button/Button";
import { FiEdit, FiTrash2 } from "react-icons/fi"; // From Feather Icons
import { useTheme } from "../../contexts/theme/hook/useTheme";
import { useNavigate, useParams } from "react-router";
import AddParameterForm from "./AddParameterForm";
import { toast } from "react-toastify";
import { IoArrowBackSharp } from "react-icons/io5";

export default function SubCategoryParemeter() {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const [pagination, setPagination] = useState({ pageNo: 1, size: 10 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const param = useParams();
  const navigate = useNavigate();
  const [editData, setEditData] = useState(null);
  const { subCategoryParameterList, loading, error } = useSelector(
    (state) => state.category || {}
  );
  let { parameters: data = [], total = 0 } = subCategoryParameterList || {};
  useEffect(() => {
    if (param?.id)
      dispatch(subCategoryParameter({ subCategoryId: param?.id, pagination }))
        .then((result) => {
          if (!subCategory.fulfilled.match(result)) {
            const { message, code } = result.payload || {};
            console.error(`Fetch failed [${code}]: ${message}`);
          }
        })
        .catch((error) => {
          console.error("Unexpected error:", error);
        });
  }, [dispatch, pagination, param?.id]);


  const handleEdit = (row) => {
    setEditData(row);           // Set the row data to edit
    setIsModalOpen(true);       // Open the modal
  };


  const handleAccept = async (paramKey, value) => {
    try {
      const { id: subCategoryId } = param;

      const formData = new FormData();
      formData.append("key", paramKey);
      formData.append("value", value);

      dispatch(
        acceptParameterValueByAdmin({ subCategory: subCategoryId, formData })
      )
        .then((result) => {
          if (acceptParameterValueByAdmin.fulfilled.match(result)) {
            dispatch(
              subCategoryParameter({ subCategoryId: param?.id, pagination })
            );
          } else {
            const { message, code } = result.payload || {};
            console.error(`Fetch failed [${code}]: ${message}`);
          }
        })
        .catch((error) => {
          console.error("Unexpected error:", error);
        });
    } catch (error) {
      toast?.error?.(error?.response?.data?.message || "Failed to accept");
      console.error("Accept error:", error);
    }
  };




  const handleReject = async (paramKey, value) => {
    try {
      const { id: subCategoryId } = param;

      const formData = new FormData();
      formData.append("key", paramKey);
      formData.append("value", value);

      dispatch(
        rejectParameterValueByAdmin({ subCategory: subCategoryId, formData })
      )
        .then((result) => {
          if (rejectParameterValueByAdmin.fulfilled.match(result)) {
            dispatch(
              subCategoryParameter({ subCategoryId: param?.id, pagination })
            );
          } else {
            const { message, code } = result.payload || {};
            console.error(`Fetch failed [${code}]: ${message}`);
          }
        })
        .catch((error) => {
          console.error("Unexpected error:", error);
        });
    } catch (error) {
      toast?.error?.(error?.response?.data?.message || "Failed to accept");
      console.error("Accept error:", error);
    }
  };

  const handleDelete = async (data) => {

    dispatch(deleteParameterFromSubCategory({ subCategoryId: param?.id, paramKey: data?.key }))
      .then((result) => {
        if (deleteParameterFromSubCategory.fulfilled.match(result)) {
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
      });


  }

  const columns = [
    {
      key: "serial",
      label: "S.No",
      width: "10%",
      render: (_, __, rowIndex) =>
        (pagination.pageNo - 1) * pagination.size + rowIndex + 1,
    },
    {
      key: "key",
      label: "Key",
      width: "25%",
    },
    {
      key: "values",
      label: "Values",
      width: "40%",
      disableTooltip: true,
      render: (values, row) =>
        values && values.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {values.map((val) => (
              <div
                key={val._id}
                className="flex items-center gap-1 px-2 py-1 bg-gray-200 rounded text-sm"
              >
                <span>{val.value}</span>
                {val.isAddedByAdmin ? (
                  <span
                    title="Added by admin"
                    className="text-green-600"
                  ></span>
                ) : (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleAccept(row.key, val.value)}
                      title="Accept this value"
                      className="text-green-600 hover:scale-105 transition-transform"
                    >
                      ✅
                    </button>
                    <button
                      onClick={() => handleReject(row.key, val.value)}
                      title="Reject this value"
                      className="text-red-600 hover:scale-105 transition-transform"
                    >
                      ❌
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <span className="text-gray-400">No values</span>
        ),
    },
    {
      key: "actions",
      label: "Actions",
      width: "10%",
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-1 rounded hover:bg-gray-200 "
            style={{ color: theme.colors.textPrimary }}
          >
            <FiEdit size={18} />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-1 rounded hover:bg-gray-200 "
            style={{ color: theme.colors.error }}
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, pageNo: newPage }));
  };

  // Fixed height calculations to prevent UI deflection
  const rowHeight = 40;
  const headerHeight = 56;
  const fixedRows = pagination.size;
  const minTableHeight = headerHeight + rowHeight * fixedRows;

  return (
    <div style={{ backgroundColor: theme.colors.background }}>
      <div
        className="rounded-lg shadow-sm border overflow-hidden "
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
            className="font-semibold flex justify-center items-center text-xl gap-x-2"
            style={{ color: theme.colors.textPrimary }}
          >
            <IoArrowBackSharp className="cursor-pointer" onClick={() => navigate(-1)} />
            <span> SubCategory Parameters</span>
          </div>




          <Button
            onClick={() => setIsModalOpen(true)}
            style={{
              backgroundColor: theme.colors.buttonPrimary,
              color: theme.colors.buttonText,
            }}
          >
            Add Parameters
          </Button>
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
                <p
                  className="mt-2"
                  style={{ color: theme.colors.textSecondary }}
                >
                  Loading categories...
                </p>
              </div>
            </div>
          ) : error ? (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ backgroundColor: theme.colors.backgroundSecondary }}
            >
              <div
                className="text-center font-semibold"
                style={{ color: theme.colors.error }}
              >
                Error: {error}
              </div>
            </div>
          ) : (
            <div className="px-1 pt-1">
              <DataTable columns={columns} data={data} />
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        <div
          className="py-2 px-2 border-t "
          style={{ borderColor: theme.colors.borderLight }}
        >
          <div className="flex justify-end">
            <Pagination
              pageNo={pagination.pageNo}
              size={pagination.size}
              total={total}
              onChange={handlePageChange}
              theme={theme} // pass theme if Pagination supports it
            />
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => {
        setIsModalOpen(false);
        setEditData(null);  // Clear edit state on close
      }}>
        <AddParameterForm
          onClose={() => {
            setIsModalOpen(false);
            setEditData(null);
          }}
          pagination={pagination}
          editData={editData}  // Pass it down
        />
      </Modal>
    </div>
  );
}
