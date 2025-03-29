import React, { useState, useEffect } from "react";
import axios from "axios";

// Replace with your actual URLs or environment variables:
const TASKS_API_URL = "http://localhost:3001/api/v1/tests";
const TAGS_API_URL = "http://localhost:3001/api/v1/tags";

/**
 * Main component to show tag chips for a given Task.
 * Props:
 *  - taskId: the _id of the Task (Test) document
 *  - initialTags: array of populated Tag objects already assigned to the task
 *
 * Example usage:
 *   <TagChips taskId={someTask._id} initialTags={someTask.tags} />
 */
function TagChips1({ taskId, initialTags = [] }) {
  const [tags, setTags] = useState(initialTags); // array of Tag objects: [{_id, name}, ...]
  const [allTags, setAllTags] = useState([]); // all tags in the DB for optional reuse
  const [inputValue, setInputValue] = useState("");

  // Fetch all tags from the backend on mount (optional, if you want an autocomplete or reusability)
  useEffect(() => {
    const fetchAllTags = async () => {
      try {
        const res = await axios.get(TAGS_API_URL);
        setAllTags(res.data); // e.g. [{_id, name, parent, subTags}, ...]
      } catch (error) {
        console.error("Error fetching all tags:", error);
      }
    };
    fetchAllTags();
  }, []);

  /**
   * Add a new or existing tag to the Task.
   */
  const handleAddTag = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // 1) Check if a tag with this name already exists (case-insensitive).
    let existingTag = allTags.find(
      (t) => t.name.toLowerCase() === trimmed.toLowerCase()
    );

    // 2) If not existing, create a new Tag in DB:
    if (!existingTag) {
      try {
        const createRes = await axios.post(TAGS_API_URL, {
          name: trimmed,
        });
        existingTag = createRes.data; // newly created tag object
        // Also push it to allTags so we don't re-create it next time:
        setAllTags((prev) => [...prev, existingTag]);
      } catch (error) {
        console.error("Error creating new tag:", error);
        return;
      }
    }

    // 3) Now that we have an existingTag object, update the Task in DB to include this tag:
    if (tags.find((t) => t._id === existingTag._id)) {
      // already assigned
      setInputValue("");
      return;
    }

    try {
      // Update the Task's tags array in the backend:
      const updated = await axios.put(`${TASKS_API_URL}/${taskId}`, {
        tags: [...tags.map((tg) => tg._id), existingTag._id],
      });

      // 4) Update local state
      setTags((prev) => [...prev, existingTag]);
      setInputValue("");
    } catch (error) {
      console.error("Error adding tag to Task:", error);
    }
  };

  /**
   * Remove a tag from the Task.
   */
  const handleRemoveTag = async (tagId) => {
    try {
      const updated = await axios.put(`${TASKS_API_URL}/${taskId}`, {
        tags: tags.filter((tg) => tg._id !== tagId).map((tg) => tg._id),
      });
      setTags((prev) => prev.filter((t) => t._id !== tagId));
    } catch (error) {
      console.error("Error removing tag from Task:", error);
    }
  };

  /**
   * Rename the tag in DB and update local state.
   */
  const handleUpdateTag = async (tagId, newName) => {
    try {
      // Call the backend to update the Tag name:
      // This assumes you have a PUT /tags/:id route that updates the tag's name
      await axios.put(`${TAGS_API_URL}/${tagId}`, { name: newName });

      // Update local states: tags + allTags
      setTags((prev) =>
        prev.map((t) => (t._id === tagId ? { ...t, name: newName } : t))
      );
      setAllTags((prev) =>
        prev.map((t) => (t._id === tagId ? { ...t, name: newName } : t))
      );
    } catch (error) {
      console.error("Error updating tag name:", error);
    }
  };

  return (
    <div>
      {/* Tag chips */}
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <EditableChip
            key={tag._id}
            tag={tag}
            onRemoveTag={handleRemoveTag}
            onUpdateTag={handleUpdateTag}
          />
        ))}
      </div>

      {/* Input to add new tag */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          className="border rounded px-2 py-1 text-sm"
          placeholder="Add or create a tag"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddTag();
          }}
        />
        {/* <button
          onClick={handleAddTag}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          Add Tag
        </button> */}
      </div>
    </div>
  );
}

/**
 * A chip that can be edited (click to rename) or removed (click X).
 */
function EditableChip({ tag, onRemoveTag, onUpdateTag }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(tag.name);

  const handleEdit = () => {
    setTempName(tag.name);
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmed = tempName.trim();
    if (trimmed && trimmed !== tag.name) {
      onUpdateTag(tag._id, trimmed);
    }
    setIsEditing(false);
  };

  return (
    <div className="flex items-center bg-gray-200 text-gray-800 rounded-full px-3 py-1 text-sm">
      {isEditing ? (
        <input
          autoFocus
          className="bg-gray-100 border-none text-sm px-1 w-20"
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
        />
      ) : (
        <span onClick={handleEdit} className="cursor-pointer">
          {tag.name}
        </span>
      )}
      <button
        onClick={() => onRemoveTag(tag._id)}
        className="ml-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        &times;
      </button>
    </div>
  );
}

export default TagChips1;
