// CHANGED or NEW: See inline comments starting with // NEW or // CHANGED

import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

// NEW: For the modal popup
import Modal from "react-modal";
// Must set the app element for accessibility
Modal.setAppElement("#root");

/**
 * Flatten the nested tasks so we can select any parent in forms
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

/**
 * MAIN COMPONENT
 */
function TestManagement() {
  const [testsTree, setTestsTree] = useState([]);
  const [allTasks, setAllTasks] = useState([]);

  // Top-level create/edit
  const [testName, setTestName] = useState("");
  const [status, setStatus] = useState("Not Started");
  const [editingTest, setEditingTest] = useState(null);

  // Search
  const [searchName, setSearchName] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchStartDate, setSearchStartDate] = useState("");
  const [searchEndDate, setSearchEndDate] = useState("");

  // For separate sub-task creation form
  const [subTaskName, setSubTaskName] = useState("");
  const [subTaskStatus, setSubTaskStatus] = useState("Not Started");
  const [parentForSubTask, setParentForSubTask] = useState(null);

  // For react-modal sub-task creation
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalParent, setModalParent] = useState(null);
  const [modalSubName, setModalSubName] = useState("");
  const [modalSubStatus, setModalSubStatus] = useState("Not Started");

  // Errors
  const [error, setError] = useState("");

  // Import
  const [importFile, setImportFile] = useState(null);

  // CHANGED: Base URL (as before)
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
  //    (Now supports setting a parent, if you want)
  // ------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTest) {
        // CHANGED: If user wants to re-parent the test, you can do that too
        // For simplicity, let's keep top-level creation as is.
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

  // CHANGED: We'll store the original parent in the editingTest, if needed
  const handleEdit = (test) => {
    setEditingTest(test);
    setTestName(test.name);
    setStatus(test.status || "Not Started");
  };

  // ------------------------------------
  // C) Delete
  // ------------------------------------
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
  // D) Search
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
  // E) Create a Sub-Task (Separate Form)
  // ------------------------------------
  const handleCreateSubTask = async (e) => {
    e.preventDefault();
    if (!parentForSubTask) {
      alert("No parent test selected.");
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

  // ------------------------------------
  // F) Export to Excel
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

  // ------------------------------------
  // G) Import from Excel
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

          // Quick approach: each row => new top-level
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

  // NEW: Toggle completion calls `PUT /:id/toggle-complete`
  const handleToggleComplete = async (taskItem) => {
    const newStatus =
      taskItem.status === "Completed" ? "Not Started" : "Completed";
    try {
      await axios.put(`${apiUrl}/${taskItem._id}/toggle-complete`, {
        newStatus,
      });
      fetchTestsTree();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || err.message);
    }
  };

  // NEW: Open a modal for sub-task creation instead of inline
  const [showModalInline, setShowModalInline] = useState(false); // if you want both inline + modal
  const openSubTaskModal = (parent) => {
    setModalParent(parent);
    setModalSubName("");
    setModalSubStatus("Not Started");
    setModalIsOpen(true);
  };
  const closeSubTaskModal = () => {
    setModalIsOpen(false);
  };
  const handleModalSubTaskSave = async (e) => {
    e.preventDefault();
    try {
      if (!modalParent) return;
      await axios.post(`${apiUrl}/${modalParent._id}/subtask`, {
        name: modalSubName,
        status: modalSubStatus,
      });
      setModalIsOpen(false);
      fetchTestsTree();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {/* NEW: React Modal for sub-task creation */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeSubTaskModal}
        contentLabel="Create Sub-Task"
        className="relative max-w-md bg-white p-6 rounded shadow m-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-xl font-bold mb-4">Create Sub-Task (Modal)</h2>
        {modalParent && (
          <p className="text-sm text-gray-600 mb-2">
            Parent: <strong>{modalParent.name}</strong>
          </p>
        )}
        <form onSubmit={handleModalSubTaskSave} className="space-y-4">
          <input
            type="text"
            value={modalSubName}
            onChange={(e) => setModalSubName(e.target.value)}
            placeholder="Sub-task name"
            className="border px-3 py-2 w-full rounded"
            required
          />
          <select
            value={modalSubStatus}
            onChange={(e) => setModalSubStatus(e.target.value)}
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

      <div className="w-full max-w-3xl p-6 space-y-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold text-blue-500 text-center">
          {editingTest ? "Edit Task" : "Task Management (Unlimited Nesting)"}
        </h1>

        {/* A) Create/Update Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            // CHANGED: switched from textarea to input for consistency
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

        {/* B) Search Form */}
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

        {/* E) Sub-task creation form (choose any parent) */}
        <div className="p-4 bg-gray-50 rounded space-y-4">
          <h3 className="text-center font-semibold">
            Create Sub-Task (Dropdown)
          </h3>
          <form onSubmit={handleCreateSubTask} className="space-y-2">
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
            </select>
            <button
              type="submit"
              className="w-full px-3 py-2 text-white bg-blue-500 rounded"
            >
              Add Sub-Task
            </button>
          </form>
        </div>

        {/* F) Display nested tasks (scrollable if wide) */}
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
                  onAddSubTask={(p) => openSubTaskModal(p)}
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

/**
 * Single TaskItem (recursive)
 *  - Always shows a circle for toggle completion
 *  - We can also do inline sub-task creation
 *  - We hide indentation lines on small screens (mobile)
 */
// NEW or CHANGED code is commented below
function TaskItem({
  item,
  onEdit,
  onDelete,
  onToggleComplete,
  onAddSubTask,
  level,
}) {
  const [expanded, setExpanded] = useState(false);
  const [inlineSub, setInlineSub] = useState(false); // old approach
  const [subName, setSubName] = useState("");
  const [subStatus, setSubStatus] = useState("Not Started");

  // Inline editing
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editStatus, setEditStatus] = useState(item.status);

  const hasChildren = item.subTasks && item.subTasks.length > 0;

  // NEW: Circle check for toggling completion
  const circleStyle = {
    width: "1.2rem",
    height: "1.2rem",
    borderRadius: "9999px",
    border: "2px solid #999",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "0.5rem",
    backgroundColor: item.status === "Completed" ? "#10b981" : "transparent",
  };

  // Minimal indentation. We'll also hide lines for mobile via a media query
  // See .mobile-line-hidden in the CSS snippet below
  const containerStyle = {
    marginLeft: level * 10,
    borderLeft: "2px solid #ccc",
    paddingLeft: "10px",
  };

  // Expand/collapse
  const toggleExpand = () => setExpanded(!expanded);

  const handleInlineSubSave = async (e) => {
    e.preventDefault();
    try {
      // same sub creation
      await axios.post(`/tests/${item._id}/subtask`, {
        name: subName,
        status: subStatus,
      });
      setInlineSub(false);
      setSubName("");
      setSubStatus("Not Started");
      // re-fetch
      window.location.reload(); // or pass a prop to re-fetch
    } catch (err) {
      console.error(err);
      alert("Error saving sub-task inline");
    }
  };

  const handleInlineEditSave = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/tests/${item._id}`, {
        name: editName,
        status: editStatus,
      });
      setIsEditing(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Error saving edit inline");
    }
  };

  return (
    <li style={containerStyle} className="pb-2 mobile-line-hidden">
      {isEditing ? (
        <form
          onSubmit={handleInlineEditSave}
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
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 bg-gray-500 text-white rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-center bg-white hover:bg-gray-100 p-2 rounded transition">
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
              className="mr-2 text-gray-500 focus:outline-none"
              style={{ background: "transparent", border: "none" }}
            >
              {expanded ? "▼" : "►"}
            </button>
          ) : (
            <span className="mr-2" style={{ width: "1rem" }} />
          )}

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

          {/* Actions: three-dots or normal? We'll do normal for now. */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditing(true)}
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
            {/* We can open a modal or inline */}
            <button
              onClick={() => onAddSubTask(item)}
              className="px-2 py-1 bg-blue-500 text-white text-sm rounded"
            >
              +Sub
            </button>
            {/* Or show the inline approach */}
            <button
              onClick={() => setInlineSub(!inlineSub)}
              className="px-2 py-1 bg-gray-300 text-sm rounded"
            >
              +Sub(Inline)
            </button>
          </div>
        </div>
      )}

      {/* Inline sub form */}
      {inlineSub && (
        <div className="ml-6 mt-2">
          <form
            onSubmit={handleInlineSubSave}
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
                onClick={() => setInlineSub(false)}
                className="px-3 py-1 bg-gray-500 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Children */}
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

export default TestManagement;

/**
 * getLevelBg with media query approach:
 * For a more mobile-friendly approach, you might hide or reduce lines on small screens.
 * We'll keep it simpler here.
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
    default:
      return "bg-gray-400";
  }
}

/* 
  Example CSS snippet (add in your global css) to hide lines on small screens:

  @media (max-width: 600px) {
    .mobile-line-hidden {
      border-left: none !important;
      margin-left: 0 !important;
    }
  }
*/
