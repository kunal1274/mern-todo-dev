// client/src/App.jsx
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import NavigationTest from "../components/NavigationTest";
import validateBackendUrl from "../api/validate-url";

function TestManagement() {
  const [tests, setTests] = useState([]);
  const [testName, setTestName] = useState("");
  const [status, setStatus] = useState("Not Started"); // Default status
  const [editingTest, setEditingTest] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchStartDate, setSearchStartDate] = useState("");
  const [searchEndDate, setSearchEndDate] = useState("");
  const [error, setError] = useState(null);

  // *** NEW: State for sub-task creation ***
  const [subTaskName, setSubTaskName] = useState("");
  const [subTaskStatus, setSubTaskStatus] = useState("Not Started");
  const [parentForSubTask, setParentForSubTask] = useState(null);
  // *** END NEW ***

  //const apiUrl = "https://reliably-moving-dog.ngrok-free.app/api/v1/tests"; // Relative path for API
  // client/src/App.jsx
  //const apiUrl = process.env.REACT_APP_API_URL;
  const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/tests`;

  useEffect(() => {
    fetchTests();
    // eslint-disable-next-line
  }, []);

  const fetchTests = async () => {
    // console.log('VITE_PORT:', process.env.VITE_PORT);
    try {
      await validateBackendUrl();
    } catch (error) {
      console.error("URL Validation Failed:", error.message);
      alert(
        "Unable to connect to backend. Please check your URL configuration."
      );
      return; // Exit without proceeding further
    }

    try {
      // Build query parameters based on search inputs
      let query = "";
      if (searchName || searchStartDate || searchEndDate || searchStatus) {
        query += "?";
        const params = [];
        if (searchName) params.push(`name=${encodeURIComponent(searchName)}`);
        if (searchStartDate)
          params.push(`startDate=${encodeURIComponent(searchStartDate)}`);
        if (searchEndDate)
          params.push(`endDate=${encodeURIComponent(searchEndDate)}`);
        if (searchStatus)
          params.push(`status=${encodeURIComponent(searchStatus)}`);
        query += params.join("&");
      }
      console.log("API URL being used:", `${apiUrl}${query}`);

      const response = await axios.get(`${apiUrl}${query}`);
      //   console.log("API Response Data:", response.data); // Debug here
      //   //return;
      //   setTests(response.data);
      //   setError(null);
      // } catch (err) {
      //   console.error("Axios Fetch Error:", err);
      //   setError(err.response?.data?.msg || err.message);
      // }
      console.log("API Response Data:", response); // Log response
      console.log("API Response Data:", response.data); // Log response
      if (Array.isArray(response.data)) {
        setTests(response.data);
      } else {
        console.error("Expected an array but got:", response.data);
        setTests([]); // Reset to empty if the response isn't an array
      }
      setError(null);
    } catch (err) {
      console.error("Axios Fetch Error:", err);
      setError(err.response?.data?.msg || err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingTest) {
      // Update existing test
      try {
        await validateBackendUrl();
      } catch (error) {
        console.error("URL Validation Failed:", error.message);
        alert(
          "Unable to connect to backend. Please check your URL configuration."
        );
        return; // Exit without proceeding further
      }

      try {
        const response = await axios.put(`${apiUrl}/${editingTest._id}`, {
          name: testName,
          status,
        });
        setTests(
          tests.map((test) =>
            test._id === editingTest._id ? response.data : test
          )
        );
        setTestName("");
        setStatus("Not Started"); // Reset to default
        setEditingTest(null);
        setError(null);
      } catch (err) {
        console.error("Axios Update Error:", err);
        setError(err.response?.data?.msg || err.message);
      }
    } else {
      try {
        await validateBackendUrl();
      } catch (error) {
        console.error("URL Validation Failed:", error.message);
        alert(
          "Unable to connect to backend. Please check your URL configuration."
        );
        return; // Exit without proceeding further
      }

      // Create new test
      try {
        const response = await axios.post(apiUrl, { name: testName, status });
        setTests([response.data, ...tests]);
        setTestName("");
        setStatus("Not Started"); // Reset to default
        setError(null);
      } catch (err) {
        console.error("Axios Post Error:", err);
        setError(err.response?.data?.msg || err.message);
      }
    }
  };

  const handleEdit = (test) => {
    setEditingTest(test);
    setTestName(test.name);
  };

  const handleDelete = async (id) => {
    try {
      await validateBackendUrl();
    } catch (error) {
      console.error("URL Validation Failed:", error.message);
      alert(
        "Unable to connect to backend. Please check your URL configuration."
      );
      return; // Exit without proceeding further
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

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTests();
  };

  const handleResetSearch = () => {
    setSearchName("");
    setSearchStartDate("");
    setSearchEndDate("");
    fetchTests();
  };

  // *** NEW: handle creation of a sub-task ***
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
        {
          name: subTaskName,
          status: subTaskStatus,
        }
      );
      // If successful, refetch or directly update the UI
      await fetchTests(); // simplest approach: just refetch
      setSubTaskName("");
      setSubTaskStatus("Not Started");
      setParentForSubTask(null);
    } catch (err) {
      console.error("Axios SubTask Error:", err);
      setError(err.response?.data?.msg || err.message);
    }
  };
  // *** END NEW ***

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold text-blue-500 text-center">
          {editingTest ? "Edit Test" : "MERN App - Test Management"}
        </h1>

        {/* Form for Create and Update */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            //type="text"
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
              }}
              className="w-full px-3 py-2 text-white bg-gray-500 rounded"
            >
              Cancel
            </button>
          )}
        </form>

        {/* Search Form */}
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

        {/* 
          *** NEW: Sub-task creation form ***
          We choose a parent from a dropdown, then type a sub-task name/status
        */}
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
        {/* *** END NEW *** */}

        {/* Test Entries */}
        <div>
          <h2 className="text-xl font-semibold text-center">Test Entries:</h2>
          {Array.isArray(tests) && tests.length === 0 ? (
            <p className="mt-2 text-center text-gray-500">No tests found.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {Array.isArray(tests) &&
                tests.map((test) => (
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

// *** NEW: Simple arrow icons (or use an icon library) ***
function ArrowExpanded() {
  return <span className="mr-2 text-gray-500">▼</span>;
}

function ArrowCollapsed() {
  return <span className="mr-2 text-gray-500">►</span>;
}

/* 
  *** CHANGED:
  Accept a new prop: level (default 0).
  We'll remove "read more" logic to keep it minimal 
  and purely hierarchical. We'll also show a sub-task count 
  if there are child tasks.
*/
const TestItem = ({
  test,
  handleEdit,
  handleDelete,
  level = 0, // *** NEW: Depth of nesting
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // *** NEW: Just remove old "isOverflowing" & "read more" code
  // to keep a simpler layout

  // Indentation (e.g., 1.5rem per nesting level):
  const indentation = `${level * 1.5}rem`;

  // Toggle expansion
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Sub-task count
  const subTaskCount = test?.subTasks?.length || 0;
  console.log("line 568", test, test.subTasks);

  return (
    /* *** CHANGED: We’ll make each item more compact. *** */
    <li className="relative border-b last:border-none border-gray-200 py-2">
      <div className="flex items-center" style={{ marginLeft: indentation }}>
        {/* *** NEW: If subTasks exist, show arrow icon to collapse/expand *** */}
        {subTaskCount > 0 ? (
          isExpanded ? (
            <ArrowExpanded />
          ) : (
            <ArrowCollapsed />
          )
        ) : (
          // If no subTasks, just space the icon area so everything aligns
          <span style={{ width: "1.2rem", display: "inline-block" }} />
        )}

        {/* *** CHANGED: Task name in one line, plus sub-task count *** */}
        <div className="flex-1">
          <span className="font-semibold mr-2">{test.name}</span>
          {/* Show (X subtasks) if any */}
          {subTaskCount > 0 && (
            <span className="text-sm text-gray-500">
              ({subTaskCount} sub-task{subTaskCount > 1 ? "s" : ""})
            </span>
          )}

          {/* *** OPTIONAL: Show status inline or on the next line *** */}
          <div className="text-xs text-gray-600">Status: {test.status}</div>
        </div>

        {/* *** CHANGED: Put action buttons on the right *** */}
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

      {/* *** NEW: Expand sub-tasks if isExpanded *** */}
      {subTaskCount > 0 && isExpanded && (
        <ul className="mt-2">
          {test.subTasks.map((sub) => (
            <TestItem
              key={sub._id}
              test={sub}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              level={level + 1} // *** NEW: increase nesting level
            />
          ))}
        </ul>
      )}
    </li>
  );
};

const TestItemWorkingVersion = ({ test, handleEdit, handleDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const textRef = useRef(null);

  // Function to toggle the expanded state
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Check if text overflows the container
  useEffect(() => {
    if (textRef.current) {
      const element = textRef.current;
      setIsOverflowing(element.scrollHeight > element.clientHeight);
    }
  }, [test.name]);

  return (
    <li className="relative p-4 border rounded shadow-sm bg-white">
      <div className="flex flex-col h-full">
        {/* Test Name with Read More functionality */}
        <div className="flex-1">
          <h3 className="text-lg font-medium mb-2">
            {" "}
            {test?.name
              ? test.name.replace(/\n/g, " ").slice(0, 20)
              : "No name provided."}
          </h3>
          <p
            ref={textRef}
            className={`text-sm text-gray-500 overflow-hidden ${
              isExpanded ? "max-h-full" : "max-h-20"
            }`}
            style={{
              display: "-webkit-box",
              WebkitLineClamp: isExpanded ? "none" : 3,
              WebkitBoxOrient: "vertical",
              wordBreak: "break-word", // Ensures long text breaks into lines
              overflowWrap: "break-word", // Compatibility for older browsers
            }}
          >
            {test?.name || "No name provided."}
          </p>
          {/* {test.name && test.name.split("\n").length > 4 && (
            <button
              onClick={toggleExpand}
              className="mt-1 text-sm text-blue-500 hover:underline focus:outline-none"
            >
              {isExpanded ? "Read Less" : "Read More..."}
            </button>
          )} */}

          {isOverflowing && (
            <button
              onClick={toggleExpand}
              className="mt-1 text-sm text-blue-500 hover:underline focus:outline-none"
            >
              {isExpanded ? "Read Less" : "Read More"}
            </button>
          )}
        </div>

        <p className="text-sm text-gray-500">
          <strong>Status:</strong> : {test.status}
        </p>

        {/* Timestamps */}
        <div className="mt-2 text-sm text-gray-500">
          <strong>Created At:</strong>{" "}
          {new Date(test.createdAt).toLocaleString()}
        </div>
        <div className="mt-2 text-sm text-gray-500">
          {test.updatedAt && test.updatedAt !== test.createdAt && (
            <>
              <strong>Updated At:</strong>:{" "}
              {new Date(test.updatedAt).toLocaleString()}
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={() => handleEdit(test)}
            className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600 focus:outline-none"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(test._id)}
            className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none"
          >
            Delete
          </button>
        </div>

        {/* *** NEW: Display sub-tasks if they exist *** */}
        {Array.isArray(test.subTasks) && test.subTasks.length > 0 && (
          <div className="mt-4 ml-4 border-l-2 border-gray-300 pl-2">
            <h4 className="font-semibold">Sub-Tasks:</h4>
            <ul className="space-y-2">
              {test.subTasks.map((sub) => (
                <TestItem
                  // Re-use the same TestItem component, so it's recursive
                  key={sub._id}
                  test={sub}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                />
              ))}
            </ul>
          </div>
        )}
        {/* *** END NEW *** */}
      </div>
    </li>
  );
};

// export default TestItem;
