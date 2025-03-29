import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

/**
 * MAIN COMPONENT: TestManagement
 */
function TestManagement() {
  const [testsTree, setTestsTree] = useState([]);

  // Form state for creating/updating top-level tasks
  const [testName, setTestName] = useState("");
  const [status, setStatus] = useState("Not Started");
  const [editingTest, setEditingTest] = useState(null);

  // Search filters
  const [searchName, setSearchName] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchStartDate, setSearchStartDate] = useState("");
  const [searchEndDate, setSearchEndDate] = useState("");

  // Sub-task creation
  const [subTaskName, setSubTaskName] = useState("");
  const [subTaskStatus, setSubTaskStatus] = useState("Not Started");
  const [parentForSubTask, setParentForSubTask] = useState(null);

  // For errors
  const [error, setError] = useState("");

  // Backend base URL
  const apiUrl = import.meta.env.VITE_BACKEND_URL
    ? `${import.meta.env.VITE_BACKEND_URL}/tests`
    : "/api/v1/tests";

  // --------------------------------------
  //  A) FETCH the entire tasks tree
  // --------------------------------------
  const fetchTestsTree = async () => {
    try {
      let query = "";
      const params = [];
      if (searchName) params.push(`name=${encodeURIComponent(searchName)}`);
      if (searchStatus)
        params.push(`status=${encodeURIComponent(searchStatus)}`);
      if (searchStartDate)
        params.push(`startDate=${encodeURIComponent(searchStartDate)}`);
      if (searchEndDate)
        params.push(`endDate=${encodeURIComponent(searchEndDate)}`);
      if (params.length > 0) {
        query = `?${params.join("&")}`;
      }

      const res = await axios.get(`${apiUrl}/tree${query}`);
      if (Array.isArray(res.data)) {
        setTestsTree(res.data);
      } else {
        console.error("Expected array from /tree, got:", res.data);
        setTestsTree([]);
      }
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || err.message);
    }
  };

  useEffect(() => {
    fetchTestsTree();
    // eslint-disable-next-line
  }, []);

  // --------------------------------------
  //  B) CREATE or UPDATE top-level tasks
  // --------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTest) {
        // Update
        await axios.put(`${apiUrl}/${editingTest._id}`, {
          name: testName,
          status,
        });
        setEditingTest(null);
      } else {
        // Create top-level
        await axios.post(apiUrl, { name: testName, status });
      }
      setTestName("");
      setStatus("Not Started");
      fetchTestsTree();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || err.message);
    }
  };

  // --------------------------------------
  //  C) EDIT (prefill the top-level form)
  // --------------------------------------
  const handleEdit = (test) => {
    setEditingTest(test);
    setTestName(test.name);
    setStatus(test.status || "Not Started");
  };

  // --------------------------------------
  //  D) DELETE
  // --------------------------------------
  const handleDelete = async (testId) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;
    try {
      await axios.delete(`${apiUrl}/${testId}`);
      fetchTestsTree();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || err.message);
    }
  };

  // --------------------------------------
  //  E) SEARCH
  // --------------------------------------
  const handleSearch = (e) => {
    e.preventDefault();
    fetchTestsTree();
  };
  const handleResetSearch = () => {
    setSearchName("");
    setSearchStatus("");
    setSearchStartDate("");
    setSearchEndDate("");
    fetchTestsTree();
  };

  // 6) Create a sub-task
  const handleCreateSubTask = async (e) => {
    e.preventDefault();
    if (!parentForSubTask) {
      alert("No parent test selected for sub-task creation.");
      return;
    }
    try {
      //await validateBackendUrl();
      const response = await axios.post(
        `${apiUrl}/${parentForSubTask._id}/subtask`,
        { name: subTaskName, status: subTaskStatus }
      );
      // Re-fetch or update local state
      // await fetchTests();
      setSubTaskName("");
      setSubTaskStatus("Not Started");
      setParentForSubTask(null);
    } catch (err) {
      console.error("Axios SubTask Error:", err);
      setError(err.response?.data?.msg || err.message);
    }
  };

  // --------------------------------------
  //  F) EXPORT to Excel
  // --------------------------------------
  const exportToExcel = () => {
    try {
      // Flatten the tree into a simple array
      const rows = [];
      const traverse = (node, level, path) => {
        const currentPath = path ? path + " > " + node.name : node.name;
        rows.push({
          Name: node.name,
          Status: node.status,
          Level: level,
          Path: currentPath,
          CreatedAt: node.createdAt || "",
          UpdatedAt: node.updatedAt || "",
        });
        if (Array.isArray(node.subTasks)) {
          node.subTasks.forEach((sub) => traverse(sub, level + 1, currentPath));
        }
      };
      testsTree.forEach((root) => traverse(root, 0, ""));

      // Convert to worksheet
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");

      // Trigger download
      XLSX.writeFile(workbook, "tasks_export.xlsx");
    } catch (err) {
      console.error("Export error:", err);
      alert("Error exporting to Excel");
    }
  };

  // --------------------------------------
  //  G) IMPORT from Excel
  //     (Simplified approach: each row becomes a top-level task)
  // --------------------------------------
  const [importFile, setImportFile] = useState(null);

  const handleImportChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0]);
    }
  };

  const importFromExcel = async () => {
    if (!importFile) return;
    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const data = new Uint8Array(evt.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(worksheet);

          // Example approach: create top-level tasks for each row
          // You could parse a "Path" column if you want deeper hierarchy.
          for (const row of rows) {
            const name = row.Name || "Untitled";
            const status = row.Status || "Not Started";
            // POST to create top-level
            await axios.post(apiUrl, { name, status });
          }
          alert("Import completed!");
          setImportFile(null);
          fetchTestsTree();
        } catch (ex) {
          console.error("Import parse error:", ex);
          alert("Error parsing Excel file");
        }
      };
      reader.readAsArrayBuffer(importFile);
    } catch (err) {
      console.error("Import error:", err);
      alert("Error importing from Excel");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-3xl p-6 space-y-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold text-blue-500 text-center">
          {editingTest ? "Edit Task" : "Task Management (Unlimited Nesting)"}
        </h1>

        {/* (A) Create/Update Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            placeholder="Enter task name"
            className="w-full px-3 py-2 border rounded"
            rows={1}
            required
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="On Hold">On Hold</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Internal Dependency">Internal Dependency</option>
            <option value="External Dependency">External Dependency</option>
            <option value="Blocked">Blocked</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
          </select>
          <button
            type="submit"
            className={`w-full px-3 py-2 text-white rounded ${
              editingTest ? "bg-green-500" : "bg-blue-500"
            }`}
          >
            {editingTest ? "Update" : "Add Top-Level Task"}
          </button>
          {editingTest && (
            <button
              type="button"
              onClick={() => {
                setEditingTest(null);
                setTestName("");
                setStatus("Not Started");
              }}
              className="w-full px-3 py-2 text-white bg-gray-500 rounded"
            >
              Cancel
            </button>
          )}
        </form>

        {/* (B) Search Form */}
        <form onSubmit={handleSearch} className="space-y-3">
          <h2 className="text-xl font-semibold text-center">Search Tasks</h2>
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="Search by name"
            className="w-full px-3 py-2 border rounded"
          />
          <select
            value={searchStatus}
            onChange={(e) => setSearchStatus(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">All Statuses</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="On Hold">On Hold</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Internal Dependency">Internal Dependency</option>
            <option value="External Dependency">External Dependency</option>
            <option value="Blocked">Blocked</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
          </select>
          <div className="flex space-x-2">
            <input
              type="date"
              value={searchStartDate}
              onChange={(e) => setSearchStartDate(e.target.value)}
              className="w-1/2 px-3 py-2 border rounded"
            />
            <input
              type="date"
              value={searchEndDate}
              onChange={(e) => setSearchEndDate(e.target.value)}
              className="w-1/2 px-3 py-2 border rounded"
            />
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="w-1/2 px-3 py-2 text-white bg-purple-500 rounded"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleResetSearch}
              className="w-1/2 px-3 py-2 text-white bg-gray-500 rounded"
            >
              Reset
            </button>
          </div>
        </form>

        {/* (C) Error Message */}
        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* (D) Import/Export Section */}
        <div className="flex flex-col md:flex-row md:space-x-4 items-center">
          <div className="flex-1">
            <label className="block mb-1 font-semibold">
              Import from Excel:
            </label>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleImportChange}
              className="border p-1 rounded"
            />
            <button
              onClick={importFromExcel}
              className="ml-2 px-3 py-1 bg-blue-500 text-white rounded"
            >
              Import
            </button>
          </div>
          <div className="mt-3 md:mt-0">
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Export to Excel
            </button>
          </div>
        </div>

        {/* (C) Sub-task creation form */}
        <div className="p-4 bg-gray-50 rounded space-y-4">
          <h3 className="text-center font-semibold">Create Sub-Task</h3>
          <form onSubmit={handleCreateSubTask} className="space-y-2">
            <select
              value={parentForSubTask?._id || ""}
              onChange={(e) => {
                const selectedParent = testsTree.find(
                  (t) => t._id === e.target.value
                );
                setParentForSubTask(selectedParent || null);
              }}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Select Parent Task</option>
              {testsTree.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={subTaskName}
              onChange={(e) => setSubTaskName(e.target.value)}
              placeholder="Sub-task Name"
              className="w-full px-3 py-2 border rounded"
              required
            />
            <select
              value={subTaskStatus}
              onChange={(e) => setSubTaskStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="On Hold">On Hold</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Internal Dependency">Internal Dependency</option>
              <option value="External Dependency">External Dependency</option>
              <option value="Blocked">Blocked</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
            </select>
            <button
              type="submit"
              className="w-full px-3 py-2 text-white bg-blue-500 rounded"
            >
              Add Sub-Task
            </button>
          </form>
        </div>

        {/* (E) Display the nested tasks */}
        <div>
          <h2 className="text-xl font-semibold text-center">Nested Tasks:</h2>
          {testsTree.length === 0 ? (
            <p className="mt-2 text-center text-gray-500">No tasks found.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {testsTree.map((root) => (
                <TestItem
                  key={root._id}
                  node={root}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                  refreshTree={fetchTestsTree}
                  apiUrl={apiUrl}
                  level={0}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default TestManagement;

/**
 * TestItem component (recursive)
 * - Each item is rendered in an inline "card"
 * - Different background color by level
 * - Inline add sub-task form
 * - Inline edit form
 */
function TestItem({
  node,
  handleEdit,
  handleDelete,
  refreshTree,
  apiUrl,
  level,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Inline form for adding a new sub-task
  const [showSubForm, setShowSubForm] = useState(false);
  const [subName, setSubName] = useState("");
  const [subStatus, setSubStatus] = useState("Not Started");

  // Inline editing for THIS node
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [editName, setEditName] = useState(node.name);
  const [editStatus, setEditStatus] = useState(node.status);

  const subCount = node.subTasks?.length || 0;

  // Generate a background color based on level
  const bgColorClass = getLevelBg(level);

  // Expand/collapse
  const toggleExpand = () => setIsExpanded(!isExpanded);

  // Save a new sub-task
  const handleAddSubTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${apiUrl}/${node._id}/subtask`, {
        name: subName,
        status: subStatus,
      });
      setSubName("");
      setSubStatus("Not Started");
      setShowSubForm(false);
      refreshTree(); // re-fetch
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || err.message);
    }
  };

  // Inline update for THIS node
  const handleSaveInlineEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${apiUrl}/${node._id}`, {
        name: editName,
        status: editStatus,
      });
      setIsEditingInline(false);
      refreshTree();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || err.message);
    }
  };

  return (
    <li
      className={`border-l-4 border-gray-300 p-2 rounded ${bgColorClass}`}
      style={{ marginLeft: level * 20 }}
    >
      {isEditingInline ? (
        // --- INLINE EDIT MODE ---
        <form
          onSubmit={handleSaveInlineEdit}
          className="space-y-2 bg-white p-2 rounded shadow"
        >
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="border px-2 py-1 rounded w-full"
            required
          />
          <select
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value)}
            className="border px-2 py-1 rounded w-full"
          >
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="On Hold">On Hold</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Internal Dependency">Internal Dependency</option>
            <option value="External Dependency">External Dependency</option>
            <option value="Blocked">Blocked</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
          </select>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="px-3 py-1 bg-green-500 text-white rounded"
            >
              Save
            </button>
            <button
              type="button"
              className="px-3 py-1 bg-gray-500 text-white rounded"
              onClick={() => setIsEditingInline(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        // --- NORMAL VIEW MODE ---
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Expand/Collapse arrow if sub-tasks exist */}
            {subCount > 0 ? (
              <button
                onClick={toggleExpand}
                className="text-gray-600 focus:outline-none"
                style={{ background: "transparent", border: "none" }}
              >
                {isExpanded ? "▼" : "►"}
              </button>
            ) : (
              <span style={{ width: "1.2rem" }} />
            )}

            {/* Task Info */}
            <div>
              <div className="font-semibold">
                {node.name}{" "}
                {subCount > 0 && (
                  <span className="text-sm text-gray-500">
                    ({subCount} sub-task{subCount > 1 ? "s" : ""})
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-600">Status: {node.status}</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-2">
            {/* Inline edit button */}
            <button
              onClick={() => setIsEditingInline(true)}
              className="px-2 py-1 bg-yellow-500 text-white text-sm rounded"
            >
              Edit
            </button>

            {/* Alternatively, use the top-level form: */}
            {/* <button
              onClick={() => handleEdit(node)}
              className="px-2 py-1 bg-green-500 text-white text-sm rounded"
            >
              Edit
            </button> */}

            <button
              onClick={() => handleDelete(node._id)}
              className="px-2 py-1 bg-red-500 text-white text-sm rounded"
            >
              Del
            </button>

            <button
              onClick={() => setShowSubForm(!showSubForm)}
              className="px-2 py-1 bg-blue-500 text-white text-sm rounded"
            >
              +Sub
            </button>
          </div>
        </div>
      )}

      {/* Inline sub-task creation form */}
      {showSubForm && (
        <div className="ml-6 mt-2">
          <form
            onSubmit={handleAddSubTask}
            className="space-y-2 bg-white p-2 rounded shadow"
          >
            <input
              type="text"
              value={subName}
              onChange={(e) => setSubName(e.target.value)}
              placeholder="Sub-task name"
              className="border px-2 py-1 rounded w-full"
              required
            />
            <select
              value={subStatus}
              onChange={(e) => setSubStatus(e.target.value)}
              className="border px-2 py-1 rounded w-full"
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="On Hold">On Hold</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Internal Dependency">Internal Dependency</option>
              <option value="External Dependency">External Dependency</option>
              <option value="Blocked">Blocked</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
            </select>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowSubForm(false)}
                className="px-3 py-1 bg-gray-500 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Children (recursive) */}
      {subCount > 0 && isExpanded && (
        <ul className="mt-2">
          {node.subTasks.map((child) => (
            <TestItem
              key={child._id}
              node={child}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              refreshTree={refreshTree}
              apiUrl={apiUrl}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

/**
 * Returns a Tailwind background color class based on the nesting level
 * (So deeper levels have a slightly darker background.)
 */
function getLevelBg(level) {
  switch (level) {
    case 0:
      return "bg-gray-50";
    case 1:
      return "bg-gray-100";
    case 2:
      return "bg-gray-200";
    case 3:
      return "bg-gray-300";
    case 4:
      return "bg-gray-400";
    default:
      return "bg-gray-400"; // you can cycle or keep going
  }
}
