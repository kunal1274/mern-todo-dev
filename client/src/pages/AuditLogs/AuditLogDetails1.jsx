// src/pages/AuditLogs/AuditLogDetails.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Mock fetch
const fetchAuditLogById = async (id) => {
  // In real app, call your backend: e.g. fetch(`/api/audit-logs/${id}`)
  // Return a mock:
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
      <div className="bg-white p-4 rounded shadow space-y-2">
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
        <div>
          <strong>Changes:</strong>
          <pre className="bg-gray-100 p-2 mt-1 rounded text-xs">
            {JSON.stringify(auditLog.changes, null, 2)}
          </pre>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={() => navigate("/audit-logs")}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
        >
          Back to List
        </button>
      </div>
    </div>
  );
}
