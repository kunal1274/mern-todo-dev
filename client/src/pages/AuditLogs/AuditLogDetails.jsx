// src/pages/AuditLogs/AuditLogDetails.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Mock fetch for demonstration:
const fetchAuditLogById = async (id) => {
  // In a real app, call your backend: e.g. fetch(`/api/audit-logs/${id}`)
  // Return a mock example:
  return {
    _id: id,
    module: "Company",
    action: "UPDATE",
    user: "john.doe@example.com",
    recordId: "ABC123",
    changes: {
      oldValue: { companyName: "Old Company" },
      newValue: { companyName: "New Company" },
    },
    createdAt: "2025-03-01T10:20:30Z",
  };
};

export default function AuditLogDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auditLog, setAuditLog] = useState(null);

  useEffect(() => {
    // Fetch from API
    fetchAuditLogById(id).then((data) => setAuditLog(data));
  }, [id]);

  // CHANGED: Utility to render changes as a table
  const renderChangesTable = (changes) => {
    if (!changes || typeof changes !== "object") return null;
    const oldObj = changes.oldValue || {};
    const newObj = changes.newValue || {};

    // Collect all unique keys from oldValue and newValue
    const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

    return (
      <table className="min-w-full text-sm text-left text-gray-600 border rounded">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="p-3 font-medium">Field</th>
            <th className="p-3 font-medium">Old Value</th>
            <th className="p-3 font-medium">New Value</th>
          </tr>
        </thead>
        <tbody>
          {[...allKeys].map((key) => (
            <tr key={key} className="border-b">
              <td className="p-3 font-semibold">{key}</td>
              <td className="p-3">{oldObj[key] ?? "—"}</td>
              <td className="p-3">{newObj[key] ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // ADDED: Function to export the table as CSV
  const handleExportChanges = () => {
    if (!auditLog?.changes) return;

    const oldObj = auditLog.changes.oldValue || {};
    const newObj = auditLog.changes.newValue || {};
    const allKeys = [
      ...new Set([...Object.keys(oldObj), ...Object.keys(newObj)]),
    ];

    // Build a CSV string
    let csv = "Field,Old Value,New Value\n";
    allKeys.forEach((key) => {
      const oldVal = oldObj[key] ?? "";
      const newVal = newObj[key] ?? "";
      // Escape quotes if needed
      csv += `"${key}","${oldVal}","${newVal}"\n`;
    });

    // Trigger download in browser
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `audit-log-changes-${auditLog._id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!auditLog) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">Loading audit log...</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Audit Log Details</h1>
      <div className="bg-white p-4 rounded shadow space-y-4">
        <p>
          <strong>Module:</strong> {auditLog.module}
        </p>
        <p>
          <strong>Action:</strong> {auditLog.action}
        </p>
        <p>
          <strong>User:</strong> {auditLog.user}
        </p>
        <p>
          <strong>Record ID:</strong> {auditLog.recordId}
        </p>
        <p>
          <strong>Created At:</strong>{" "}
          {new Date(auditLog.createdAt).toLocaleString()}
        </p>

        {/* CHANGED: Replaced the raw JSON block with a table */}
        <div>
          <strong>Changes:</strong>
          <div className="mt-2">{renderChangesTable(auditLog.changes)}</div>
        </div>
      </div>

      {/* ADDED: Button to export changes as CSV */}
      <div className="flex justify-between">
        <button
          onClick={() => navigate("/audit-logs")}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
        >
          Back to List
        </button>
        <button
          onClick={handleExportChanges}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Export Changes
        </button>
      </div>
    </div>
  );
}
