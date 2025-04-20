// src/pages/AuditLogs/AuditLogExportModal.jsx

import React from "react";

export default function AuditLogExportModal({ onClose, selectedLogIds }) {
  const handleExport = (format) => {
    // In a real app, implement actual export:
    // - Call your API with selectedLogIds + format, or
    // - Generate file on the client (e.g. with SheetJS or jsPDF)
    console.log(`Exporting logs [${selectedLogIds.join(", ")}] as ${format}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded p-6 max-w-sm w-full">
        <h2 className="text-lg font-semibold mb-4">Export Audit Logs</h2>
        <p className="text-sm text-gray-600 mb-4">
          Export {selectedLogIds.length} selected log
          {selectedLogIds.length > 1 ? "s" : ""}:
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleExport("excel")}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Export as Excel
          </button>
          <button
            onClick={() => handleExport("csv")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Export as CSV
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Export as PDF
          </button>
        </div>
        <div className="mt-4 text-right">
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:underline"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
