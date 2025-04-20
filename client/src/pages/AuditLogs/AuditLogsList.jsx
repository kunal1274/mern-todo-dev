// src/pages/AuditLogs/AuditLogsList.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaTrash, FaEye, FaEdit, FaFileExport } from "react-icons/fa";
import AuditLogExportModal from "./AuditLogExportModal";

// Mock data. In a real app, you'd fetch from your backend:
const mockAuditLogs = [
  {
    _id: "1",
    module: "Company",
    action: "CREATE",
    user: "john.doe@example.com",
    recordId: "ABC123",
    createdAt: "2025-03-01T10:20:30Z",
  },
  {
    _id: "2",
    module: "SalesOrder",
    action: "UPDATE",
    user: "jane.smith@example.com",
    recordId: "XYZ789",
    createdAt: "2025-03-02T11:30:45Z",
  },
  // Add more mock logs as needed
];

export default function AuditLogsList() {
  const navigate = useNavigate();

  const [auditLogs, setAuditLogs] = useState([]);
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModule, setFilterModule] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [sortBy, setSortBy] = useState("createdAtDesc");

  // Modal for exporting
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    // Replace with your API call
    // e.g. fetch("/api/audit-logs").then(...)
    setAuditLogs(mockAuditLogs);
  }, []);

  const handleSelect = (id) => {
    setSelectedLogs((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = auditLogs.map((log) => log._id);
      setSelectedLogs(allIds);
    } else {
      setSelectedLogs([]);
    }
  };

  // Filter + Search
  const filteredLogs = auditLogs
    .filter((log) => {
      // Filter by module
      if (
        filterModule &&
        !log.module.toLowerCase().includes(filterModule.toLowerCase())
      ) {
        return false;
      }
      // Filter by user
      if (
        filterUser &&
        !log.user.toLowerCase().includes(filterUser.toLowerCase())
      ) {
        return false;
      }
      // Search in module, action, user
      const searchLower = searchQuery.toLowerCase();
      return (
        log.module.toLowerCase().includes(searchLower) ||
        log.action.toLowerCase().includes(searchLower) ||
        log.user.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      // Sort by createdAt or user
      if (sortBy === "createdAtAsc") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === "createdAtDesc") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === "userAsc") {
        return a.user.localeCompare(b.user);
      } else if (sortBy === "userDesc") {
        return b.user.localeCompare(a.user);
      }
      return 0;
    });

  const handleDeleteLog = (id) => {
    // Confirm deletion
    if (!window.confirm("Are you sure you want to delete this audit log?"))
      return;

    // In real app, call API to delete. Then remove from local state:
    setAuditLogs((prev) => prev.filter((log) => log._id !== id));
    setSelectedLogs((prev) => prev.filter((logId) => logId !== id));
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Audit Logs</h1>
        {/* Export button for selected logs */}
        {selectedLogs.length > 0 && (
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
          >
            <FaFileExport />
            Export Selected
          </button>
        )}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="relative">
          <FaSearch className="absolute left-2 top-2 text-gray-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-4 py-2 border rounded w-64 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        {/* Filter by Module */}
        <input
          type="text"
          placeholder="Filter by module..."
          value={filterModule}
          onChange={(e) => setFilterModule(e.target.value)}
          className="px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {/* Filter by User */}
        <input
          type="text"
          placeholder="Filter by user..."
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
          className="px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border rounded focus:outline-none"
        >
          <option value="createdAtDesc">Created Date (Newest)</option>
          <option value="createdAtAsc">Created Date (Oldest)</option>
          <option value="userAsc">User A-Z</option>
          <option value="userDesc">User Z-A</option>
        </select>
      </div>

      {/* Audit Logs Table */}
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm text-left text-gray-600">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3">
                <input
                  type="checkbox"
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  checked={
                    selectedLogs.length === auditLogs.length &&
                    auditLogs.length > 0
                  }
                />
              </th>
              <th className="p-3 font-medium">Module</th>
              <th className="p-3 font-medium">Action</th>
              <th className="p-3 font-medium">User</th>
              <th className="p-3 font-medium">Created At</th>
              <th className="p-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr
                key={log._id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedLogs.includes(log._id)}
                    onChange={() => handleSelect(log._id)}
                  />
                </td>
                <td className="p-3">{log.module}</td>
                <td className="p-3">{log.action}</td>
                <td className="p-3">{log.user}</td>
                <td className="p-3">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => navigate(`/audit-logs/${log._id}`)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => navigate(`/audit-logs/${log._id}/edit`)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteLog(log._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredLogs.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-4 text-gray-400 italic"
                >
                  No audit logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <AuditLogExportModal
          onClose={() => setShowExportModal(false)}
          selectedLogIds={selectedLogs}
        />
      )}
    </div>
  );
}
