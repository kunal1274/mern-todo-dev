// client/src/TestManagement.jsx
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import validateBackendUrl from "../api/validate-url";

// The main TestManagement component
function TestManagement() {
  const [tests, setTests] = useState([]);
  const [testName, setTestName] = useState("");
  const [status, setStatus] = useState("Not Started"); // Default status
  const [editingTest, setEditingTest] = useState(null);

  // Search
  const [searchName, setSearchName] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchStartDate, setSearchStartDate] = useState("");
  const [searchEndDate, setSearchEndDate] = useState("");

  const [error, setError] = useState(null);

  // Sub-task creation
  const [subTaskName, setSubTaskName] = useState("");
  const [subTaskStatus, setSubTaskStatus] = useState("Not Started");
  const [parentForSubTask, setParentForSubTask] = useState(null);

  // Your base API URL
  const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/tests`;

  // Fetch tasks on mount
  useEffect(() => {
    fetchTests();
    // eslint-disable-next-line
  }, []);

  // 1) Fetch tests (with optional search)
  const fetchTests = async () => {
    try {
      await validateBackendUrl(); // optional check
    } catch (error) {
      console.error("URL Validation Failed:", error.message);
      alert(
        "Unable to connect to backend. Please check your URL configuration."
      );
      return;
    }

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

      const response = await axios.get(`${apiUrl}${query}`);
      if (Array.isArray(response.data)) {
        setTests(response.data);
      } else {
        console.error("Expected an array but got:", response.data);
        setTests([]);
      }
      setError(null);
    } catch (err) {
      console.error("Axios Fetch Error:", err);
      setError(err.response?.data?.msg || err.message);
    }
  };

  // 2) Create or Update a test
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingTest) {
      // Update existing test
      try {
        await validateBackendUrl();
      } catch (error) {
        console.error("URL Validation Failed:", error.message);
        alert("Unable to connect to backend.");
        return;
      }

      try {
        const response = await axios.put(`${apiUrl}/${editingTest._id}`, {
          name: testName,
          status,
        });
        // Update local state
        setTests(
          tests.map((test) =>
            test._id === editingTest._id ? response.data : test
          )
        );
        setTestName("");
        setStatus("Not Started");
        setEditingTest(null);
        setError(null);
      } catch (err) {
        console.error("Axios Update Error:", err);
        setError(err.response?.data?.msg || err.message);
      }
    } else {
      // Create new test
      try {
        await validateBackendUrl();
      } catch (error) {
        console.error("URL Validation Failed:", error.message);
        alert("Unable to connect to backend.");
        return;
      }

      try {
        const response = await axios.post(apiUrl, { name: testName, status });
        setTests([response.data, ...tests]);
        setTestName("");
        setStatus("Not Started");
        setError(null);
      } catch (err) {
        console.error("Axios Post Error:", err);
        setError(err.response?.data?.msg || err.message);
      }
    }
  };

  // 3) Edit an existing test (prefill form)
  const handleEdit = (test) => {
    setEditingTest(test);
    setTestName(test.name);
    setStatus(test.status || "Not Started");
  };

  // 4) Delete a test
  const handleDelete = async (id) => {
    try {
      await validateBackendUrl();
    } catch (error) {
      console.error("URL Validation Failed:", error.message);
      alert("Unable to connect to backend.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this test?")) {
      try {
        await axios.delete(`${apiUrl}/${id}`);
        setTests(tests.filter((test) => test._id !== id));
        setError(null);
      } catch (err) {
        console.error("Axios Delete Error:", err);
        setError(err.response?.data?.msg || err.message);
      }
    }
  };

  // 5) Searching
  const handleSearch = (e) => {
    e.preventDefault();
    fetchTests();
  };
  const handleResetSearch = () => {
    setSearchName("");
    setSearchStatus("");
    setSearchStartDate("");
    setSearchEndDate("");
    fetchTests();
  };

  // 6) Create a sub-task
  const handleCreateSubTask = async (e) => {
    e.preventDefault();
    if (!parentForSubTask) {
      alert("No parent test selected for sub-task creation.");
      return;
    }
    try {
      await validateBackendUrl();
      const response = await axios.post(
        `${apiUrl}/${parentForSubTask._id}/subtask`,
        { name: subTaskName, status: subTaskStatus }
      );
      // Re-fetch or update local state
      await fetchTests();
      setSubTaskName("");
      setSubTaskStatus("Not Started");
      setParentForSubTask(null);
    } catch (err) {
      console.error("Axios SubTask Error:", err);
      setError(err.response?.data?.msg || err.message);
    }
  };

  // 7) Identify top-level tasks (i.e. tasks that are NOT sub-tasks of another)
  //    Because we do a multi-level populate, each test has .subTasks
  //    but we only want to show "root" tasks in the main list.
  const topLevelTasks = (() => {
    const subTaskIds = new Set();
    tests.forEach((t) => {
      if (Array.isArray(t.subTasks)) {
        t.subTasks.forEach((sub) => subTaskIds.add(sub._id));
      }
    });
    return tests.filter((task) => !subTaskIds.has(task._id));
  })();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold text-blue-500 text-center">
          {editingTest ? "Edit Test" : "MERN App - Test Management"}
        </h1>

        {/* (A) Create/Update Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            placeholder="Enter test name"
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
            {editingTest ? "Update Test" : "Add Test"}
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
        <form onSubmit={handleSearch} className="space-y-4">
          <h2 className="text-xl font-semibold text-center">Search Tests</h2>
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
            <option value="">All</option>
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
        {error && (
          <p className="text-lg text-red-500 text-center">Error: {error}</p>
        )}

        {/* (C) Sub-task creation form */}
        <div className="p-4 bg-gray-50 rounded space-y-4">
          <h3 className="text-center font-semibold">Create Sub-Task</h3>
          <form onSubmit={handleCreateSubTask} className="space-y-2">
            <select
              value={parentForSubTask?._id || ""}
              onChange={(e) => {
                const selectedParent = tests.find(
                  (t) => t._id === e.target.value
                );
                setParentForSubTask(selectedParent || null);
              }}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Select Parent Task</option>
              {tests.map((t) => (
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

        {/* (D) Display the top-level tasks, each with recursive sub-tasks */}
        <div>
          <h2 className="text-xl font-semibold text-center">Test Entries:</h2>
          {Array.isArray(tests) && tests.length === 0 ? (
            <p className="mt-2 text-center text-gray-500">No tests found.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {Array.isArray(topLevelTasks) &&
                topLevelTasks.map((test) => (
                  <TestItem
                    key={test._id}
                    test={test}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
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

/* ===========================================
   TestItem (Recursive) Component
   - Expands/collapses nested subTasks
   - Recursively calls itself for sub-sub-tasks
=========================================== */

// Some simple icons (or use a library)
function ArrowExpanded() {
  return <span className="mr-1 text-gray-500">▼</span>;
}
function ArrowCollapsed() {
  return <span className="mr-1 text-gray-500">►</span>;
}

function TestItem({ test, handleEdit, handleDelete, level = 0 }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const subTaskCount = test.subTasks?.length || 0;
  const indentation = `${level * 1.5}rem`; // Indent child tasks

  return (
    <li
      className="relative border-b last:border-none border-gray-200 py-2"
      style={{ marginLeft: indentation }}
    >
      <div className="flex items-center">
        {/* If there are sub-tasks, show arrow to expand/collapse */}
        {subTaskCount > 0 ? (
          <button
            type="button"
            onClick={toggleExpand}
            className="mr-2 focus:outline-none cursor-pointer"
            style={{ background: "transparent", border: "none" }}
          >
            {isExpanded ? <ArrowExpanded /> : <ArrowCollapsed />}
          </button>
        ) : (
          // placeholder so everything aligns
          <span style={{ width: "1.2rem", display: "inline-block" }} />
        )}

        {/* Main text */}
        <div className="flex-1">
          <span className="font-semibold mr-2">{test.name}</span>
          {subTaskCount > 0 && (
            <span className="text-sm text-gray-500">
              ({subTaskCount} sub-task{subTaskCount > 1 ? "s" : ""})
            </span>
          )}
          <div className="text-xs text-gray-600">Status: {test.status}</div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2 ml-2">
          <button
            onClick={() => handleEdit(test)}
            className="px-2 py-1 text-white bg-green-500 rounded hover:bg-green-600 focus:outline-none text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(test._id)}
            className="px-2 py-1 text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none text-sm"
          >
            Del
          </button>
        </div>
      </div>

      {/* Recursively display sub-tasks if expanded */}
      {subTaskCount > 0 && isExpanded && (
        <ul className="mt-2">
          {test.subTasks.map((sub) => (
            <TestItem
              key={sub._id}
              test={sub}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export { TestItem };
