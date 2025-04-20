// src/pages/RBAC/RBACConfig.jsx

import React, { useState, useEffect } from "react";

/**
 * Example hierarchical data describing the modules, subresources, and reports.
 * In a real app, you might fetch this structure from your server or config file.
 */
const rbacStructure = [
  {
    name: "Company",
    actions: ["CREATE", "READ", "UPDATE", "DELETE", "ACTIVATE", "ARCHIVE"],
    subResources: [
      {
        name: "Address",
        actions: ["CREATE", "READ", "UPDATE", "DELETE"],
      },
      {
        name: "Bank Info",
        actions: ["CREATE", "READ", "UPDATE", "DELETE"],
      },
      {
        name: "Tax Profile",
        actions: ["CREATE", "READ", "UPDATE", "DELETE"],
      },
    ],
    reports: [
      {
        name: "Company Export",
        actions: ["VIEW", "EXPORT_CSV", "EXPORT_EXCEL", "EXPORT_PDF"],
      },
    ],
  },
  {
    name: "Customer",
    actions: ["CREATE", "READ", "UPDATE", "DELETE", "ACTIVATE", "DEACTIVATE"],
    subResources: [
      {
        name: "Customer Address",
        actions: ["CREATE", "READ", "UPDATE", "DELETE"],
      },
    ],
    reports: [
      {
        name: "Customer List Report",
        actions: ["VIEW", "EXPORT_CSV", "EXPORT_EXCEL", "EXPORT_PDF"],
      },
    ],
  },
  // ... add more modules (SalesOrder, PurchaseOrder, etc.)
];

/**
 * Example set of roles in your system. In a real app, you'd fetch them from your backend.
 */
const mockRoles = ["Admin", "Manager", "User"];

/**
 * RBACConfig component:
 * - Allows selecting a role
 * - Displays nested checkboxes for modules, subresources, and reports
 * - Saves the role's config to the server
 */
export default function RBACConfig() {
  // The current role we are configuring
  const [selectedRole, setSelectedRole] = useState("Admin");

  // The permission state object, e.g.:
  // {
  //   Admin: {
  //     Company: {
  //       CREATE: true,
  //       READ: true,
  //       ...
  //       subResources: {
  //         Address: { CREATE: false, ... },
  //         ...
  //       },
  //       reports: {
  //         "Company Export": { VIEW: false, EXPORT_CSV: false, ... }
  //       }
  //     },
  //     Customer: { ... }
  //   },
  //   Manager: { ... },
  //   User: { ... }
  // }
  const [rolePermissions, setRolePermissions] = useState({});

  useEffect(() => {
    // In a real app, you'd fetch the existing permissions from your backend.
    // For now, we initialize them with all false.
    const initial = {};
    mockRoles.forEach((role) => {
      initial[role] = {};
      rbacStructure.forEach((module) => {
        initial[role][module.name] = {
          subResources: {},
          reports: {},
        };
        // Main actions
        module.actions.forEach((action) => {
          initial[role][module.name][action] = false;
        });
        // Sub-resources
        module.subResources?.forEach((sub) => {
          initial[role][module.name].subResources[sub.name] = {};
          sub.actions.forEach((subAction) => {
            initial[role][module.name].subResources[sub.name][
              subAction
            ] = false;
          });
        });
        // Reports
        module.reports?.forEach((rep) => {
          initial[role][module.name].reports[rep.name] = {};
          rep.actions.forEach((repAction) => {
            initial[role][module.name].reports[rep.name][repAction] = false;
          });
        });
      });
    });
    setRolePermissions(initial);
  }, []);

  /**
   * Toggle a main action (like CREATE, UPDATE, etc.) at the module level
   */
  const toggleAction = (role, moduleName, actionName) => {
    setRolePermissions((prev) => {
      const updated = { ...prev };
      const oldVal = updated[role][moduleName][actionName];
      updated[role][moduleName][actionName] = !oldVal;
      return updated;
    });
  };

  /**
   * Toggle a sub-resource action
   */
  const toggleSubAction = (role, moduleName, subResourceName, actionName) => {
    setRolePermissions((prev) => {
      const updated = { ...prev };
      const oldVal =
        updated[role][moduleName].subResources[subResourceName][actionName];
      updated[role][moduleName].subResources[subResourceName][actionName] =
        !oldVal;
      return updated;
    });
  };

  /**
   * Toggle a report action
   */
  const toggleReportAction = (role, moduleName, reportName, actionName) => {
    setRolePermissions((prev) => {
      const updated = { ...prev };
      const oldVal = updated[role][moduleName].reports[reportName][actionName];
      updated[role][moduleName].reports[reportName][actionName] = !oldVal;
      return updated;
    });
  };

  /**
   * Save the current role's permissions to the server
   */
  const handleSave = () => {
    // In a real app, you'd POST or PUT rolePermissions[selectedRole] to your backend
    console.log("Saving permissions for role:", selectedRole);
    console.log(rolePermissions[selectedRole]);
    alert(`Permissions for "${selectedRole}" saved!`);
  };

  // The config for the currently selected role
  const currentRoleConfig = rolePermissions[selectedRole] || {};

  return (
    <div className="flex flex-col p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Role-Based Access Control</h1>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Save
        </button>
      </div>

      <div className="flex items-center gap-4">
        <label className="block text-sm font-medium text-gray-700">
          Select Role:
        </label>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
        >
          {mockRoles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-gray-500">
        Configure which actions (including sub-resources and reports) are
        allowed for this role.
      </p>

      {/* RBAC Table */}
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm text-left text-gray-600">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3 font-medium">
                Module / Sub-Resource / Report
              </th>
              <th className="p-3 font-medium">Action</th>
              <th className="p-3 font-medium text-center">Allowed?</th>
            </tr>
          </thead>
          <tbody>
            {rbacStructure.map((module) => {
              const moduleConfig = currentRoleConfig[module.name] || {};
              // Show main module actions
              const mainActionsRows = module.actions.map((action, idx) => {
                const checked = moduleConfig[action] || false;
                return (
                  <tr
                    key={`${module.name}-${action}`}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    {idx === 0 && (
                      <td
                        rowSpan={module.actions.length}
                        className="p-3 font-semibold text-gray-800 align-top"
                      >
                        {module.name}
                      </td>
                    )}
                    <td className="p-3">{action}</td>
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          toggleAction(selectedRole, module.name, action)
                        }
                      />
                    </td>
                  </tr>
                );
              });

              // Show sub-resources
              const subResourcesRows = (module.subResources || []).map(
                (sub) => {
                  const subResourceConfig =
                    moduleConfig.subResources?.[sub.name] || {};
                  return sub.actions.map((subAction, idx) => {
                    const checked = subResourceConfig[subAction] || false;
                    return (
                      <tr
                        key={`${module.name}-${sub.name}-${subAction}`}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        {idx === 0 && (
                          <td
                            rowSpan={sub.actions.length}
                            className="p-3 pl-8 text-gray-800 align-top"
                          >
                            <span className="font-medium">
                              {module.name} &gt; {sub.name}
                            </span>
                          </td>
                        )}
                        <td className="p-3">{subAction}</td>
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              toggleSubAction(
                                selectedRole,
                                module.name,
                                sub.name,
                                subAction
                              )
                            }
                          />
                        </td>
                      </tr>
                    );
                  });
                }
              );

              // Show reports
              const reportsRows = (module.reports || []).map((rep) => {
                const repConfig = moduleConfig.reports?.[rep.name] || {};
                return rep.actions.map((repAction, idx) => {
                  const checked = repConfig[repAction] || false;
                  return (
                    <tr
                      key={`${module.name}-${rep.name}-${repAction}`}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      {idx === 0 && (
                        <td
                          rowSpan={rep.actions.length}
                          className="p-3 pl-8 text-gray-800 align-top"
                        >
                          <span className="font-medium">
                            {module.name} &gt; {rep.name}
                          </span>
                        </td>
                      )}
                      <td className="p-3">{repAction}</td>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            toggleReportAction(
                              selectedRole,
                              module.name,
                              rep.name,
                              repAction
                            )
                          }
                        />
                      </td>
                    </tr>
                  );
                });
              });

              return (
                <React.Fragment key={module.name}>
                  {/* Main actions */}
                  {mainActionsRows}
                  {/* Sub-resources */}
                  {subResourcesRows}
                  {/* Reports */}
                  {reportsRows}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
