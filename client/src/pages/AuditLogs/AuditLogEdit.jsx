// src/pages/AuditLogs/AuditLogEdit.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Mock fetch and update
const fetchAuditLogById = async (id) => {
  return {
    _id: id,
    module: "Company",
    action: "UPDATE",
    user: "john.doe@example.com",
    recordId: "ABC123",
    changes: {
      oldValue: { name: "Old" },
      newValue: { name: "New" },
    },
    createdAt: "2025-03-01T10:20:30Z",
  };
};

const updateAuditLog = async (id, payload) => {
  // In a real app, do a PUT or PATCH request to your API
  console.log("Updating audit log:", id, payload);
  return { success: true };
};

export default function AuditLogEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [moduleValue, setModuleValue] = useState("");
  const [action, setAction] = useState("");
  const [user, setUser] = useState("");
  const [recordId, setRecordId] = useState("");
  const [changes, setChanges] = useState("");

  useEffect(() => {
    fetchAuditLogById(id).then((data) => {
      setModuleValue(data.module);
      setAction(data.action);
      setUser(data.user);
      setRecordId(data.recordId);
      setChanges(JSON.stringify(data.changes, null, 2));
    });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        module: moduleValue,
        action,
        user,
        recordId,
        changes: JSON.parse(changes),
      };
      const res = await updateAuditLog(id, payload);
      if (res.success) {
        alert("Audit log updated successfully.");
        navigate(`/audit-logs/${id}`);
      }
    } catch (err) {
      console.error("Error updating log:", err);
      alert("Failed to update audit log.");
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Edit Audit Log</h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-4 rounded shadow"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Module
          </label>
          <input
            type="text"
            value={moduleValue}
            onChange={(e) => setModuleValue(e.target.value)}
            className="mt-1 block w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Action
          </label>
          <input
            type="text"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="mt-1 block w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            User
          </label>
          <input
            type="text"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Record ID
          </label>
          <input
            type="text"
            value={recordId}
            onChange={(e) => setRecordId(e.target.value)}
            className="mt-1 block w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Changes (JSON)
          </label>
          <textarea
            value={changes}
            onChange={(e) => setChanges(e.target.value)}
            className="mt-1 block w-full border rounded px-3 py-2 h-32 font-mono text-xs"
          />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={() => navigate(`/audit-logs/${id}`)}
            className="px-4 py-2 border border-gray-400 text-gray-600 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
