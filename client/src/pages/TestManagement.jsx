import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import Modal from "react-modal";
import { motion, AnimatePresence } from "framer-motion";
// import AnalogClock from "../components/AnalogClock";
// import SvgAnalogClock from "../components/svgAnalogClock";
// import DigitalClock from "../components/DigitalClock";
import ClockWidget from "../components/ClockWidget";
import SoberClock from "../components/SoberClock";
import TagChips from "./TaskManagement/TagChips";
import TagChips1 from "./TaskManagement/TagChipsAdv";
import HierarchicalTagAutocomplete from "./TaskManagement/HierarchicalTagAutocomplete";
import TaskTagSection from "./TaskManagement/TaskTagSection";
// import MetalClock from "../components/MetalClock";
// import WhiteClock from "../components/WhiteClock";
// import FancyClock from "../components/FancyClock";

Modal.setAppElement("#root");

/**
 * Flatten a nested tasks tree into a simple array so we can pick any for re-parenting
 */
// ----------------- Utility: Flatten Sub-Tasks -----------------
function flattenAll1(nested) {
  const res = [];
  function traverse(node) {
    res.push(node);
    if (Array.isArray(node.subTasks)) {
      node.subTasks.forEach(traverse);
    }
  }
  nested.forEach(traverse);
  return res;
}

function flattenAll(nested) {
  const res = [];
  function traverse(node, level = 0) {
    node._level = level; // Track nesting level
    res.push(node);
    if (Array.isArray(node.subTasks)) {
      node.subTasks.forEach((child) => traverse(child, level + 1));
    }
  }
  nested.forEach((root) => traverse(root, 0));
  return res;
}

// --------------- Utility: Count Nested Sub-Tasks ---------------
function countNestedSubtasks(node) {
  if (!node.subTasks || node.subTasks.length === 0) return 0;
  let total = node.subTasks.length;
  node.subTasks.forEach((child) => {
    total += countNestedSubtasks(child);
  });
  return total;
}
/**
 * Main "TestManagement" component
 *
 * Aligns with the advanced fields in your Test model:
 * - title, description, priority, status, etc.
 * - sub-tasks, parent references
 */

// --------------- Main Component ---------------
function TestManagement() {
  // ---------- State for tasks ----------
  // The "tree" of tasks
  const [testsTree, setTestsTree] = useState([]);
  // Flattened list for re-parenting or sub-task creation
  const [allTasks, setAllTasks] = useState([]);

  // For top-level creation
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("P3");
  const [status, setStatus] = useState("Not Started");

  // For multi-tag selection on create
  const [selectedTags, setSelectedTags] = useState([]);

  // Searching
  const [searchTitle, setSearchTitle] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchStartDate, setSearchStartDate] = useState("");
  const [searchEndDate, setSearchEndDate] = useState("");

  // Tag-based filtering
  const [searchTags, setSearchTags] = useState([]); // array of tag IDs

  // For a separate "Sub-Task" creation form using dropdown
  const [subTaskTitle, setSubTaskTitle] = useState("");
  const [subTaskStatus, setSubTaskStatus] = useState("Not Started");
  const [subTaskDescription, setSubTaskDescription] = useState("");
  const [subTaskPriority, setSubTaskPriority] = useState("P3");
  const [subTaskTags, setSubTaskTags] = useState([]); // multi-tag
  const [parentForSubTask, setParentForSubTask] = useState(null);

  // Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editModalData, setEditModalData] = useState({
    _id: null,
    title: "",
    description: "",
    priority: "P3",
    status: "Not Started",
    parent: null,
    tags: [],
  });

  const [subModalOpen, setSubModalOpen] = useState(false);
  const [subModalData, setSubModalData] = useState({
    parent: null,
    title: "",
    description: "",
    priority: "P3",
    status: "Not Started",
    tags: [],
  });

  // Errors, Import/Export
  const [error, setError] = useState("");
  const [importFile, setImportFile] = useState(null);

  // -------------- Tag Management -----------
  const [allTags, setAllTags] = useState([]); // Full list of tags
  const [tagName, setTagName] = useState("");
  const [tagParent, setTagParent] = useState(null);
  const [tagModalOpen, setTagModalOpen] = useState(false); // for creating new tags
  const [searchTagName, setSearchTagName] = useState("");

  // Toggle for "compact" vs. "detailed" task item display
  const [detailedView, setDetailedView] = useState(false);

  // --------------- Due Date Modal ---------------
  const [dueDateModalOpen, setDueDateModalOpen] = useState(false);
  const [dueDateModalData, setDueDateModalData] = useState({
    _id: null,
    dueDate: "",
    dueTime: "",
  });

  // --------------- Reminder Modal ---------------
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [reminderModalData, setReminderModalData] = useState({
    _id: null,
    reminder: "none", // e.g. 'dailyTime', 'weeklyTime', etc.
  });

  // --------------- Assign Modal ---------------
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignModalData, setAssignModalData] = useState({
    _id: null,
    assignedTo: "", // single user ID
    assignedToGroup: "", // single group ID
  });

  // --------------- Quick Level Filter ---------------
  const [filterLevel, setFilterLevel] = useState(""); // e.g. "", "0", "1", "2", etc.

  // CHANGED: Base API
  const apiUrl = import.meta.env.VITE_BACKEND_URL
    ? `${import.meta.env.VITE_BACKEND_URL}/tests`
    : "http://localhost:3001/api/v1/tests";

  const tagsApiUrl = import.meta.env.VITE_BACKEND_URL
    ? `${import.meta.env.VITE_BACKEND_URL}/tags`
    : "http://localhost:3001/api/v1/tags";

  // ------------------------------------
  // A) Fetch tasks /tree
  // ------------------------------------
  const fetchTestsTree = async () => {
    try {
      let query = "";
      const params = [];
      if (searchTitle) params.push(`title=${encodeURIComponent(searchTitle)}`);
      if (searchStatus)
        params.push(`status=${encodeURIComponent(searchStatus)}`);
      if (searchStartDate)
        params.push(`startDate=${encodeURIComponent(searchStartDate)}`);
      if (searchEndDate)
        params.push(`endDate=${encodeURIComponent(searchEndDate)}`);
      // If filtering by tags as well
      if (searchTags.length > 0) {
        // e.g. ?tags=tagId1,tagId2
        params.push(`tags=${searchTags.join(",")}`);
      }
      if (params.length > 0) {
        query = `?${params.join("&")}`;
      }

      const res = await axios.get(`${apiUrl}/tree${query}`);
      if (Array.isArray(res.data)) {
        //setTestsTree(res.data);
        //setAllTasks(flattenAll(res.data));

        // Flatten and store
        // Mark each node with ._level
        flattenAll(res.data).forEach((node) => {
          node._nestedSubCount = countNestedSubtasks(node);
          // immediate sub-tasks => node.subTasks?.length
        });
        setTestsTree(res.data);
        const fl = flattenAll(res.data);
        setAllTasks(fl);
      } else {
        setTestsTree([]);
        setAllTasks([]);
      }

      // 2) Fetch tags
      const tagsRes = await axios.get(tagsApiUrl);
      if (Array.isArray(tagsRes.data)) {
        setAllTags(tagsRes.data);
      } else {
        setAllTags([]);
      }
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || err.message);
    }
  };

  console.log("line 224 all tags", allTags);

  useEffect(() => {
    fetchTestsTree();
    // eslint-disable-next-line
  }, []);

  // ------------------------------------
  // B) Create or Update top-level
  // ------------------------------------
  const handleSubmitTopLevel = async (e) => {
    e.preventDefault();
    try {
      // If editModalData._id => we are editing top-level
      // But let's keep top-level creation separate from the "edit modal"
      // So for top-level, we just create a new doc
      await axios.post(apiUrl, {
        title,
        description,
        priority,
        status,
        tags: selectedTags, // multiple tag IDs
      });
      setTitle("");
      setDescription("");
      setPriority("P3");
      setStatus("Not Started");
      setSelectedTags([]);
      fetchTestsTree();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || err.message);
    }
  };

  // ------------------------------------
  // C) Searching
  // ------------------------------------
  const handleSearch = (e) => {
    e.preventDefault();
    fetchTestsTree();
  };
  const handleResetSearch = () => {
    setSearchTitle("");
    setSearchStatus("");
    setSearchStartDate("");
    setSearchEndDate("");
    setSearchTags([]); // reset
    fetchTestsTree();
  };

  // ------------------------------------
  // D) Sub-Task creation (dropdown approach)
  // ------------------------------------
  const handleCreateSubTask = async (e) => {
    e.preventDefault();
    if (!parentForSubTask) {
      alert("No parent selected");
      return;
    }
    try {
      await axios.post(`${apiUrl}/${parentForSubTask._id}/subtask`, {
        title: subTaskTitle,
        description: subTaskDescription,
        priority: subTaskPriority,
        status: subTaskStatus,
        tags: subTaskTags,
      });
      setSubTaskTitle("");
      setSubTaskStatus("Not Started");
      setSubTaskDescription("");
      setSubTaskTags([]);
      setParentForSubTask(null);
      fetchTestsTree();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || err.message);
    }
  };

  // ------------------------------------
  // E) Import / Export
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

          for (const row of rows) {
            const title = row.Title || "Untitled";
            const status = row.Status || "Not Started";
            const priority = row.Priority || "P3";
            // etc. if you want more fields
            // if row.Tags => parse them, etc.
            await axios.post(apiUrl, { title, status, priority });
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

  const exportToExcel = () => {
    try {
      const rows = [];
      const traverse = (node, level, path) => {
        const currentPath = path ? path + " > " + node.title : node.title;
        rows.push({
          Title: node.title,
          Status: node.status,
          Priority: node.priority,
          Tags: node.tags ? node.tags.map((t) => t.name).join(", ") : "",
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
  // F) Delete a Test
  // ------------------------------------
  const handleDelete = async (testId) => {
    //if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await axios.delete(`${apiUrl}/${testId}`);
      fetchTestsTree();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || err.message);
    }
  };

  // ------------------------------------
  // G) Toggle Completion
  // ------------------------------------
  const handleToggleComplete = async (task) => {
    const newStatus = task.status === "Completed" ? "Not Started" : "Completed";
    try {
      await axios.put(`${apiUrl}/${task._id}/toggle-complete`, {
        newStatus,
      });
      fetchTestsTree();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || err.message);
    }
  };

  // ------------------------------------
  // H) Edit Modal
  // ------------------------------------
  const openEditModal = (test) => {
    setEditModalData({
      _id: test._id,
      title: test.title || "",
      description: test.description || "",
      priority: test.priority || "P3",
      status: test.status || "Not Started",

      tags: test.tags ? test.tags.map((tg) => tg._id) : [],
      // We store parent as an ID (because test.parent might be an object or a string).
      parentId:
        typeof test.parent === "object"
          ? test.parent?._id || ""
          : test.parent || "",
    });
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
  };

  const handleSaveEditModal = async (e) => {
    e.preventDefault();
    try {
      const {
        _id,
        title,
        description,
        priority,
        status,
        parentId,
        tags = [],
      } = editModalData;

      const body = {
        title,
        description,
        priority,
        status,
        tags, // array of tag IDs
        parent: parentId ? parentId : null,
      };
      // // If re-parenting is allowed
      // if (parent?._id) {
      //   body.parent = parent._id;
      // } else {
      //   body.parent = null;
      // }

      await axios.put(`${apiUrl}/${_id}`, body);
      setEditModalOpen(false);
      fetchTestsTree();
    } catch (err) {
      console.error(err);
      alert("Error editing task");
    }
  };

  // Update multi-select tags in the edit modal
  const handleEditModalTagsChange = (e) => {
    const options = e.target.options;
    const selectedTagIds = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedTagIds.push(options[i].value);
      }
    }
    setEditModalData((prev) => ({ ...prev, tags: selectedTagIds }));
  };

  // ------------------------------------
  // I) Sub-Task Modal
  // ------------------------------------
  const openSubModal = (parentTest) => {
    setSubModalData({
      parent: parentTest,
      title: "",
      description: "",
      priority: "P3",
      status: "Not Started",
      tags: [],
    });
    setSubModalOpen(true);
  };

  const closeSubModal = () => {
    setSubModalOpen(false);
  };

  const handleSaveSubModal = async (e) => {
    e.preventDefault();
    if (!subModalData.parent) return;
    try {
      await axios.post(`${apiUrl}/${subModalData.parent._id}/subtask`, {
        title: subModalData.title,
        description: subModalData.description,
        priority: subModalData.priority,
        status: subModalData.status,
        parent: subModalData.parent,
        tags: subModalData.tags,
      });
      setSubModalOpen(false);
      fetchTestsTree();
    } catch (err) {
      console.error(err);
      alert("Error saving sub-task in modal");
    }
  };

  // Handle multi-select tags for sub tasks
  const handleSubModalTagsChange = (e) => {
    const options = e.target.options;
    const selectedTagIds = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedTagIds.push(options[i].value);
      }
    }
    setSubModalData((prev) => ({ ...prev, tags: selectedTagIds }));
  };

  // -------------- Tag CRUD --------------
  const [tagList, setTagList] = useState([]);
  const [tagParentList, setTagParentList] = useState(null);

  // open Tag creation modal
  const [createTagModalOpen, setCreateTagModalOpen] = useState(false);
  const [createTagName, setCreateTagName] = useState("");
  const [createTagParent, setCreateTagParent] = useState("");

  const openTagModal = () => {
    setCreateTagName("");
    setCreateTagParent("");
    setCreateTagModalOpen(true);
  };
  const closeTagModal = () => {
    setCreateTagModalOpen(false);
  };

  const handleCreateTag = async (e) => {
    e.preventDefault();
    if (!createTagName.trim()) {
      alert("Tag name is required");
      return;
    }
    try {
      await axios.post(tagsApiUrl, {
        name: createTagName,
        parent: createTagParent || null,
      });
      closeTagModal();
      fetchTestsTree(); // re-fetch tags
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Error creating tag");
    }
  };

  // Filter tasks by selected tag IDs
  const handleSearchTagsChange = (e) => {
    const options = e.target.options;
    const selectedTagIds = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedTagIds.push(options[i].value);
      }
    }
    setSearchTags(selectedTagIds);
  };

  // For the top-level new task "tags" multi-select
  const handleTopLevelTagsChange = (e) => {
    const options = e.target.options;
    const selectedTagIds = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedTagIds.push(options[i].value);
      }
    }
    setSelectedTags(selectedTagIds);
  };

  // Toggle Detailed vs. Compact view
  const toggleViewMode = () => setDetailedView(!detailedView);

  // =============== Due Date Modal ===============
  const openDueDateModal = (test) => {
    setDueDateModalData({
      _id: test._id,
      dueDate: test.dueDate || "",
      dueTime: test.dueTime || "",
    });
    setDueDateModalOpen(true);
  };
  const closeDueDateModal = () => setDueDateModalOpen(false);

  const handleSaveDueDate = async (e) => {
    e.preventDefault();
    const { _id, dueDate, dueTime } = dueDateModalData;
    try {
      await axios.put(`${testsApiUrl}/${_id}`, { dueDate, dueTime });
      setDueDateModalOpen(false);
      fetchTestsTree();
    } catch (err) {
      console.error(err);
      alert("Error setting due date/time");
    }
  };

  // =============== Reminder Modal ===============
  const openReminderModal = (test) => {
    setReminderModalData({
      _id: test._id,
      reminder: test.reminder || "none",
    });
    setReminderModalOpen(true);
  };
  const closeReminderModal = () => setReminderModalOpen(false);

  const handleSaveReminder = async (e) => {
    e.preventDefault();
    const { _id, reminder } = reminderModalData;
    try {
      await axios.put(`${testsApiUrl}/${_id}`, { reminder });
      setReminderModalOpen(false);
      fetchTestsTree();
    } catch (err) {
      console.error(err);
      alert("Error saving reminder");
    }
  };

  // =============== Assign Modal ===============
  const openAssignModal = (test) => {
    // In a real app, you would fetch user lists, group lists, etc.
    setAssignModalData({
      _id: test._id,
      assignedTo: test.assignedTo || "",
      assignedToGroup: test.assignedToGroup || "",
    });
    setAssignModalOpen(true);
  };
  const closeAssignModal = () => setAssignModalOpen(false);

  const handleSaveAssign = async (e) => {
    e.preventDefault();
    const { _id, assignedTo, assignedToGroup } = assignModalData;
    try {
      await axios.put(`${testsApiUrl}/${_id}`, {
        assignedTo,
        assignedToGroup,
      });
      setAssignModalOpen(false);
      fetchTestsTree();
    } catch (err) {
      console.error(err);
      alert("Error assigning user/group");
    }
  };

  // “Self-assign”
  const handleSelfAssign = async (test) => {
    try {
      // Suppose the “logged in user ID” is "123" for demonstration
      await axios.put(`${testsApiUrl}/${test._id}`, { assignedTo: "123" });
      fetchTestsTree();
    } catch (err) {
      console.error(err);
      alert("Error self-assigning");
    }
  };

  // =============== Quick Filter by Level ===============
  const handleFilterLevelChange = (e) => {
    setFilterLevel(e.target.value);
  };

  // Only show tasks that match the filter level (if any)
  const filteredTestsTree = (() => {
    if (filterLevel === "") return testsTree;
    const targetLevel = parseInt(filterLevel, 10);
    // We'll do a simple function that prunes tasks above the target level
    const pruneByLevel = (node, level = 0) => {
      if (level > targetLevel) return null; // exclude
      if (!node.subTasks) return node;
      const prunedSub = [];
      node.subTasks.forEach((child) => {
        const prChild = pruneByLevel(child, level + 1);
        if (prChild) prunedSub.push(prChild);
      });
      return { ...node, subTasks: prunedSub };
    };
    return testsTree
      .map((root) => pruneByLevel(root, 0))
      .filter((x) => x !== null);
  })();

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4 space-y-4">
      {/* 1) DueDateModal */}
      <Modal
        isOpen={dueDateModalOpen}
        onRequestClose={closeDueDateModal}
        className="relative max-w-md bg-white p-6 rounded shadow m-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-xl font-bold mb-4">Set Due Date</h2>
        <form onSubmit={handleSaveDueDate} className="space-y-3">
          <label className="block font-semibold">Due Date</label>
          <input
            type="date"
            value={dueDateModalData.dueDate || ""}
            onChange={(e) =>
              setDueDateModalData((prev) => ({
                ...prev,
                dueDate: e.target.value,
              }))
            }
            className="border px-3 py-2 w-full rounded"
          />
          <label className="block font-semibold">Due Time</label>
          <input
            type="time"
            value={dueDateModalData.dueTime || ""}
            onChange={(e) =>
              setDueDateModalData((prev) => ({
                ...prev,
                dueTime: e.target.value,
              }))
            }
            className="border px-3 py-2 w-full rounded"
          />
          <div className="flex space-x-2 mt-3">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Save
            </button>
            <button
              type="button"
              onClick={closeDueDateModal}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* 2) ReminderModal */}
      <Modal
        isOpen={reminderModalOpen}
        onRequestClose={closeReminderModal}
        className="relative max-w-md bg-white p-6 rounded shadow m-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-xl font-bold mb-4">Set Reminder</h2>
        <form onSubmit={handleSaveReminder} className="space-y-3">
          <label className="block font-semibold">Reminder</label>
          <select
            value={reminderModalData.reminder}
            onChange={(e) =>
              setReminderModalData((prev) => ({
                ...prev,
                reminder: e.target.value,
              }))
            }
            className="border px-3 py-2 w-full rounded"
          >
            <option value="none">No Reminder</option>
            <option value="dailyTime">Daily at a specific time</option>
            <option value="weeklyTime">Weekly at a specific day/time</option>
            <option value="monthlyTime">Monthly time</option>
            <option value="fortnightlyTime">Fortnightly</option>
            <option value="every4Hours">Every 4 hours</option>
            <option value="every2Hours">Every 2 hours</option>
            <option value="every6Hours">Every 6 hours</option>
            <option value="every12Hours">Every 12 hours</option>
            <option value="every15Hours">Every 15 hours</option>
            <option value="every18Hours">Every 18 hours</option>
            <option value="custom">Custom schedule</option>
          </select>
          <div className="flex space-x-2 mt-3">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Save
            </button>
            <button
              type="button"
              onClick={closeReminderModal}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* 3) AssignModal */}
      <Modal
        isOpen={assignModalOpen}
        onRequestClose={closeAssignModal}
        className="relative max-w-md bg-white p-6 rounded shadow m-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-xl font-bold mb-4">Assign User / Group</h2>
        <form onSubmit={handleSaveAssign} className="space-y-3">
          <label className="block font-semibold">Assigned To (User ID?)</label>
          <input
            type="text"
            value={assignModalData.assignedTo}
            onChange={(e) =>
              setAssignModalData((prev) => ({
                ...prev,
                assignedTo: e.target.value,
              }))
            }
            placeholder="User ID"
            className="border px-3 py-2 w-full rounded"
          />
          <label className="block font-semibold">
            Assigned To Group (Group ID?)
          </label>
          <input
            type="text"
            value={assignModalData.assignedToGroup}
            onChange={(e) =>
              setAssignModalData((prev) => ({
                ...prev,
                assignedToGroup: e.target.value,
              }))
            }
            placeholder="Group ID"
            className="border px-3 py-2 w-full rounded"
          />

          <div className="flex space-x-2 mt-3">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Save
            </button>
            <button
              type="button"
              onClick={closeAssignModal}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* CREATE/EDIT TAG MODAL */}
      <Modal
        isOpen={createTagModalOpen}
        onRequestClose={closeTagModal}
        className="relative max-w-md bg-white p-6 rounded shadow m-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-xl font-bold mb-4">Create Tag</h2>
        <form onSubmit={handleCreateTag} className="space-y-3">
          <input
            type="text"
            value={createTagName}
            onChange={(e) => setCreateTagName(e.target.value)}
            placeholder="Tag Name"
            className="border px-3 py-2 w-full rounded"
            required
          />
          <select
            value={createTagParent}
            onChange={(e) => setCreateTagParent(e.target.value)}
            className="border px-3 py-2 w-full rounded"
          >
            <option value="">No parent (top-level tag)</option>
            {allTags.map((tg) => (
              <option key={tg._id} value={tg._id}>
                {tg.name}
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
              onClick={closeTagModal}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        isOpen={editModalOpen}
        onRequestClose={closeEditModal}
        className="relative max-w-md bg-white p-6 rounded shadow m-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-xl font-bold mb-4">Edit Task</h2>
        <form onSubmit={handleSaveEditModal} className="space-y-3">
          <input
            type="text"
            value={editModalData.title}
            onChange={(e) =>
              setEditModalData((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Title"
            className="border px-3 py-2 w-full rounded"
            required
          />
          <textarea
            value={editModalData.description}
            onChange={(e) =>
              setEditModalData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            rows={3}
            className="border px-3 py-2 w-full rounded"
            placeholder="Description..."
          />
          <select
            value={editModalData.priority}
            onChange={(e) =>
              setEditModalData((prev) => ({
                ...prev,
                priority: e.target.value,
              }))
            }
            className="border px-3 py-2 w-full rounded"
          >
            <option value="P1">P1</option>
            <option value="P2">P2</option>
            <option value="P3">P3</option>
            <option value="P4">P4</option>
          </select>
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
            <option value="Failed">Failed</option>
          </select>

          {/* Multi-select for tags */}
          <label className="block font-semibold">Tags</label>
          <select
            multiple
            value={editModalData.tags || []}
            onChange={handleEditModalTagsChange}
            className="border px-3 py-2 w-full rounded"
            style={{ height: "6rem" }}
          >
            {allTags.map((tg) => (
              <option key={tg._id} value={tg._id}>
                {tg.name}
              </option>
            ))}
          </select>

          {/* Re-parent dropdown */}
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
                {t.title}
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

      {/* SUB-TASK MODAL */}
      <Modal
        isOpen={subModalOpen}
        onRequestClose={closeSubModal}
        className="relative max-w-md bg-white p-6 rounded shadow m-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-xl font-bold mb-4">Create Sub-Task</h2>
        {subModalData.parent && (
          <p className="text-sm mb-2 text-gray-600">
            Parent: <strong>{subModalData.parent.title}</strong>
          </p>
        )}
        <form onSubmit={handleSaveSubModal} className="space-y-3">
          <input
            type="text"
            value={subModalData.title}
            onChange={(e) =>
              setSubModalData((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Sub-task title"
            className="border px-3 py-2 w-full rounded"
            required
          />
          <textarea
            value={subModalData.description}
            onChange={(e) =>
              setSubModalData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            rows={3}
            className="border px-3 py-2 w-full rounded"
            placeholder="Description..."
          />
          <select
            value={subModalData.priority}
            onChange={(e) =>
              setSubModalData((prev) => ({
                ...prev,
                priority: e.target.value,
              }))
            }
            className="border px-3 py-2 w-full rounded"
          >
            <option value="P1">P1</option>
            <option value="P2">P2</option>
            <option value="P3">P3</option>
            <option value="P4">P4</option>
          </select>
          <select
            value={subModalData.status}
            onChange={(e) =>
              setSubModalData((prev) => ({ ...prev, status: e.target.value }))
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
            <option value="Failed">Failed</option>
          </select>

          {/* Multi-select for tags */}
          <label className="block font-semibold">Tags</label>
          <select
            multiple
            value={subModalData.tags || []}
            onChange={handleSubModalTagsChange}
            className="border px-3 py-2 w-full rounded"
            style={{ height: "6rem" }}
          >
            {allTags.map((tg) => (
              <option key={tg._id} value={tg._id}>
                {tg.name}
              </option>
            ))}
          </select>

          <div className="flex space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded hover:bg-blue-600"
            >
              Save
            </button>
            <button
              type="button"
              onClick={closeSubModal}
              className="px-4 py-2 bg-black text-white rounded hover:bg-blue-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <div className="w-full max-w-4xl p-6 space-y-6 bg-white rounded shadow">
        {/* <div className="flex items-center justify-center space-x-5">
          <div style={{ width: 175, height: 175 }}>
            <SvgAnalogClock />
          </div>
           <div>
          <DigitalClock />
        </div> 
         <div className="">
          <AnalogClock />
        </div> 
          <div style={{ padding: "0.2em" }}>
            <ClockWidget />
          </div>
        </div> */}
        {/* <div style={{ minHeight: "100vh" }}>
          <FancyClock />
        </div> */}

        <div
          className="flex flex-row items-center justify-center space-x-5 sticky top-1 z-50"
          style={{
            transform: "scale(0.50)",
            transformOrigin: "top",
            marginBottom: "-0.5rem",
          }}
        >
          {/* <div className="w-36 h-36">
            <SvgAnalogClock />
          </div> */}

          <div className="">
            <SoberClock />
          </div>

          <div className="">
            <ClockWidget />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-black text-center">
          Advanced Task Management
        </h1>

        {/* TOP-LEVEL CREATE */}
        <form onSubmit={handleSubmitTopLevel} className="space-y-3">
          <div>
            <label className="block font-semibold mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Short description..."
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div className="flex space-x-2">
            <div className="flex-1">
              <label className="block font-semibold mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="P1">P1</option>
                <option value="P2">P2</option>
                <option value="P3">P3</option>
                <option value="P4">P4</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block font-semibold mb-1">Status</label>
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
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Multi-select tags for top-level creation */}
          <label className="block font-semibold">Tags</label>
          <select
            multiple
            value={selectedTags}
            onChange={handleTopLevelTagsChange}
            className="border px-3 py-2 w-full rounded"
            style={{ height: "6rem" }}
          >
            {allTags.map((tag) => (
              <option key={tag._id} value={tag._id}>
                {tag.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-black rounded hover:bg-blue-600"
          >
            Create Top-Level Task
          </button>
        </form>

        {/* SEARCH */}
        <form onSubmit={handleSearch} className="space-y-3">
          <h2 className="text-xl font-semibold text-center">Search Tasks</h2>
          <input
            type="text"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            placeholder="Search by title"
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
            <option value="Failed">Failed</option>
          </select>

          {/* Filter by tags: multi-select */}
          <label className="block font-semibold">Filter by Tags</label>
          <select
            multiple
            value={searchTags}
            onChange={handleSearchTagsChange}
            className="border px-3 py-2 w-full rounded"
            style={{ height: "6rem" }}
          >
            {allTags.map((tg) => (
              <option key={tg._id} value={tg._id}>
                {tg.name}
              </option>
            ))}
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
              className="flex-1 px-3 py-2 text-white bg-black rounded hover:bg-blue-600"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleResetSearch}
              className="flex-1 px-3 py-2 text-white bg-black rounded hover:bg-blue-600"
            >
              Reset
            </button>
          </div>
        </form>

        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* IMPORT / EXPORT */}
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
              className="ml-2 px-3 py-1 bg-black text-white rounded hover:bg-blue-600"
            >
              Go
            </button>
          </div>
          <button
            onClick={exportToExcel}
            className="px-3 py-1 bg-black text-white rounded hover:bg-blue-600"
          >
            Export
          </button>
        </div>

        {/* Sub-task creation (dropdown) */}
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-lg font-semibold text-center">
            Create Sub-Task (Dropdown)
          </h3>
          <form onSubmit={handleCreateSubTask} className="space-y-2 mt-2">
            <select
              value={parentForSubTask?._id || ""}
              onChange={(e) => {
                const selectedP = allTasks.find(
                  (x) => x._id === e.target.value
                );
                setParentForSubTask(selectedP || null);
              }}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Select Parent</option>
              {allTasks.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.title}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={subTaskTitle}
              onChange={(e) => setSubTaskTitle(e.target.value)}
              placeholder="Sub-task Title"
              className="w-full px-3 py-2 border rounded"
              required
            />
            <div>
              <label className="block font-semibold mb-1">Description</label>
              <textarea
                value={subTaskDescription}
                onChange={(e) => setSubTaskDescription(e.target.value)}
                rows={2}
                placeholder="Short description..."
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="flex-1">
              <label className="block font-semibold mb-1">Priority</label>
              <select
                value={subTaskPriority}
                onChange={(e) => setSubTaskPriority(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="P1">P1</option>
                <option value="P2">P2</option>
                <option value="P3">P3</option>
                <option value="P4">P4</option>
              </select>
            </div>
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
              <option value="Failed">Failed</option>
            </select>

            {/* Multi-select tags for sub-task */}
            <label className="block font-semibold">Tags</label>
            <select
              multiple
              value={subTaskTags}
              onChange={(e) => {
                const opts = e.target.options;
                const sel = [];
                for (let i = 0; i < opts.length; i++) {
                  if (opts[i].selected) sel.push(opts[i].value);
                }
                setSubTaskTags(sel);
              }}
              className="border px-3 py-2 w-full rounded"
              style={{ height: "5rem" }}
            >
              {allTags.map((tag) => (
                <option key={tag._id} value={tag._id}>
                  {tag.name}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="w-full px-3 py-2 text-white bg-black rounded hover:bg-blue-600"
            >
              Add Sub-Task
            </button>
          </form>
        </div>

        {/* TAG MANAGEMENT HORIZONTAL VIEW */}
        {/* <TagChips /> */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">Tag Management</h3>
            <button
              onClick={openTagModal}
              className="px-3 py-1 bg-black text-white rounded hover:bg-blue-600"
            >
              +Tag
            </button>
          </div>

          <div
            className="bg-white p-4 rounded shadow"
            style={{ overflowX: "auto", whiteSpace: "nowrap" }}
          >
            <div style={{ minWidth: "100%" }}>
              {allTags.length === 0 ? (
                <p className="text-gray-500">No tags found.</p>
              ) : (
                allTags.map((tg) => (
                  <div
                    key={tg._id}
                    className="inline-block border border-gray-300 rounded px-4 py-2 m-2"
                  >
                    <div className="font-semibold">{tg.name}</div>
                    <div className="text-xs text-gray-500">
                      {tg.parent ? `Parent: ${tg.parent?.name}` : "Top-Level"}
                    </div>
                    <div className="text-xs text-gray-500">
                      SubTags: {tg.subTags ? tg.subTags.length : 0}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* LEVEL FILTER */}
        <div className="flex items-center space-x-2 w-full max-w-3xl justify-end">
          <label className="font-semibold">Level Filter:</label>
          <select
            value={filterLevel}
            onChange={handleFilterLevelChange}
            className="border px-3 py-2 rounded"
          >
            <option value="">All Levels</option>
            <option value="0">Level 0 (top tasks)</option>
            <option value="1">Level 1 or less</option>
            <option value="2">Level 2 or less</option>
            <option value="3">Level 3 or less</option>
          </select>
          <button
            onClick={() => setFilterLevel("")}
            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 transition"
          >
            Clear
          </button>
        </div>

        {/* Toggle for "compact" vs "detailed" view */}
        <div className="flex justify-end">
          <label className="mr-2 font-semibold">View Mode:</label>
          <button
            onClick={toggleViewMode}
            className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400 transition"
          >
            {detailedView ? "Compact" : "Detailed"}
          </button>
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
          {filteredTestsTree.length === 0 ? (
            <p className="mt-2 text-center text-gray-500">No tasks found.</p>
          ) : (
            <div style={{ display: "inline-block", minWidth: "100%" }}>
              {filteredTestsTree.map((root) => (
                <TaskItem
                  key={root._id}
                  item={root}
                  level={0}
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDelete}
                  onEdit={openEditModal}
                  onAddSubTask={openSubModal}
                  onOpenDueDate={openDueDateModal}
                  onOpenReminder={openReminderModal}
                  onOpenAssign={openAssignModal}
                  onSelfAssign={handleSelfAssign}
                  detailed={detailedView}
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

function ExpandableIcon({ expanded }) {
  return expanded ? (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
    >
      <path
        d="M17 7V17H7"
        stroke="black"
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
      width="18"
      height="18"
      className="transition-transform duration-200 ease-in-out hover:rotate-6"
    >
      <path
        d="M9 6L15 12L9 18"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Single TaskItem (recursive).
 * - "card" layout with minWidth
 * - show advanced fields if "detailed" = true
 * - show createdAt / updatedAt
 * - circle for toggle completion
 */
function TaskItem({
  item,
  level,
  onToggleComplete,
  onDelete,
  onEdit,
  onAddSubTask,
  onOpenDueDate,
  onOpenReminder,
  onOpenAssign,
  onSelfAssign,
  detailed,
}) {
  const [expanded, setExpanded] = useState(false);
  console.log("line 1654", item);

  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const textRef = useRef(null);

  // Function to toggle the expanded state
  const isToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Check if text overflows the container
  useEffect(() => {
    if (textRef.current) {
      const element = textRef.current;
      setIsOverflowing(element.scrollHeight > element.clientHeight);
    }
  }, [item.description]);

  const hasChildren = item.subTasks && item.subTasks.length > 0;

  // Indentation for horizontal columns
  const containerStyle = {
    display: "inline-block",
    verticalAlign: "top",
    minWidth: "270px",
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

  // immediate sub-tasks
  const immediateCount = item.subTasks ? item.subTasks.length : 0;
  const nestedCount = item._nestedSubCount || 0; // see how we stored in flattenAll

  return (
    <div style={containerStyle} className="bg-white rounded shadow p-2 m-2">
      {/* HEAD ROW */}
      <div className="flex items-center mb-1">
        {hasChildren ? (
          <button
            onClick={toggleExpand}
            className="mr-2 text-gray-600 focus:outline-none"
            style={{ background: "transparent", border: "none" }}
          >
            <ExpandableIcon expanded={expanded} />
          </button>
        ) : (
          <span style={{ width: "1rem", display: "inline-block" }} />
        )}
        {/* Circle toggle */}
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

        <div className="flex-1">
          <span className="font-semibold">{item.title}</span>
        </div>
      </div>

      {/* Extra info in either compact or detailed form */}
      <div className="text-sm text-gray-600 ml-6">
        <div>
          <strong>Status:</strong> {item.status}{" "}
          {hasChildren && `| ${item.subTasks.length} sub-task(s)`}
        </div>
        <TagChips1 taskId={item._id} initialTags={item.tags} />
        {/* <HierarchicalTagAutocomplete
          onSelectTag={handleSelectTag}
          onCreateTag={handleCreateTag}
        />  */}

        <div>
          <strong>Priority:</strong> {item.priority || "P3"}
        </div>
        <div>
          <strong>Immediate SubTasks:</strong> {immediateCount}
        </div>
        <div>
          <strong>All Nested SubTasks:</strong> {nestedCount}
        </div>
        {/* If you want completion ratio: 
            you'd compute how many sub-tasks are completed vs total. 
            That requires more logic or data from backend. */}
        {/* Show tags if any */}
        {item.tags && item.tags.length > 0 && (
          <div>
            <strong>Tags:</strong> {item.tags.map((tg) => tg.name).join(", ")}
          </div>
        )}

        {detailed && (
          <>
            {/* Detailed fields */}
            <div className="">
              <strong>Description:</strong>{" "}
              {/* {item.description ? item.description : "(No Description)"} */}
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
                {item.description || "No Description provided."}
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
                  onClick={isToggleExpand}
                  className="mt-1 text-sm text-blue-500 hover:underline focus:outline-none"
                >
                  {isExpanded ? "Read Less" : "Read More"}
                </button>
              )}
            </div>
            {/* Timestamps always visible */}
            <div>
              <strong>Created:</strong>{" "}
              {item.createdAt
                ? new Date(item.createdAt).toLocaleString()
                : "N/A"}
            </div>
            <div>
              <strong>Updated:</strong>{" "}
              {item.updatedAt
                ? new Date(item.updatedAt).toLocaleString()
                : "N/A"}
            </div>
            {item.dueDate && (
              <div>
                <strong>Due:</strong> {item.dueDate}
                {item.dueTime ? ` at ${item.dueTime}` : ""}
              </div>
            )}
            {item.reminder && item.reminder !== "none" && (
              <div>
                <strong>Reminder:</strong> {item.reminder}
              </div>
            )}
            {item.assignedTo && (
              <div>
                <strong>Assigned To:</strong> {item.assignedTo}
              </div>
            )}
            {item.assignedToGroup && (
              <div>
                <strong>Group:</strong> {item.assignedToGroup}
              </div>
            )}
            {/* If you have assignedTo, assignedToGroup, etc. you can display them here */}
          </>
        )}
      </div>

      {/* ACTIONS */}
      <div className="mt-2 ml-6 space-x-2 flex">
        {/* <button
          onClick={() => onEdit(item)}
          className="px-2 py-1 bg-yellow-500 text-white text-sm rounded flex items-center gap-1"
        >
          <span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M21.1213 2.70705C19.9497 1.53548 18.0503 1.53547 16.8787 2.70705L15.1989 4.38685L7.29289 12.2928C7.16473 12.421 7.07382 12.5816 7.02986 12.7574L6.02986 16.7574C5.94466 17.0982 6.04451 17.4587 6.29289 17.707C6.54127 17.9554 6.90176 18.0553 7.24254 17.9701L11.2425 16.9701C11.4184 16.9261 11.5789 16.8352 11.7071 16.707L19.5556 8.85857L21.2929 7.12126C22.4645 5.94969 22.4645 4.05019 21.2929 2.87862L21.1213 2.70705ZM18.2929 4.12126C18.6834 3.73074 19.3166 3.73074 19.7071 4.12126L19.8787 4.29283C20.2692 4.68336 20.2692 5.31653 19.8787 5.70705L18.8622 6.72357L17.3068 5.10738L18.2929 4.12126ZM15.8923 6.52185L17.4477 8.13804L10.4888 15.097L8.37437 15.6256L8.90296 13.5112L15.8923 6.52185ZM4 7.99994C4 7.44766 4.44772 6.99994 5 6.99994H10C10.5523 6.99994 11 6.55223 11 5.99994C11 5.44766 10.5523 4.99994 10 4.99994H5C3.34315 4.99994 2 6.34309 2 7.99994V18.9999C2 20.6568 3.34315 21.9999 5 21.9999H16C17.6569 21.9999 19 20.6568 19 18.9999V13.9999C19 13.4477 18.5523 12.9999 18 12.9999C17.4477 12.9999 17 13.4477 17 13.9999V18.9999C17 19.5522 16.5523 19.9999 16 19.9999H5C4.44772 19.9999 4 19.5522 4 18.9999V7.99994Z"
                fill="white"
              ></path>
            </svg>
          </span>
          {detailed && <span>Edit</span>}
        </button> */}

        <EditButton item={item} onEdit={onEdit} detailed={detailed} />

        {/* <button
          onClick={() => onDelete(item._id)}
          className="px-2 py-1 bg-red-500 text-white text-sm rounded flex items-center gap-1"
        >
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              width="16"
              height="16"
            >
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  fill="white"
                  d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"
                ></path>
              </g>
            </svg>
          </span>
          {detailed && <span>Del</span>}
        </button> */}

        {/* <button
          onClick={() => onAddSubTask(item)}
          className="px-2 py-1 bg-blue-500 text-white text-sm rounded flex items-center gap-1"
        >
          <span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
            >
              <rect
                x="16"
                y="9"
                width="4"
                height="4"
                rx="2"
                transform="rotate(90 16 9)"
                fill="white"
                stroke="white"
                strokeWidth="2"
              ></rect>
              <rect
                x="20"
                y="17"
                width="4"
                height="4"
                rx="2"
                transform="rotate(90 20 17)"
                fill="white"
                stroke="white"
                strokeWidth="2"
              ></rect>
              <path
                d="M5 4V15C5 16.8856 5 17.8284 5.58579 18.4142C6.17157 19 7.11438 19 9 19H16"
                stroke="white"
                strokeWidth="2"
              ></path>
              <path
                d="M5 7V7C5 8.88562 5 9.82843 5.58579 10.4142C6.17157 11 7.11438 11 9 11H12"
                stroke="white"
                strokeWidth="2"
              ></path>
            </svg>
          </span>
          {detailed && <span>+Sub</span>}
        </button> */}

        <AddSubTaskButton
          item={item}
          onAddSubTask={onAddSubTask}
          detailed={detailed}
        />

        <ReminderButton
          item={item}
          onReminder={onOpenReminder}
          detailed={detailed}
        />
        <DueDateButton
          item={item}
          onSetDueDate={onOpenDueDate}
          detailed={detailed}
        />

        {/* <button
          onClick={() => onReminder(item)}
          className="px-2 py-1 bg-purple-500 text-white text-sm rounded flex items-center gap-1"
        >
          <span>
            <svg
              fill="white"
              viewBox="0 0 32 32"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
            >
              <path d="M30,23.3818l-2-1V20a6.0046,6.0046,0,0,0-5-5.91V12H21v2.09A6.0046,6.0046,0,0,0,16,20v2.3818l-2,1V28h6v2h4V28h6ZM28,26H16V24.6182l2-1V20a4,4,0,0,1,8,0v3.6182l2,1Z"></path>
              <path d="M28,6a2,2,0,0,0-2-2H22V2H20V4H12V2H10V4H6A2,2,0,0,0,4,6V26a2,2,0,0,0,2,2h4V26H6V6h4V8h2V6h8V8h2V6h4v6h2Z"></path>
            </svg>
          </span>
          {detailed && <span>Reminder</span>}
        </button> */}

        {/* <button
          onClick={() => onCustomAction(item)}
          className="px-2 py-1 bg-gray-500 text-white text-sm rounded flex items-center gap-2"
        >
          <span>
            <svg
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
            >
              <path
                d="M4.97879 4.63551C4.97887 4.63462 4.97895 4.63373 4.97903 4.63284C4.97992 4.63276 4.98081 4.63267 4.9817 4.63259C5.43849 4.59036 6.07532 4.54622 6.79718 4.51753C8.25652 4.45955 9.99036 4.46795 11.2768 4.65973C11.3353 4.66845 11.4111 4.70095 11.4872 4.77708L19.2406 12.5304C19.4358 12.7257 19.4358 13.0423 19.2406 13.2375L13.5837 18.8944C13.3884 19.0897 13.0719 19.0897 12.8766 18.8944L5.12325 11.141C5.04711 11.0649 5.01462 10.9891 5.0059 10.9306C4.81412 9.6442 4.80573 7.91035 4.86373 6.451C4.89241 5.72913 4.93656 5.0923 4.97879 4.63551Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              ></path>
              <circle
                cx="9.4346"
                cy="9.17334"
                r="1"
                transform="rotate(-45 9.4346 9.17334)"
                fill="white"
              ></circle>
            </svg>
          </span>
          {detailed && <span>Label</span>}
        </button> */}

        <LabelButton
          item={item}
          onAddLabel={() => console.log("label added")}
          detailed={detailed}
        />

        <DeleteButton item={item} onDelete={onDelete} detailed={detailed} />

        <SelfAssignButton
          item={item}
          onSelfAssign={onSelfAssign}
          detailed={detailed}
        />
        {/* <Example /> */}
      </div>

      {/* CHILDREN */}
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
              detailed={detailed}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const EditButton = ({ item, onEdit, detailed = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={() => onEdit(item)}
        className="px-2 py-1 bg-white text-black text-sm rounded flex items-center gap-1 transition-transform duration-200 hover:scale-105 hover:bg-blue-600 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
      >
        <span>
          <svg
            viewBox="0 0 24 24"
            fill={isHovered ? `none` : `white`}
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M21.1213 2.70705C19.9497 1.53548 18.0503 1.53547 16.8787 2.70705L15.1989 4.38685L7.29289 12.2928C7.16473 12.421 7.07382 12.5816 7.02986 12.7574L6.02986 16.7574C5.94466 17.0982 6.04451 17.4587 6.29289 17.707C6.54127 17.9554 6.90176 18.0553 7.24254 17.9701L11.2425 16.9701C11.4184 16.9261 11.5789 16.8352 11.7071 16.707L19.5556 8.85857L21.2929 7.12126C22.4645 5.94969 22.4645 4.05019 21.2929 2.87862L21.1213 2.70705ZM18.2929 4.12126C18.6834 3.73074 19.3166 3.73074 19.7071 4.12126L19.8787 4.29283C20.2692 4.68336 20.2692 5.31653 19.8787 5.70705L18.8622 6.72357L17.3068 5.10738L18.2929 4.12126ZM15.8923 6.52185L17.4477 8.13804L10.4888 15.097L8.37437 15.6256L8.90296 13.5112L15.8923 6.52185ZM4 7.99994C4 7.44766 4.44772 6.99994 5 6.99994H10C10.5523 6.99994 11 6.55223 11 5.99994C11 5.44766 10.5523 4.99994 10 4.99994H5C3.34315 4.99994 2 6.34309 2 7.99994V18.9999C2 20.6568 3.34315 21.9999 5 21.9999H16C17.6569 21.9999 19 20.6568 19 18.9999V13.9999C19 13.4477 18.5523 12.9999 18 12.9999C17.4477 12.9999 17 13.4477 17 13.9999V18.9999C17 19.5522 16.5523 19.9999 16 19.9999H5C4.44772 19.9999 4 19.5522 4 18.9999V7.99994Z"
              fill={isHovered ? `white` : `black`}
            ></path>
          </svg>
        </span>
        {detailed && <span>Edit</span>}
      </button>

      {/* Tooltip (only in icon mode) */}
      {!detailed && isHovered && (
        <div className="absolute top-1/2 z-50 left-1/2 transform -translate-x-1/2 -translate-y-10 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap pointer-events-none">
          Edit
        </div>
      )}
    </div>
  );
};

const AddSubTaskButton = ({ item, onAddSubTask, detailed = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={() => onAddSubTask(item)}
        className="px-2 py-1 bg-white text-black text-sm rounded flex items-center gap-1 transition-transform duration-200 hover:scale-105 hover:bg-blue-600 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
      >
        <span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
          >
            <rect
              x="16"
              y="9"
              width="4"
              height="4"
              rx="2"
              transform="rotate(90 16 9)"
              fill={isHovered ? `white` : `black`}
              stroke={isHovered ? `white` : `black`}
              strokeWidth="2"
            ></rect>
            <rect
              x="20"
              y="17"
              width="4"
              height="4"
              rx="2"
              transform="rotate(90 20 17)"
              fill={isHovered ? `white` : `black`}
              stroke={isHovered ? `white` : `black`}
              strokeWidth="2"
            ></rect>
            <path
              d="M5 4V15C5 16.8856 5 17.8284 5.58579 18.4142C6.17157 19 7.11438 19 9 19H16"
              stroke={isHovered ? `white` : `black`}
              strokeWidth="2"
            ></path>
            <path
              d="M5 7V7C5 8.88562 5 9.82843 5.58579 10.4142C6.17157 11 7.11438 11 9 11H12"
              stroke={isHovered ? `white` : `black`}
              strokeWidth="2"
            ></path>
          </svg>
        </span>
        {detailed && <span>+Sub</span>}
      </button>

      {/* Tooltip (only when icon mode is active) */}
      {!detailed && isHovered && (
        <div className="absolute z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-10 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap pointer-events-none">
          Add SubTask
        </div>
      )}
    </div>
  );
};

const ReminderButton = ({ item, onReminder, detailed = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={() => onReminder(item)}
        className="px-2 py-1 bg-white text-black text-sm rounded flex items-center gap-1 transition-transform duration-200 hover:scale-105 hover:bg-blue-600 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
      >
        <span>
          <svg
            fill={isHovered ? `white` : `black`}
            viewBox="0 0 52 52"
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
          >
            <path d="M50.3,7.5a7.45,7.45,0,0,0-6.2-5.9,7.81,7.81,0,0,0-5.8,1.6.81.81,0,0,0,.2,1.4,28.48,28.48,0,0,1,9.4,8.2.84.84,0,0,0,1.4,0A6.87,6.87,0,0,0,50.3,7.5ZM13.5,4.7a.9.9,0,0,0,.2-1.4A7,7,0,0,0,7.9,1.7,7.23,7.23,0,0,0,1.7,7.5a7.36,7.36,0,0,0,1.1,5.3.84.84,0,0,0,1.4,0A26,26,0,0,1,13.5,4.7ZM26,6.5a22.06,22.06,0,0,0-22,22,21.58,21.58,0,0,0,4.3,13L5,44.8a3.2,3.2,0,0,0,0,4.6,3.15,3.15,0,0,0,4.6,0l3.3-3.3A22.1,22.1,0,0,0,26,50.4a21.58,21.58,0,0,0,13-4.3l3.3,3.3a3.25,3.25,0,0,0,2.4,1A3.3,3.3,0,0,0,47,44.8l-3.3-3.3a21.58,21.58,0,0,0,4.3-13A21.94,21.94,0,0,0,26,6.5ZM10.5,28.4A15.5,15.5,0,1,1,26,43.9,15.49,15.49,0,0,1,10.5,28.4Zm18-.9V21.1a2.37,2.37,0,0,0-2.4-2.4,2.43,2.43,0,0,0-2.4,2.4v7.3a2.06,2.06,0,0,0,.7,1.7l5.7,5.7a2.41,2.41,0,0,0,3.4,0,2.3,2.3,0,0,0,0-3.4Z"></path>
          </svg>
        </span>
        {detailed && <span>Reminder</span>}
      </button>

      {/* Tooltip (only when icon mode is active) */}
      {!detailed && isHovered && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-10 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap pointer-events-none z-50">
          Set Reminder
        </div>
      )}
    </div>
  );
};

const DueDateButton = ({ item, onSetDueDate, detailed }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={() => onSetDueDate(item)}
        className="px-2 py-1 bg-white text-black text-sm rounded flex items-center gap-1 transition-transform duration-200 hover:scale-105 hover:bg-blue-600 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 "
      >
        <span>
          <svg
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
            fill={isHovered ? `white` : `black`}
            width="18"
            height="18"
          >
            <path d="M4 .5a.5.5 0 0 0-1 0V1H2a2 2 0 0 0-2 2v1h16V3a2 2 0 0 0-2-2h-1V.5a.5.5 0 0 0-1 0V1H4V.5zM16 14V5H0v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2zm-3.5-7h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5z"></path>
          </svg>
        </span>
        {detailed && <span>Due Date</span>}
      </button>

      {/* Tooltip */}
      {isHovered && (
        <div className="absolute top-1/2 z-50 left-1/2 transform -translate-x-1/2 -translate-y-10 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap pointer-events-none">
          Set Due Date
        </div>
      )}
    </div>
  );
};

const LabelButton = ({ item, onAddLabel, detailed = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={() => onAddLabel(item)}
        className="px-2 py-1 bg-white text-black text-sm rounded flex items-center gap-2 transition-transform duration-200 hover:scale-105 hover:bg-blue-600 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
      >
        <span>
          <svg
            viewBox="0 0 22 22"
            fill={isHovered ? `none` : `white`}
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            className="transition-transform duration-200 ease-in-out hover:rotate-6"
          >
            <path
              d="M4.97879 4.63551C4.97887 4.63462 4.97895 4.63373 4.97903 4.63284C4.97992 4.63276 4.98081 4.63267 4.9817 4.63259C5.43849 4.59036 6.07532 4.54622 6.79718 4.51753C8.25652 4.45955 9.99036 4.46795 11.2768 4.65973C11.3353 4.66845 11.4111 4.70095 11.4872 4.77708L19.2406 12.5304C19.4358 12.7257 19.4358 13.0423 19.2406 13.2375L13.5837 18.8944C13.3884 19.0897 13.0719 19.0897 12.8766 18.8944L5.12325 11.141C5.04711 11.0649 5.01462 10.9891 5.0059 10.9306C4.81412 9.6442 4.80573 7.91035 4.86373 6.451C4.89241 5.72913 4.93656 5.0923 4.97879 4.63551Z"
              stroke={isHovered ? `white` : `black`}
              strokeWidth="2"
              strokeLinecap="round"
            ></path>
            <circle
              cx="9.4346"
              cy="9.17334"
              r="1"
              transform="rotate(-45 9.4346 9.17334)"
              fill={isHovered ? `white` : `black`}
            ></circle>
          </svg>
        </span>
        {detailed && <span>Label</span>}
      </button>

      {/* Tooltip (only when icon mode is active) */}
      {!detailed && isHovered && (
        <div className="absolute top-1/2 z-50 left-1/2 transform -translate-x-1/2 -translate-y-10 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap pointer-events-none">
          Add Label
        </div>
      )}
    </div>
  );
};

const DeleteButton = ({ item, onDelete, detailed = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const handleDelete = () => {
    onDelete(item._id);
    setModalIsOpen(false); // Close modal after deletion
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={() => setModalIsOpen(true)}
        className="px-2 py-1 bg-white text-black text-sm rounded flex items-center gap-2 transition-transform duration-200 hover:scale-105 hover:bg-blue-600 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
      >
        <span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill={isHovered ? `none` : `white`}
            viewBox="0 0 24 24"
            width="17"
            height="17"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              fill={isHovered ? `white` : `black`}
              d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"
            ></path>
          </svg>
        </span>
        {detailed && <span>Del</span>}
      </button>

      {/* Tooltip (only in icon mode) */}
      {!detailed && isHovered && (
        <div className="absolute top-1/2 z-50 left-1/2 transform -translate-x-1/2 -translate-y-10 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap pointer-events-none">
          Delete
        </div>
      )}

      {/* Confirmation Modal with Animation */}
      <AnimatePresence>
        {modalIsOpen && (
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={() => setModalIsOpen(false)}
            className="flex items-center justify-center"
            overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="bg-white p-6 rounded shadow-lg w-96 mx-auto"
            >
              <h2 className="text-lg font-bold text-gray-800">
                Confirm Deletion
              </h2>
              <p className="text-gray-600 mt-2">
                Are you sure you want to delete this item?
              </p>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setModalIsOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

const SelfAssignButton = ({ item, onSelfAssign, detailed }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={() => onSelfAssign(item)}
        className="px-2 py-1 bg-white text-black text-sm rounded flex items-center gap-1 transition-transform duration-200 hover:scale-105 hover:bg-blue-600 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
      >
        <span>
          <svg
            fill={isHovered ? `white` : `black`}
            version="1.1"
            id="Capa_1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 68.879 68.879"
            width="18"
            height="18"
          >
            <path d="M41.38,0C28.652,0,17.979,8.939,15.29,20.867l-4.319-5.27l-3.867,3.17l9.904,12.083l12.083-9.904l-3.17-3.867l-5.705 4.676C22.48,12.163,31.107,5,41.38,5c11.992,0,21.749,9.757,21.749,21.749c0,11.993-9.757,21.75-21.749,21.75h-6.147 c-1.427-8.156-8.543-14.38-17.104-14.38c-9.582,0-17.379,7.796-17.379,17.38s7.797,17.38,17.379,17.38 c8.906,0,16.26-6.736,17.257-15.38h5.994c14.749,0,26.749-12,26.749-26.75C68.129,12,56.129,0,41.38,0z M18.129,62.383 c-6.002,0-10.885-4.882-10.885-10.885s4.883-10.885,10.885-10.885s10.885,4.882,10.885,10.885S24.131,62.383,18.129,62.383z"></path>
          </svg>
        </span>
        {detailed && <span>Self</span>}
      </button>

      {/* Tooltip */}
      {isHovered && (
        <div className="absolute top-1/2 z-50 left-1/2 transform -translate-x-1/2 -translate-y-10 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap pointer-events-none">
          Assign Task to Yourself
        </div>
      )}
    </div>
  );
};

const RightArrowButton = ({ item, onCustomAction, detailed = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => onCustomAction(item)}
        className="px-2 py-1 bg-gray-500 text-white text-sm rounded flex items-center gap-2 transition-transform duration-200 hover:scale-105 hover:bg-gray-600 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            className="transition-transform duration-200 ease-in-out hover:rotate-6"
          >
            <path
              d="M9 6L15 12L9 18"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
        </span>
        {detailed && <span>Label</span>}
      </button>

      {/* Tooltip (only when icon mode is active) */}
      {!detailed && isHovered && (
        <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-10 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
          Custom Action
        </div>
      )}
    </div>
  );
};

const getAssigneeInitials = (assignee) => {
  if (!assignee) return "NA"; // Default fallback if no assignee is provided

  // If there's a name, take the first letter
  if (assignee.name) {
    return assignee.name.charAt(0).toUpperCase();
  }

  // If no name, extract first two letters from the email before "@"
  if (assignee.email) {
    return assignee.email.split("@")[0].slice(0, 2).toUpperCase();
  }

  return "NA"; // Fallback if neither name nor email is available
};

// Function to generate a unique color based on name/email
const getUniqueColor = (input) => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${hash % 360}, 70%, 50%)`; // Generates a unique HSL color
  return color;
};

// Assignment Badge Component
const AssignmentBadge = ({ assignee }) => {
  const initials = getAssigneeInitials(assignee);
  const color = getUniqueColor(assignee.name || assignee.email || "default");

  return (
    <div
      className="w-6 h-6 flex items-center justify-center rounded-full text-white font-bold text-xs"
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
};

// Example Usage:
const Example = () => {
  const assignees = [
    { email: "kunalratxen@gmail.com" },
    { email: "sumit@gmail.com" },
    { email: "shyam@gmail.com" },
    { name: "Rajesh Kumar" },
  ];

  return (
    <div className="flex gap-2">
      {assignees.map((assignee, index) => (
        <AssignmentBadge key={index} assignee={assignee} />
      ))}
    </div>
  );
};
