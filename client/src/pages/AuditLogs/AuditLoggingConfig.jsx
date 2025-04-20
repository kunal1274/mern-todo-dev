// src/pages/AuditLogs/AuditLoggingConfig.jsx

import React, { useEffect, useState } from "react";

/**
 * Mock data structure listing each module and the actions you want to offer.
 * In a real app, you might fetch this from your API or a config file.
 */
const mockModulesActions = [
  {
    module: "Company",
    actions: ["CREATE", "UPDATE", "DELETE", "APPROVE", "REJECT"],
  },
  {
    module: "Customer",
    actions: ["CREATE", "UPDATE", "DELETE", "ACTIVATE", "DEACTIVATE"],
  },
  {
    module: "SalesOrder",
    actions: ["CREATE", "UPDATE", "DELETE", "SUBMIT", "APPROVE", "REJECT"],
  },
  {
    module: "PurchaseOrder",
    actions: ["CREATE", "UPDATE", "DELETE", "SUBMIT", "APPROVE", "REJECT"],
  },
  // ... Add more modules as needed
];

/**
 * This component displays a table of modules & actions with checkboxes
 * to enable or disable audit logging. It follows a similar design theme
 * as the earlier examples.
 */
export default function AuditLoggingConfig() {
  // State to hold whether each (module, action) is audit-enabled.
  // Example shape:
  // {
  //   Company: { CREATE: true, UPDATE: true, DELETE: false, ... },
  //   Customer: { CREATE: false, UPDATE: false, ... },
  //   ...
  // }
  const [auditConfig, setAuditConfig] = useState({});

  useEffect(() => {
    // In a real app, you might fetch existing config from your backend:
    // fetch("/api/audit-config").then(...)
    // For now, we initialize everything to false by default.
    const initialConfig = {};
    mockModulesActions.forEach((item) => {
      initialConfig[item.module] = {};
      item.actions.forEach((action) => {
        // Set default to false (not enabled)
        initialConfig[item.module][action] = false;
      });
    });
    setAuditConfig(initialConfig);
  }, []);

  // Handle a single checkbox toggle
  const handleToggle = (moduleName, actionName) => {
    setAuditConfig((prev) => {
      const updated = { ...prev };
      updated[moduleName] = { ...updated[moduleName] };
      updated[moduleName][actionName] = !updated[moduleName][actionName];
      return updated;
    });
  };

  // Save the config to the server
  const handleSave = () => {
    // In a real app, you'd POST or PUT the auditConfig to your backend:
    // fetch("/api/audit-config", { method: "POST", body: JSON.stringify(auditConfig) })
    console.log("Saving Audit Config:", auditConfig);
    alert("Audit Logging Configuration saved!");
  };

  return (
    <div className="flex flex-col p-4 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Audit Logging Configuration</h1>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Save
        </button>
      </div>

      <p className="text-sm text-gray-500">
        Select which modules and actions you want to audit. Whenever an enabled
        action occurs (CREATE, UPDATE, DELETE, etc.), an audit log will be
        generated.
      </p>

      {/* Configuration Table */}
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm text-left text-gray-600">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3 font-medium">Module</th>
              <th className="p-3 font-medium">Action</th>
              <th className="p-3 font-medium text-center">Audit Enabled?</th>
            </tr>
          </thead>
          <tbody>
            {mockModulesActions.map((item) => (
              <React.Fragment key={item.module}>
                {item.actions.map((actionName, idx) => {
                  const isChecked =
                    auditConfig[item.module]?.[actionName] || false;
                  return (
                    <tr
                      key={actionName}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      {/* Module name in the first column (show only once per group if you prefer) */}
                      {idx === 0 ? (
                        <td
                          rowSpan={item.actions.length}
                          className="p-3 font-semibold text-gray-800 align-top"
                        >
                          {item.module}
                        </td>
                      ) : null}
                      <td className="p-3">{actionName}</td>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggle(item.module, actionName)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
