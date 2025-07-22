import React from "react";
import { sellerVerification } from "../../features/slices/userSlice";
import { useDispatch } from "react-redux";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

export default function SellerVerification({ onClose, data, onActionComplete }) {

  const verification = data?.sellerVerification?.[0];
  const dispatch = useDispatch();
  console.log("STATus",verification?.verificationStatus)

  if (!verification) {
    return (
      <div className="p-4">
        <p>No verification data available.</p>
        <button
          onClick={onClose}
          className="mt-2 px-4 py-2 bg-gray-200 rounded"
        >
          Close
        </button>
      </div>
    );
  }

  const handleRequest = (status) => {
    confirmAlert({
      title: `Confirm to ${status}`,
      message: `Are you sure you want to ${status.toLowerCase()} this seller request?`,
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            dispatch(
              sellerVerification({ status, id: verification._id })
            )
              .then((result) => {
                if (!sellerVerification.fulfilled.match(result)) {
                  const { message, code } = result.payload || {};
                  console.error(`Fetch failed [${code}]: ${message}`);
                } else {
                  onActionComplete?.(); // Notify parent to refresh
                  onClose();
                }
              })
              .catch((error) => {
                console.error("Unexpected error:", error);
              });
          },
        },
        {
          label: "No",
          onClick: () => {},
        },
      ],
    });
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Seller Verification Details</h2>

      <div className="space-y-3">
        <div>
          <strong>Full Name:</strong> {verification.legalFullName || "N/A"}
        </div>
        <div>
          <strong>ID Number:</strong> {verification.idNumber || "N/A"}
        </div>
        <div>
          <strong>Payment Method:</strong> {verification.paymentPayoutMethod || "N/A"}
        </div>

        {/* Conditionally render bank details if present */}
        {verification.bankDetails ? (
          <div>
            <strong>Bank Details:</strong>
            <ul className="ml-4 list-disc">
              <li>
                <strong>Bank Name ID:</strong> {verification.bankDetails.bankName || "N/A"}
              </li>
              <li>
                <strong>Account Number:</strong> {verification.bankDetails.accountNumber || "N/A"}
              </li>
              <li>
                <strong>Account Holder:</strong> {verification.bankDetails.accountHolderName || "N/A"}
              </li>
            </ul>
          </div>
        ) : verification.paymentPayoutMethod === "PromptPay" ? (
          <div>
            <strong>PromptPay ID:</strong> {verification.promptPayId || "N/A"}
          </div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {verification.idDocumentFrontUrl && (
            <div className="flex flex-col items-start">
              <p className="font-medium mb-1">ID Document Front:</p>
              <img
                src={verification.idDocumentFrontUrl}
                alt="ID Document"
                className="rounded border w-full h-40 object-cover"
              />
            </div>
          )}
          {verification.selfieWithIdUrl && (
            <div className="flex flex-col items-start">
              <p className="font-medium mb-1">Selfie with ID:</p>
              <img
                src={verification.selfieWithIdUrl}
                alt="Selfie with ID"
                className="rounded border w-full h-40 object-cover"
              />
            </div>
          )}
          {verification.bankDetails?.bankBookUrl && (
            <div className="flex flex-col items-start">
              <p className="font-medium mb-1">Bank Book:</p>
              <img
                src={verification.bankDetails.bankBookUrl}
                alt="Bank Book"
                className="rounded border w-full h-40 object-cover"
              />
            </div>
          )}
        </div>

   {verification?.verificationStatus=='Pending'&&     <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Close
          </button>
          <button
            onClick={() => {
              handleRequest("Approved");
            }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Approve
          </button>
          <button
            onClick={() => {
              handleRequest("Rejected");
            }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Reject
          </button>
        </div>}
      </div>
    </div>
  );
}
