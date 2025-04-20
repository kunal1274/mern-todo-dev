import React, { useState } from "react";

export default function CompanyStatusModal({
  onClose,
  selectedCompanyIds,
  onStatusChangeSuccess,
}) {
  const [status, setStatus] = useState("approve"); // or "activate", etc.

  const handleConfirm = () => {
    // Perform your API call to change status
    // On success:
    onStatusChangeSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded p-6 max-w-sm w-full">
        <h2 className="text-lg font-semibold mb-4">Change Company Status</h2>
        <p className="text-sm text-gray-600 mb-4">
          You have selected {selectedCompanyIds.length} company(ies). Choose an
          action:
        </p>
        <div className="mb-4">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="approve">Approve</option>
            <option value="reject">Reject</option>
            <option value="activate">Activate</option>
            <option value="deactivate">Deactivate</option>
            <option value="resubmit">Request Modification</option>
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-400 text-gray-600 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
