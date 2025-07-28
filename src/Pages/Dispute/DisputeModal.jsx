import React, { useState } from 'react';
import { ShieldCheck, User, FileText, CircleDollarSign, Clock } from 'lucide-react';
import Button from '../../Component/Atoms/Button/Button';

import authAxiosClient from '../../api/authAxiosClient';
import { toast } from 'react-toastify';
import Modal from './Model';

/**
 * Re‑styled DisputeModal with improved hierarchy, spacing, and dark‑mode support.
 * ‑ Consistent utility components (InfoRow, FileLinks) for cleaner JSX.
 * ‑ Scrollable body for long disputes.
 * ‑ Visually separated sections with subtle borders.
 * ‑ Uses lucide‑react icons for quick scanning.
 */
const InfoRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-2 py-[2px]">
    <span className="text-xs font-medium text-gray-500  whitespace-nowrap">
      {label}
    </span>
    <span className="text-sm font-semibold text-right break-words text-gray-900  max-w-[65%]">
      {value || '—'}
    </span>
  </div>
);

const FileLinks = ({ files = [], label = 'View' }) =>
  files.length ? (
    <div className="flex flex-wrap gap-2 mt-1">
      {files.map((url, idx) => (
        <a
          key={idx}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600  hover:underline text-sm"
        >
          {label} {idx + 1}
        </a>
      ))}
    </div>
  ) : null;

const DisputeModal = ({ dispute, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [adminDecision, setAdminDecision] = useState({ 
    decision: '', 
    decisionNote: '', 
    disputeAmountPercent: 0 
  });

  /* ------------------------------ API handlers ----------------------------- */
  const handleAdminDecision = async (e) => {
    e.preventDefault();
    if (!adminDecision.decision || !adminDecision.decisionNote) {
      toast.error('Please provide both decision and note');
      return;
    }
    try {
      setLoading(true);
      await authAxiosClient.post('/dispute/adminDecision', {
        disputeId: dispute._id,
        ...adminDecision,
      });
      toast.success('Decision submitted successfully');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit decision');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setLoading(true);
      await authAxiosClient.post('/dispute/updateStatus', {
        disputeId: dispute._id,
        status: newStatus,
      });
      toast.success('Status updated successfully');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------- Render -------------------------------- */
  return (
    <Modal isOpen onClose={onClose} title={`Dispute – ${dispute.disputeId}`}>      
      <div className="relative flex flex-col max-h-[80vh] p-3 md:max-h-[75vh] w-full overflow-hidden">
        <h1 className='text-xl border-b-2 p-2'>Dispute Info</h1>
        {/* ─────────────────── Scrollable body ─────────────────── */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-8 pb-8">
          {/* Order Info */}
          <section>
            <header className="flex items-center gap-2 mb-3 text-gray-700 ">
              <CircleDollarSign size={18} />
              <h3 className="font-semibold text-lg">Order Information</h3>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50  p-4 rounded-lg">
              <InfoRow label="Order ID" value={dispute.orderId?.orderId} />
              <InfoRow label="Status" value={dispute.status} />
              <InfoRow
                label="Total Amount"
                value={
                  dispute.orderId?.grandTotal ?
                    `$${dispute.orderId.grandTotal.toFixed(2)}` :
                    undefined
                }
              />
              <InfoRow
                label="Created"
                value={new Date(dispute.createdAt).toLocaleString()}
              />
            </div>
          </section>

          {/* Buyer Info */}
          <section>
            <header className="flex items-center gap-2 mb-3 text-gray-700 ">
              <User size={18} />
              <h3 className="font-semibold text-lg">Buyer Information</h3>
            </header>
            <div className="bg-gray-50  p-4 rounded-lg space-y-2">
              <InfoRow label="Email" value={dispute.raisedBy?.email} />
              <InfoRow label="Dispute Type" value={dispute.disputeType?.toLowerCase().replace(/_/g, ' ')} />
              <div>
                <p className="text-xs font-medium text-gray-500  mb-[2px]">Description</p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-900 ">
                  {dispute.description}
                </p>
              </div>
              {dispute.evidence?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 ">Evidence</p>
                  <FileLinks files={dispute.evidence} label="Evidence" />
                </div>
              )}
            </div>
          </section>

          {/* Seller Info */}
          <section>
            <header className="flex items-center gap-2 mb-3 text-gray-700 ">
              <ShieldCheck size={18} />
              <h3 className="font-semibold text-lg">Seller Information</h3>
            </header>
            <div className="bg-gray-50  p-4 rounded-lg space-y-2">
              <InfoRow label="Email" value={dispute.sellerId?.email} />
              {dispute.sellerResponse && (
                <>
                  <InfoRow label="Response Type" value={dispute.sellerResponse.responseType} />
                  <div>
                    <p className="text-xs font-medium text-gray-500  mb-[2px]">Response</p>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-900 ">
                      {dispute.sellerResponse.description}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 ">
                    Responded on: {new Date(dispute.sellerResponse.respondedAt).toLocaleString()}
                  </p>
                  {dispute.sellerResponse.attachments?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 ">Attachments</p>
                      <FileLinks files={dispute.sellerResponse.attachments} label="Attachment" />
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          {/* Admin Review */}
          {dispute.adminReview && (
            <section>
              <header className="flex items-center gap-2 mb-3 text-gray-700 ">
                <ShieldCheck size={18} />
                <h3 className="font-semibold text-lg">Admin Decision</h3>
              </header>
              <div className="bg-gray-50  p-4 rounded-lg space-y-2">
                <InfoRow label="Decision" value={`In favor of ${dispute.adminReview.decision}`} />
                {dispute.adminReview.decision === 'BUYER' && dispute.adminReview.disputeAmountPercent > 0 && (
                  <InfoRow 
                    label="Refund Amount" 
                    value={`${dispute.adminReview.disputeAmountPercent}% of order total`} 
                  />
                )}
                <div>
                  <p className="text-xs font-medium text-gray-500  mb-[2px]">Decision Note</p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-900 ">
                    {dispute.adminReview.decisionNote}
                  </p>
                </div>
                <p className="text-xs text-gray-400 ">
                  Resolved on: {new Date(dispute.adminReview.resolvedAt).toLocaleString()}
                </p>
              </div>
            </section>
          )}
        </div>
        {/* ─────────────────── Footer / Admin Actions ─────────────────── */}
        {dispute.status !== 'RESOLVED' && (
          <form onSubmit={handleAdminDecision} className="border-t border-gray-200  pt-4 mt-4 space-y-4">
            <h3 className="font-semibold text-lg text-gray-700 ">Make Decision</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500  mb-1">Decision</label>
                <select
                  value={adminDecision.decision}
                  onChange={(e) => setAdminDecision((p) => ({ ...p, decision: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 bg-white   focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Select Decision</option>
                  <option value="BUYER">In Favor of Buyer</option>
                  <option value="SELLER">In Favor of Seller</option>
                </select>
              </div>
              
              {/* Show refund percentage field only when decision is in favor of buyer */}
              {adminDecision.decision === 'BUYER' && (
                <div>
                  <label className="block text-xs font-medium text-gray-500  mb-1">
                    Refund Percentage (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={adminDecision.disputeAmountPercent}
                    onChange={(e) => setAdminDecision((p) => ({ 
                      ...p, 
                      disputeAmountPercent: Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                    }))}
                    className="w-full border rounded-md px-3 py-2 bg-white   focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter percentage (0-100)"
                  />
                  
                  {/* Quick percentage buttons */}
                  <div className="flex gap-2 mt-2">
                    {[25, 50, 75, 100].map((percentage) => (
                      <button
                        key={percentage}
                        type="button"
                        onClick={() => setAdminDecision((p) => ({ 
                          ...p, 
                          disputeAmountPercent: percentage 
                        }))}
                        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                          adminDecision.disputeAmountPercent === percentage
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {percentage}%
                      </button>
                    ))}
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-1">
                    Percentage of order total to refund to buyer
                  </p>
                </div>
              )}
              
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-500  mb-1">Decision Note</label>
                <textarea
                  value={adminDecision.decisionNote}
                  onChange={(e) => setAdminDecision((p) => ({ ...p, decisionNote: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 h-24 bg-white   focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Provide reasoning for your decision..."
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={loading}>
                Submit Decision
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default DisputeModal;
