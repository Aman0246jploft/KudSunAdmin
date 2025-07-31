import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getReportTypes, createReportType, updateReportType, deleteReportType } from '../../features/slices/settingSlice';
import DataTable from '../../Component/Table/DataTable';
import Button from '../../Component/Atoms/Button/Button';
import Loader from '../../Component/Common/Loader';

import Modal from '../../Component/Category/Modal';
import InputField from '../../Component/Atoms/InputFields/Inputfield';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2 } from 'react-icons/fi';

const ReportTypeManagement = () => {
  const dispatch = useDispatch();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: reportTypes = [],
    size = 0,
    loading: reportTypesLoading = false,
    totalReportTypes = 0,
    pageNo = 1,
    total: totalCount = 0,
  } = useSelector((state) => state.setting?.reportTypeinfo || {});




  useEffect(() => {
    fetchReportTypes();
  }, [currentPage, pageSize]);

  const fetchReportTypes = () => {
    dispatch(getReportTypes({ pageNo: currentPage, size: pageSize }))
      .unwrap()
      .catch((error) => {
        toast.error(error.message || 'Failed to fetch report types');
      });
  };

  const handleOpenModal = (reportType = null) => {
    setSelectedReportType(reportType);
    setFormData({ name: reportType?.name || '' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReportType(null);
    setFormData({ name: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (selectedReportType) {
        await dispatch(updateReportType({ id: selectedReportType._id, ...formData })).unwrap();
        toast.success('Report type updated successfully');
      } else {
        await dispatch(createReportType(formData)).unwrap();
        toast.success('Report type created successfully');
      }
      handleCloseModal();
      fetchReportTypes();
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    console.log(id)
    if (window.confirm('Are you sure you want to delete this report type?')) {
      try {
        await dispatch(deleteReportType(id)).unwrap();
        toast.success('Report type deleted successfully');
        fetchReportTypes();
      } catch (error) {
        toast.error(error.message || 'Failed to delete report type');
      }
    }
  };

  const columns = [
    {
      key: 'Name',
      label: 'Name',
      width: "99%",
      render: (_, record) => {
        return record?.name
          // ?.toLowerCase()
          // .split(" ")
          // .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          // .join(" ");
      }
    },

    {
      key: 'Actions',
      label: 'Action',
  
      render: (_, row) => (
        <div className="flex gap-2 justify-end">

          <button
            variant="primary"
            size="sm"
            onClick={() => handleOpenModal(row)}
          >
            <FiEdit size={18} />
          </button>
          <button

            onClick={() => handleDelete(row?._id)}
          >
            <FiTrash2 className='text-red-500' size={18} />
          </button>
        </div>
      ),
    }

  ];

  if (reportTypesLoading) {
    return <Loader />;
  }



  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Report Type Management</h1>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          Add New Report Type
        </Button>
      </div>

      <DataTable columns={columns} data={reportTypes} />


      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedReportType ? 'Edit Report Type' : 'Add Report Type'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Enter report type name"
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {selectedReportType ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ReportTypeManagement; 