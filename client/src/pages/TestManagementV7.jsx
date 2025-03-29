// client/src/TestManagement.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

// 1) The main TestManagement component
function TestManagement() {
  const [testsTree, setTestsTree] = useState([]);
  const [testName, setTestName] = useState("");
  const [status, setStatus] = useState("Not Started");
  const [editingTest, setEditingTest] = useState(null);

  // Search state
  const [searchName, setSearchName] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchStartDate, setSearchStartDate] = useState("");
  const [searchEndDate, setSearchEndDate] = useState("");

  const [error, setError] = useState("");

  // Replace this with your actual backend URL
  const apiUrl = import.meta.env.VITE_BACKEND_URL
    ? `${import.meta.env.VITE_BACKEND_URL}/tests`
    : "/api/v1/tests";

  // ---------------------------
  //  A) Fetch the Tree
  // ---------------------------
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

      // Hit the /tests/tree route for unlimited nesting
      const response = await axios.get(`${apiUrl}/tree${query}`);
      if (Array.isArray(response.data)) {
        setTestsTree(response.data);
      } else {
        console.error("Expected an array from /tree, got:", response.data);
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

  // ---------------------------
  //  B) Create or Update a Test
  //  (for top-level tasks)
  // ---------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTest) {
        // Update existing
        const res = await axios.put(`${apiUrl}/${editingTest._id}`, {
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
      fetchTestsTree(); // re-fetch
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || err.message);
    }
  };

  // ---------------------------
  //  C) Edit
  // ---------------------------
  const handleEdit = (test) => {
    setEditingTest(test);
    setTestName(test.name);
    setStatus(test.status || "Not Started");
  };

  // ---------------------------
  //  D) Delete
  // ---------------------------
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

  // ---------------------------
  //  E) Search
  // ---------------------------
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-2xl p-6 space-y-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold text-blue-500 text-center">
          {editingTest ? "Edit Test" : "Test Management (Unlimited Nesting)"}
        </h1>

        {/* A) Form for creating or updating top-level tasks */}
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

        {/* Error Message */}
        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* C) Display the Tree */}
        <div>
          <h2 className="text-xl font-semibold text-center">Tasks (Nested):</h2>
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

/* 
  The recursive <TestItem> component:
  - Renders a single node (task)
  - Shows child count
  - Has an "Add Sub-Task" button that reveals a small inline form
  - Allows expand/collapse of child tasks
*/
function TestItem({
  node,
  handleEdit,
  handleDelete,
  refreshTree,
  apiUrl,
  level = 0,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Inline form for adding a new sub-task at this level
  const [showSubForm, setShowSubForm] = useState(false);
  const [subName, setSubName] = useState("");
  const [subStatus, setSubStatus] = useState("Not Started");

  const subCount = node.subTasks?.length || 0;

  const toggleExpand = () => setIsExpanded(!isExpanded);

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
      refreshTree(); // Re-fetch the entire tree
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || err.message);
    }
  };

  return (
    <li
      className="border-l border-gray-300 pl-3 pb-2"
      style={{ marginLeft: level * 1.25 + "rem" }}
    >
      {/* Main row: Expand toggle + name + status + actions */}
      <div className="flex items-center bg-gray-50 hover:bg-gray-100 p-2 rounded">
        {/* Expand/Collapse arrow if there are sub-tasks */}
        {subCount > 0 ? (
          <button
            onClick={toggleExpand}
            className="mr-2 text-gray-500 focus:outline-none"
            style={{ background: "transparent", border: "none" }}
          >
            {isExpanded ? "▼" : "►"}
          </button>
        ) : (
          <span style={{ width: "1.2rem" }} />
        )}

        {/* Task name and status */}
        <div className="flex-1">
          <span className="font-semibold mr-2">{node.name}</span>
          {subCount > 0 && (
            <span className="text-sm text-gray-500">
              ({subCount} sub-task{subCount > 1 ? "s" : ""})
            </span>
          )}
          <div className="text-xs text-gray-600">Status: {node.status}</div>
        </div>

        {/* Action buttons */}
        <button
          onClick={() => handleEdit(node)}
          className="px-2 py-1 text-white bg-green-500 rounded text-sm mr-1"
        >
          Edit
        </button>
        <button
          onClick={() => handleDelete(node._id)}
          className="px-2 py-1 text-white bg-red-500 rounded text-sm mr-1"
        >
          Del
        </button>
        <button
          onClick={() => setShowSubForm(!showSubForm)}
          className="px-2 py-1 text-white bg-blue-500 rounded text-sm"
        >
          Add Sub-Task
        </button>
      </div>

      {/* Inline sub-task creation form (toggle) */}
      {showSubForm && (
        <div className="ml-6 mt-2 mb-2">
          <form onSubmit={handleAddSubTask} className="space-y-2">
            <input
              type="text"
              value={subName}
              onChange={(e) => setSubName(e.target.value)}
              placeholder="Sub-task name"
              className="px-2 py-1 border rounded w-64"
              required
            />
            <select
              value={subStatus}
              onChange={(e) => setSubStatus(e.target.value)}
              className="px-2 py-1 border rounded"
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
              className="px-2 py-1 text-white bg-blue-600 rounded"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowSubForm(false)}
              className="px-2 py-1 text-white bg-gray-500 rounded ml-1"
            >
              Cancel
            </button>
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
