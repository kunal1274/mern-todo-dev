import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import Modal from "react-modal";

// Optional: set up the root element for react-modal
Modal.setAppElement("#root");

/**
 * Flatten a nested tasks tree into an array so we can pick any parent
 * in the "Create Sub-Task" form if needed
 */
function flattenAll(nestedTasks) {
  const result = [];
  function traverse(node) {
    result.push(node);
    if (Array.isArray(node.subTasks)) {
      node.subTasks.forEach(traverse);
    }
  }
  nestedTasks.forEach(traverse);
  return result;
}

function TestManagement() {
  const [testsTree, setTestsTree] = useState([]);
  const [allTasks, setAllTasks] = useState([]);

  // Top-level creation
  const [testName, setTestName] = useState("");
  const [status, setStatus] = useState("Not Started");
  const [editingTest, setEditingTest] = useState(null);

  // Search
  const [searchName, setSearchName] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchStartDate, setSearchStartDate] = useState("");
  const [searchEndDate, setSearchEndDate] = useState("");

  // For errors
  const [error, setError] = useState("");

  // For import
  const [importFile, setImportFile] = useState(null);

  // For the sub-task modal
  const [subTaskModalOpen, setSubTaskModalOpen] = useState(false);
  const [subTaskParent, setSubTaskParent] = useState(null);
  const [subTaskName, setSubTaskName] = useState("");
  const [subTaskStatus, setSubTaskStatus] = useState("Not Started");

  // Backend base URL
  const apiUrl = import.meta.env.VITE_BACKEND_URL
    ? `${import.meta.env.VITE_BACKEND_URL}/tests`
    : "/api/v1/tests";

  // ------------------------------------
  // A) Fetch the entire tasks tree
  // ------------------------------------
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
        setAllTasks(flattenAll(res.data));
      } else {
        console.error("Expected array from /tree, got:", res.data);
        setTestsTree([]);
        setAllTasks([]);
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

  // ------------------------------------
  // B) Create or Update a top-level task
  // ------------------------------------
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

  const handleEdit = (test) => {
    setEditingTest(test);
    setTestName(test.name);
    setStatus(test.status || "Not Started");
  };

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

  // ------------------------------------
  // C) Quick complete toggle
  //    (circle checkbox => mark as completed or not)
  // ------------------------------------
  const handleToggleComplete = async (testItem) => {
    // If it's "Completed", revert to Not Started; else mark Completed
    const newStatus =
      testItem.status === "Completed" ? "Not Started" : "Completed";
    try {
      await axios.put(`${apiUrl}/${testItem._id}`, {
        name: testItem.name,
        status: newStatus,
      });
      fetchTestsTree();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || err.message);
    }
  };

  // ------------------------------------
  // D) Searching
  // ------------------------------------
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

  // ------------------------------------
  // E) Export to Excel
  // ------------------------------------
  const exportToExcel = () => {
    try {
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

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");
      XLSX.writeFile(workbook, "tasks_export.xlsx");
    } catch (err) {
      console.error("Export error:", err);
      alert("Error exporting to Excel");
    }
  };

  // ------------------------------------
  // F) Import from Excel
  // ------------------------------------
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

          // Create top-level tasks for each row
          for (const row of rows) {
            const name = row.Name || "Untitled";
            const status = row.Status || "Not Started";
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

  // ------------------------------------
  // G) Open sub-task modal
  // ------------------------------------
  const openSubTaskModal = (parentTest) => {
    setSubTaskParent(parentTest);
    setSubTaskName("");
    setSubTaskStatus("Not Started");
    setSubTaskModalOpen(true);
  };
  const closeSubTaskModal = () => {
    setSubTaskModalOpen(false);
  };

  const handleSubTaskSubmit = async (e) => {
    e.preventDefault();
    if (!subTaskParent) return;
    try {
      await axios.post(`${apiUrl}/${subTaskParent._id}/subtask`, {
        name: subTaskName,
        status: subTaskStatus,
      });
      fetchTestsTree();
      setSubTaskModalOpen(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-4xl p-6 space-y-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold text-blue-500 text-center">
          {editingTest ? "Edit Task" : "Tasks - Unlimited Nesting"}
        </h1>

        {/* A) Create/Update Form (Top-Level) */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              placeholder="Enter a task name"
              className="flex-1 px-3 py-2 border rounded"
              required
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-40 px-2 py-1 border rounded"
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className={`px-4 py-2 text-white rounded ${
                editingTest ? "bg-green-500" : "bg-blue-500"
              }`}
            >
              {editingTest ? "Update" : "Add Task"}
            </button>
            {editingTest && (
              <button
                type="button"
                onClick={() => {
                  setEditingTest(null);
                  setTestName("");
                  setStatus("Not Started");
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* B) Search Form */}
        <form onSubmit={handleSearch} className="space-y-3">
          <h2 className="text-xl font-semibold text-center">Search Tasks</h2>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Search by name"
              className="flex-1 px-3 py-2 border rounded"
            />
            <select
              value={searchStatus}
              onChange={(e) => setSearchStatus(e.target.value)}
              className="w-40 px-2 py-1 border rounded"
            >
              <option value="">All Statuses</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <input
              type="date"
              value={searchStartDate}
              onChange={(e) => setSearchStartDate(e.target.value)}
              className="flex-1 px-3 py-2 border rounded"
            />
            <input
              type="date"
              value={searchEndDate}
              onChange={(e) => setSearchEndDate(e.target.value)}
              className="flex-1 px-3 py-2 border rounded"
            />
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex-1 px-3 py-2 text-white bg-purple-500 rounded"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleResetSearch}
              className="flex-1 px-3 py-2 text-white bg-gray-500 rounded"
            >
              Reset
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* Import/Export */}
        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
          <div className="flex items-center">
            <label className="block mr-2 font-semibold">Import:</label>
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
              Go
            </button>
          </div>
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Export
          </button>
        </div>

        {/* The tasks container (scrollable if very wide) */}
        <div
          className="border rounded bg-gray-50 p-3"
          style={{ maxWidth: "100%", overflowX: "auto" }}
        >
          <h2 className="text-xl font-semibold text-center mb-2">
            Nested Tasks
          </h2>
          {testsTree.length === 0 ? (
            <p className="mt-2 text-center text-gray-500">No tasks found.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {testsTree.map((root) => (
                <TaskItem
                  key={root._id}
                  item={root}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleComplete={handleToggleComplete}
                  onAddSubTask={openSubTaskModal}
                  level={0}
                />
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Modal for creating sub-task */}
      <Modal
        isOpen={subTaskModalOpen}
        onRequestClose={closeSubTaskModal}
        contentLabel="Create Sub-Task"
        className="relative m-auto max-w-md bg-white p-6 rounded shadow"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-xl font-bold mb-4">Create Sub-Task</h2>
        <p className="text-sm text-gray-600 mb-4">
          Parent: <strong>{subTaskParent?.name}</strong>
        </p>
        <form onSubmit={handleSubTaskSubmit} className="space-y-4">
          <input
            type="text"
            value={subTaskName}
            onChange={(e) => setSubTaskName(e.target.value)}
            placeholder="Sub-task name"
            className="border px-3 py-2 w-full rounded"
            required
          />
          <select
            value={subTaskStatus}
            onChange={(e) => setSubTaskStatus(e.target.value)}
            className="border px-3 py-2 w-full rounded"
          >
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Save
            </button>
            <button
              type="button"
              onClick={closeSubTaskModal}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default TestManagement;

/**
 * Single task item - recursive.
 * We'll use smaller indentation & a vertical line for connecting child tasks.
 */
function TaskItem({
  item,
  onEdit,
  onDelete,
  onToggleComplete,
  onAddSubTask,
  level,
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = (item.subTasks && item.subTasks.length > 0) || false;

  // Minimal indentation: 10px * level
  // We also add a small left border line to connect tasks vertically
  const containerStyle = {
    marginLeft: level * 10,
    borderLeft: "2px solid #ccc",
    paddingLeft: "10px",
  };

  // Clicking the arrow toggles expand
  const toggleExpand = () => setExpanded(!expanded);

  return (
    <li style={containerStyle} className="pb-2">
      <div className="flex items-center bg-white hover:bg-gray-100 p-2 rounded transition">
        {/* Quick completion circle (checkbox style) */}
        <button
          onClick={() => onToggleComplete(item)}
          className="w-5 h-5 rounded-full border-2 border-gray-400 mr-2 flex items-center justify-center"
          style={{
            backgroundColor:
              item.status === "Completed" ? "#10b981" : "transparent",
          }}
        >
          {/* Show a check or empty */}
          {item.status === "Completed" && (
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>

        {/* Expand/Collapse arrow if has children */}
        {hasChildren ? (
          <button
            onClick={toggleExpand}
            className="mr-2 text-gray-500 focus:outline-none"
            style={{ background: "transparent", border: "none" }}
          >
            {expanded ? "▼" : "►"}
          </button>
        ) : (
          <span className="mr-2" style={{ width: "1rem" }} />
        )}

        {/* Task name & status */}
        <div className="flex-1">
          <div className="font-semibold">{item.name}</div>
          {hasChildren && (
            <div className="text-xs text-gray-500">
              ({item.subTasks.length} sub-task
              {item.subTasks.length > 1 ? "s" : ""})
            </div>
          )}
          <div className="text-xs text-gray-600">Status: {item.status}</div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(item)}
            className="px-2 py-1 bg-yellow-500 text-white text-sm rounded"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(item._id)}
            className="px-2 py-1 bg-red-500 text-white text-sm rounded"
          >
            Del
          </button>
          <button
            onClick={() => onAddSubTask(item)}
            className="px-2 py-1 bg-blue-500 text-white text-sm rounded"
          >
            +Sub
          </button>
        </div>
      </div>

      {/* Child tasks */}
      {hasChildren && expanded && (
        <ul className="ml-3 border-l-2 border-gray-200">
          {item.subTasks.map((child) => (
            <TaskItem
              key={child._id}
              item={child}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleComplete={onToggleComplete}
              onAddSubTask={onAddSubTask}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
