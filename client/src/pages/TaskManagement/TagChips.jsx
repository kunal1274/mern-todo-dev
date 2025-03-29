import React, { useState } from "react";

function TagChips() {
  // Suppose you fetch these tags from props or a backend call
  const [tags, setTags] = useState([
    { _id: "1", name: "Personal" },
    { _id: "2", name: "To-Do" },
    { _id: "3", name: "Investment" },
  ]);

  const handleRemoveTag = (tagId) => {
    setTags((prev) => prev.filter((t) => t._id !== tagId));
    // Optionally call backend to remove from DB
  };

  const handleAddTag = (newTagName) => {
    // Optionally check if tag already exists
    const newTag = { _id: Date.now().toString(), name: newTagName };
    setTags((prev) => [...prev, newTag]);
    // Optionally call backend to add to DB
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <div
            key={tag._id}
            className="flex items-center bg-gray-200 text-gray-800 rounded-full px-3 py-1 text-sm"
          >
            {tag.name}
            <button
              onClick={() => handleRemoveTag(tag._id)}
              className="ml-2 text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              &times; {/* Or a trash icon */}
            </button>
          </div>
        ))}
      </div>
      <AddTagInput onAddTag={handleAddTag} />
    </div>
  );
}

function AddTagInput({ onAddTag }) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      onAddTag(inputValue.trim());
      setInputValue("");
    }
  };

  return (
    <input
      type="text"
      className="border rounded px-2 py-1 text-sm"
      placeholder="Type a tag and press Enter"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onKeyDown={handleKeyDown}
    />
  );
}

export default TagChips;
