// client/src/App.jsx
import { useEffect, useState , useRef} from "react";
import axios from "axios";
import NavigationTest from "../components/NavigationTest";

function TestManagement() {
  const [tests, setTests] = useState([]);
  const [testName, setTestName] = useState("");
  const [editingTest, setEditingTest] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [searchStartDate, setSearchStartDate] = useState("");
  const [searchEndDate, setSearchEndDate] = useState("");
  const [error, setError] = useState(null);

  //const apiUrl = "https://reliably-moving-dog.ngrok-free.app/api/v1/tests"; // Relative path for API
  // client/src/App.jsx
  //const apiUrl = process.env.REACT_APP_API_URL;
  const apiUrl = `${import.meta.env.VITE_BACKEND_LIVE_DEV_URL}/tests`;

  useEffect(() => {
    fetchTests();
    // eslint-disable-next-line
  }, []);

  const fetchTests = async () => {
    try {
      // Build query parameters based on search inputs
      let query = "";
      if (searchName || searchStartDate || searchEndDate) {
        query += "?";
        const params = [];
        if (searchName) params.push(`name=${encodeURIComponent(searchName)}`);
        if (searchStartDate)
          params.push(`startDate=${encodeURIComponent(searchStartDate)}`);
        if (searchEndDate)
          params.push(`endDate=${encodeURIComponent(searchEndDate)}`);
        query += params.join("&");
      }

      const response = await axios.get(`${apiUrl}${query}`);
      console.log("API Response Data:", response.data); // Debug here
      setTests(response.data);
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
        const response = await axios.put(`${apiUrl}/${editingTest._id}`, {
          name: testName,
        });
        setTests(
          tests.map((test) =>
            test._id === editingTest._id ? response.data : test
          )
        );
        setTestName("");
        setEditingTest(null);
        setError(null);
      } catch (err) {
        console.error("Axios Update Error:", err);
        setError(err.response?.data?.msg || err.message);
      }
    } else {
      // Create new test
      try {
        const response = await axios.post(apiUrl, { name: testName });
        setTests([response.data, ...tests]);
        setTestName("");
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

        {/* Test Entries */}
        <div>
          <h2 className="text-xl font-semibold text-center">Test Entries:</h2>
          {Array.isArray(tests) && tests.length === 0 ? (
            <p className="mt-2 text-center text-gray-500">No tests found.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {tests.map((test) => (
                // <li
                //   key={test._id}
                //   className="flex items-center justify-between p-3 border rounded"
                // >
                //   <div>
                //     <p className="text-lg font-medium">{test.name}</p>
                //     <p className="text-sm text-gray-500">
                //       Created At: {new Date(test.createdAt).toLocaleString()}
                //       {test.updatedAt && test.updatedAt !== test.createdAt && (
                //         <>
                //           , Updated At:{" "}
                //           {new Date(test.updatedAt).toLocaleString()}
                //         </>
                //       )}
                //     </p>
                //   </div>
                //   <div className="flex space-x-2">
                //     <button
                //       onClick={() => handleEdit(test)}
                //       className="px-3 py-1 text-white bg-green-500 rounded"
                //     >
                //       Edit
                //     </button>
                //     <button
                //       onClick={() => handleDelete(test._id)}
                //       className="px-3 py-1 text-white bg-red-500 rounded"
                //     >
                //       Delete
                //     </button>
                //   </div>
                // </li>
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


const TestItem = ({ test, handleEdit, handleDelete }) => {
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
          <h3 className="text-lg font-medium mb-2"> {test.name.replace(/\n/g, ' ').slice(0, 20)}</h3>
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
            {test.name || "No name provided."}
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

        {/* Timestamps */}
        <div className="mt-2 text-sm text-gray-500">
          Created At: {new Date(test.createdAt).toLocaleString()}
        </div>
        <div className="mt-2 text-sm text-gray-500">
          {test.updatedAt && test.updatedAt !== test.createdAt && (
            <>Updated At: {new Date(test.updatedAt).toLocaleString()}</>
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
      </div>
    </li>
  );
};