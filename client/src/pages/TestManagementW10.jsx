import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

// NEW: React Modal
import Modal from "react-modal";
Modal.setAppElement("#root");

/**
 * Flatten a nested tasks tree into an array for parent selection
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

  // For top-level creation
  const [testName, setTestName] = useState("");
  const [status, setStatus] = useState("Not Started");
  const [editingTest, setEditingTest] = useState(null);

  // Search
  const [searchName, setSearchName] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchStartDate, setSearchStartDate] = useState("");
  const [searchEndDate, setSearchEndDate] = useState("");

  // Sub-task creation form (dropdown version)
  const [subTaskName, setSubTaskName] = useState("");
  const [subTaskStatus, setSubTaskStatus] = useState("Not Started");
  const [parentForSubTask, setParentForSubTask] = useState(null);

  // NEW: State for the "Edit" Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editModalData, setEditModalData] = useState({
    _id: null,
    name: "",
    status: "Not Started",
    parent: null,
  });

  // NEW: State for the "Add Sub-Task" Modal
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [subModalParent, setSubModalParent] = useState(null);
  const [subModalName, setSubModalName] = useState("");
  const [subModalStatus, setSubModalStatus] = useState("Not Started");

  // For import/export errors
  const [error, setError] = useState("");
  const [importFile, setImportFile] = useState(null);

  // CHANGED: Base API
  const apiUrl = import.meta.env.VITE_BACKEND_URL
    ? `${import.meta.env.VITE_BACKEND_URL}/tests`
    : "/api/v1/tests";

  // ---------------------------------------
  // A) Fetch /tree
  // ---------------------------------------
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

  // ---------------------------------------
  // B) Create or Update top-level tasks
  // ---------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTest) {
        // Simple update (top-level only)
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
    // inline approach replaced by modal approach => we open the modal
    openEditModal(test);
  };

  const handleDelete = async (testId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await axios.delete(`${apiUrl}/${testId}`);
      fetchTestsTree();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || err.message);
    }
  };

  // ---------------------------------------
  // C) Searching
  // ---------------------------------------
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

  // ---------------------------------------
  // D) Create Sub-Task (dropdown version)
  // ---------------------------------------
  const handleCreateSubTask = async (e) => {
    e.preventDefault();
    if (!parentForSubTask) {
      alert("No parent selected for sub-task creation.");
      return;
    }
    try {
      await axios.post(`${apiUrl}/${parentForSubTask._id}/subtask`, {
        name: subTaskName,
        status: subTaskStatus,
      });
      setSubTaskName("");
      setSubTaskStatus("Not Started");
      setParentForSubTask(null);
      fetchTestsTree();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || err.message);
    }
  };

  // ---------------------------------------
  // E) Export to Excel
  // ---------------------------------------
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
        if (node.subTasks) {
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

  // ---------------------------------------
  // F) Import from Excel
  // ---------------------------------------
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

  // ---------------------------------------
  // G) Toggle completion circle
  // ---------------------------------------
  const handleToggleComplete = async (task) => {
    const newStatus = task.status === "Completed" ? "Not Started" : "Completed";
    try {
      // calls your new route: PUT /:id/toggle-complete
      await axios.put(`${apiUrl}/${task._id}/toggle-complete`, {
        newStatus,
      });
      fetchTestsTree();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || err.message);
    }
  };

  // ---------------------------------------
  // H) Modal: Edit Task (with ability to re-parent)
  // ---------------------------------------
  const openEditModal = (task) => {
    setEditModalData({
      _id: task._id,
      name: task.name,
      status: task.status,
      parent: task.parent || null, // if you stored parent in doc
    });
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
  };

  const handleSaveEditModal = async (e) => {
    e.preventDefault();
    try {
      const { _id, name, status, parent } = editModalData;
      // If you want re-parenting, pass `parent` to backend too
      // For now, we assume just name/status
      await axios.put(`${apiUrl}/${_id}`, { name, status, parent });
      setEditModalOpen(false);
      fetchTestsTree();
    } catch (err) {
      console.error(err);
      alert("Error editing task");
    }
  };

  // ---------------------------------------
  // I) Modal: Add Sub-Task
  // ---------------------------------------
  const openSubModal = (parentTask) => {
    setSubModalParent(parentTask);
    setSubModalName("");
    setSubModalStatus("Not Started");
    setSubModalOpen(true);
  };

  const closeSubModal = () => {
    setSubModalOpen(false);
  };

  const handleSaveSubModal = async (e) => {
    e.preventDefault();
    if (!subModalParent) return;
    try {
      await axios.post(`${apiUrl}/${subModalParent._id}/subtask`, {
        name: subModalName,
        status: subModalStatus,
      });
      setSubModalOpen(false);
      fetchTestsTree();
    } catch (err) {
      console.error(err);
      alert("Error saving sub-task in modal");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
      {/* Edit Task Modal */}
      <Modal
        isOpen={editModalOpen}
        onRequestClose={closeEditModal}
        className="relative max-w-md bg-white p-6 rounded shadow m-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-xl font-bold mb-4">Edit Task (Modal)</h2>
        <form onSubmit={handleSaveEditModal} className="space-y-3">
          <input
            type="text"
            value={editModalData.name}
            onChange={(e) =>
              setEditModalData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="border px-3 py-2 w-full rounded"
            required
          />
          <select
            value={editModalData.status}
            onChange={(e) =>
              setEditModalData((prev) => ({ ...prev, status: e.target.value }))
            }
            className="border px-3 py-2 w-full rounded"
          >
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Internal Dependency">Internal Dependency</option>
            <option value="External Dependency">External Dependency</option>
            <option value="Blocked">Blocked</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          {/* If you want re-parenting, add a dropdown with allTasks */}

          <select
            value={editModalData.parent?._id || ""}
            onChange={(e) => {
              const newParent = allTasks.find((t) => t._id === e.target.value);
              setEditModalData((prev) => ({
                ...prev,
                parent: newParent || null,
              }));
            }}
            className="border px-3 py-2 w-full rounded"
          >
            <option value="">No parent (top-level)</option>
            {allTasks.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
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
              onClick={closeEditModal}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Sub-Task (Modal) */}
      <Modal
        isOpen={subModalOpen}
        onRequestClose={closeSubModal}
        className="relative max-w-md bg-white p-6 rounded shadow m-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-xl font-bold mb-4">Create Sub-Task (Modal)</h2>
        {subModalParent && (
          <p className="text-sm mb-2 text-gray-600">
            Parent: <strong>{subModalParent.name}</strong>
          </p>
        )}
        <form onSubmit={handleSaveSubModal} className="space-y-3">
          <input
            type="text"
            value={subModalName}
            onChange={(e) => setSubModalName(e.target.value)}
            placeholder="Sub-task name"
            className="border px-3 py-2 w-full rounded"
            required
          />
          <select
            value={subModalStatus}
            onChange={(e) => setSubModalStatus(e.target.value)}
            className="border px-3 py-2 w-full rounded"
          >
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Internal Dependency">Internal Dependency</option>
            <option value="External Dependency">External Dependency</option>
            <option value="Blocked">Blocked</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
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
              onClick={closeSubModal}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <div className="w-full max-w-xl p-6 space-y-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold text-blue-500 text-center">
          {editingTest ? "Edit Task" : "Nested Tasks Management"}
        </h1>

        {/* Top-level create */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            placeholder="Enter task name"
            className="w-full px-3 py-2 border rounded"
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
            <option value="On Hold">On Hold</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Internal Dependency">Internal Dependency</option>
            <option value="External Dependency">External Dependency</option>
            <option value="Blocked">Blocked</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <div className="flex space-x-2">
            <button
              type="submit"
              className={`flex-1 px-3 py-2 text-white rounded ${
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
                className="flex-1 px-3 py-2 text-white bg-gray-500 rounded"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Search Form */}
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
            <option value="On Hold">On Hold</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Internal Dependency">Internal Dependency</option>
            <option value="External Dependency">External Dependency</option>
            <option value="Blocked">Blocked</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
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

        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* Import / Export */}
        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
          <div className="flex items-center">
            <label className="block font-semibold mr-2">Import:</label>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
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

        {/* Sub-task creation form (dropdown approach) */}
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-lg font-semibold text-center">
            Create Sub-Task (Dropdown)
          </h3>
          <form onSubmit={handleCreateSubTask} className="space-y-2 mt-2">
            <select
              value={parentForSubTask?._id || ""}
              onChange={(e) => {
                const selectedParent = allTasks.find(
                  (t) => t._id === e.target.value
                );
                setParentForSubTask(selectedParent || null);
              }}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Select Parent Task</option>
              {allTasks.map((t) => (
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
              <option value="On Hold">On Hold</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Internal Dependency">Internal Dependency</option>
              <option value="External Dependency">External Dependency</option>
              <option value="Blocked">Blocked</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <button
              type="submit"
              className="w-full px-3 py-2 text-white bg-blue-500 rounded"
            >
              Add Sub-Task
            </button>
          </form>
        </div>

        {/* The tasks container => horizontal scroll so deep tasks won't vanish */}
        <div
          className="border rounded bg-gray-100 p-3"
          style={{
            overflowX: "auto",
            overflowY: "auto",
            whiteSpace: "pre-wrap",
          }}
        >
          <h2 className="text-xl font-semibold mb-2 text-center">
            All Nested Tasks
          </h2>
          {testsTree.length === 0 ? (
            <p className="mt-2 text-center text-gray-500">No tasks found.</p>
          ) : (
            <div style={{ display: "inline-block", minWidth: "100%" }}>
              {testsTree.map((root) => (
                <TaskItem
                  key={root._id}
                  item={root}
                  level={0}
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onAddSubTask={openSubModal}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TestManagement;

const ExpandableIcon = ({ expanded }) => {
  return (
    <span>
      {expanded ? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
        >
          <path
            d="M6 9L12 15L18 9"
            stroke="#000"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
        >
          <path
            d="M9 6L15 12L9 18"
            stroke="#000"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
};

/**
 * The single TaskItem (recursive) with:
 * - A fixed width "card" so each level lines up
 * - A circle to toggle completion
 * - A button to open edit modal
 * - A button to open sub-task modal
 * - Also has an inline sub creation option if you want to keep it
 */
function TaskItem({
  item,
  level,
  onToggleComplete,
  onDelete,
  onEdit,
  onAddSubTask,
}) {
  const [expanded, setExpanded] = useState(false);

  // Optional inline sub creation
  const [showInlineSub, setShowInlineSub] = useState(false);
  const [inlineName, setInlineName] = useState("");
  const [inlineStatus, setInlineStatus] = useState("Not Started");

  const hasChildren = item.subTasks && item.subTasks.length > 0;

  // Minimal indentation: 20px per level
  // Also a fixed width "card" so deeper tasks align vertically
  const containerStyle = {
    display: "inline-block",
    verticalAlign: "top",
    minWidth: "250px", // each level = 250px wide
    marginLeft: level > 0 ? "20px" : "0px",
  };

  const circleStyle = {
    width: "1.2rem",
    height: "1.2rem",
    borderRadius: "9999px",
    border: "2px solid #999",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "0.5rem",
    backgroundColor: item.status === "Completed" ? "#10b981" : "transparent",
  };

  const toggleExpand = () => setExpanded(!expanded);

  const handleInlineSubSave = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/tests/${item._id}/subtask`, {
        name: inlineName,
        status: inlineStatus,
      });
      setShowInlineSub(false);
      setInlineName("");
      setInlineStatus("Not Started");
      window.location.reload(); // or your re-fetch approach
    } catch (err) {
      console.error(err);
      alert("Error creating sub-task inline");
    }
  };

  return (
    <div style={containerStyle} className="bg-white rounded shadow p-2 m-2">
      {/* Circle for toggling completion */}
      <button style={circleStyle} onClick={() => onToggleComplete(item)}>
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

      {/* Expand arrow if children */}
      {hasChildren ? (
        <button
          onClick={toggleExpand}
          style={{
            background: "transparent",
            border: "none",
            marginRight: "0.5rem",
          }}
        >
          <ExpandableIcon expanded={expanded} />
        </button>
      ) : (
        <span style={{ width: "1rem", display: "inline-block" }} />
      )}

      {/* Task name & status */}
      <span className="font-semibold">{item.name}</span>
      <div className="text-xs text-gray-500">
        Status: {item.status}
        {hasChildren && ` | ${item.subTasks.length} sub-task(s)`}
      </div>

      {/* Action Buttons */}
      <div className="mt-1 space-x-1">
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
          +Sub (Modal)
        </button>
        {/* <button
          onClick={() => setShowInlineSub(!showInlineSub)}
          className="px-2 py-1 bg-gray-200 text-sm rounded"
        >
          +Sub(Inline)
        </button> */}
      </div>

      {/* Inline sub creation */}
      {showInlineSub && (
        <div className="mt-2 p-2 border rounded bg-gray-50">
          <form onSubmit={handleInlineSubSave} className="space-y-2">
            <input
              type="text"
              value={inlineName}
              onChange={(e) => setInlineName(e.target.value)}
              placeholder="Sub-task name"
              className="border px-2 py-1 rounded w-full"
              required
            />
            <select
              value={inlineStatus}
              onChange={(e) => setInlineStatus(e.target.value)}
              className="border px-2 py-1 rounded w-full"
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Internal Dependency">Internal Dependency</option>
              <option value="External Dependency">External Dependency</option>
              <option value="Blocked">Blocked</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
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
                onClick={() => setShowInlineSub(false)}
                className="px-3 py-1 bg-gray-500 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Show children horizontally if expanded */}
      {expanded && hasChildren && (
        <div className="mt-2">
          {item.subTasks.map((child) => (
            <TaskItem
              key={child._id}
              item={child}
              level={level + 1}
              onToggleComplete={onToggleComplete}
              onDelete={onDelete}
              onEdit={onEdit}
              onAddSubTask={onAddSubTask}
            />
          ))}
        </div>
      )}
    </div>
  );
}
