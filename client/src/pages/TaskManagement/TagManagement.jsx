// TagManagement.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-modal";

// (!) If you prefer, set the app element for React Modal
Modal.setAppElement("#root");

export default function TagManagement({
  // We'll accept these props so we can
  // 1) re-fetch tasks if needed
  // 2) pass in a function to filter tasks by a certain tag
  onTagsChanged,
  onFilterByTag,
}) {
  // (!) ADDED: We store the list of tags, as well as create/edit forms
  const [allTags, setAllTags] = useState([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [newTagName, setNewTagName] = useState("");
  const [newTagParent, setNewTagParent] = useState("");

  // For editing an existing tag
  const [editTagData, setEditTagData] = useState({
    _id: null,
    name: "",
    parent: "",
  });

  // (!) ADJUST to your actual API endpoint
  const tagsApiUrl = import.meta.env.VITE_BACKEND_URL
    ? `${import.meta.env.VITE_BACKEND_URL}/tags`
    : "http://localhost:3001/api/v1/tags";

  // -------------------------------------------
  // A) Fetch Tags
  // -------------------------------------------
  const fetchTags = async () => {
    try {
      const res = await axios.get(tagsApiUrl);
      setAllTags(res.data);
      if (onTagsChanged) onTagsChanged(res.data); // inform parent if needed
    } catch (err) {
      console.error("Error fetching tags:", err);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  // -------------------------------------------
  // B) Create Tag
  // -------------------------------------------
  const openCreateModal = () => {
    setNewTagName("");
    setNewTagParent("");
    setCreateModalOpen(true);
  };
  const closeCreateModal = () => {
    setCreateModalOpen(false);
  };

  const handleCreateTag = async (e) => {
    e.preventDefault();
    if (!newTagName.trim()) {
      alert("Tag name is required");
      return;
    }
    try {
      await axios.post(tagsApiUrl, {
        name: newTagName,
        parent: newTagParent || null,
      });
      closeCreateModal();
      fetchTags();
    } catch (err) {
      console.error("Error creating tag:", err);
      alert("Error creating tag");
    }
  };

  // -------------------------------------------
  // C) Edit Tag
  // -------------------------------------------
  const openEdit = (tag) => {
    setEditTagData({
      _id: tag._id,
      name: tag.name,
      parent: tag.parent?._id || "",
    });
    setEditModalOpen(true);
  };
  const closeEditModal = () => {
    setEditModalOpen(false);
  };

  const handleUpdateTag = async (e) => {
    e.preventDefault();
    if (!editTagData.name.trim()) {
      alert("Name is required");
      return;
    }
    try {
      await axios.put(`${tagsApiUrl}/${editTagData._id}`, {
        name: editTagData.name,
        parent: editTagData.parent || null,
      });
      closeEditModal();
      fetchTags();
    } catch (err) {
      console.error("Error updating tag:", err);
      alert("Error updating tag");
    }
  };

  // -------------------------------------------
  // D) Delete Tag
  // -------------------------------------------
  const handleDelete = async (tagId) => {
    if (!window.confirm("Are you sure you want to delete this tag?")) return;
    try {
      await axios.delete(`${tagsApiUrl}/${tagId}`);
      fetchTags();
    } catch (err) {
      console.error("Error deleting tag:", err);
      alert("Error deleting tag");
    }
  };

  // -------------------------------------------
  // E) Filter by Tag
  // -------------------------------------------
  const handleTagClick = (tagId) => {
    if (onFilterByTag) onFilterByTag(tagId);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Tag Management</h3>
        <button
          onClick={openCreateModal}
          className="px-2 py-1 bg-black text-white rounded hover:bg-blue-600"
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
                  {tg.parent
                    ? `Parent: ${tg.parent.name || tg.parent._id}`
                    : "Top-Level"}
                </div>
                <div className="text-xs text-gray-500">
                  SubTags: {tg.subTags ? tg.subTags.length : 0}
                </div>
                {/* (!) CHANGED: Provide Edit + Delete + Filter */}
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => openEdit(tg)}
                    className="px-2 py-1 bg-yellow-500 text-white text-sm rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(tg._id)}
                    className="px-2 py-1 bg-red-500 text-white text-sm rounded"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleTagClick(tg._id)}
                    className="px-2 py-1 bg-blue-500 text-white text-sm rounded"
                  >
                    Filter
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Tag Modal */}
        <Modal
          isOpen={createModalOpen}
          onRequestClose={closeCreateModal}
          className="relative max-w-md bg-white p-6 rounded shadow m-auto"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        >
          <h2 className="text-xl font-bold mb-4">Create Tag</h2>
          <form onSubmit={handleCreateTag} className="space-y-3">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Tag Name"
              className="border px-3 py-2 w-full rounded"
              required
            />
            <select
              value={newTagParent}
              onChange={(e) => setNewTagParent(e.target.value)}
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
                onClick={closeCreateModal}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>

        {/* Edit Tag Modal */}
        <Modal
          isOpen={editModalOpen}
          onRequestClose={closeEditModal}
          className="relative max-w-md bg-white p-6 rounded shadow m-auto"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        >
          <h2 className="text-xl font-bold mb-4">Edit Tag</h2>
          <form onSubmit={handleUpdateTag} className="space-y-3">
            <input
              type="text"
              value={editTagData.name}
              onChange={(e) =>
                setEditTagData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Tag Name"
              className="border px-3 py-2 w-full rounded"
              required
            />
            <select
              value={editTagData.parent || ""}
              onChange={(e) =>
                setEditTagData((prev) => ({ ...prev, parent: e.target.value }))
              }
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
                Update
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
      </div>
    </>
  );
}
