import React from "react";

export default function CompanyDeleteModal({
  onClose,
  selectedCompanyIds,
  onDeleteSuccess,
}) {
  const handleConfirm = () => {
    // Call your API to delete the selected companies
    // On success:
    onDeleteSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded p-6 max-w-sm w-full">
        <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to delete {selectedCompanyIds.length}{" "}
          company(ies)? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-400 text-gray-600 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
