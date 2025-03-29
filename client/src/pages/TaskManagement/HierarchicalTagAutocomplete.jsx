import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

// Adjust this to match your actual endpoint:
const TAGS_HIERARCHY_URL = "http://localhost:3001/api/v1/tags/hierarchy";

function buildTagPaths(tags) {
  const map = {};
  tags.forEach((tag) => {
    map[tag._id] = { ...tag, subTags: tag.subTags || [] };
  });
  const topLevel = tags.filter((tag) => !tag.parent);

  const results = [];
  function dfs(tag, prefix) {
    const fullPath = prefix ? `${prefix} / ${tag.name}` : tag.name;
    results.push({ _id: tag._id, name: tag.name, path: fullPath });
    tag.subTags.forEach((childId) => {
      const childTag = map[childId];
      if (childTag) {
        dfs(childTag, fullPath);
      }
    });
  }

  topLevel.forEach((t) => dfs(map[t._id], ""));
  return results;
}

/**
 * HierarchicalTagAutocomplete
 *
 * Props:
 *  - onSelectTag(tagObject)  => called when user chooses an existing tag
 *  - onCreateTag(tagName)    => called when user wants to create a new tag
 */
export default function HierarchicalTagAutocomplete({
  onSelectTag,
  onCreateTag,
}) {
  const [allTags, setAllTags] = useState([]); // array of { _id, name, path }
  const [inputValue, setInputValue] = useState("");
  const [filteredTags, setFilteredTags] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef(null);

  // Fetch all tags once
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await axios.get(TAGS_HIERARCHY_URL);
        const tagPaths = buildTagPaths(res.data);
        setAllTags(tagPaths);
      } catch (err) {
        console.error("Error fetching hierarchical tags:", err);
      }
    };
    fetchTags();
  }, []);

  // Filter tags as user types
  useEffect(() => {
    if (!inputValue.trim()) {
      setFilteredTags([]);
      return;
    }
    const lower = inputValue.toLowerCase();
    const filtered = allTags.filter((t) =>
      t.path.toLowerCase().includes(lower)
    );
    setFilteredTags(filtered);
  }, [inputValue, allTags]);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (tag) => {
    setInputValue("");
    setShowDropdown(false);
    if (onSelectTag) {
      onSelectTag(tag); // pass the chosen tag object back up
    }
  };

  const handleCreate = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setInputValue("");
    setShowDropdown(false);
    if (onCreateTag) {
      onCreateTag(trimmed);
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <input
        type="text"
        className="border rounded px-2 py-1 text-sm w-64"
        placeholder="Type a tag..."
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setShowDropdown(true);
        }}
      />
      {/* Dropdown */}
      {showDropdown && (filteredTags.length > 0 || inputValue.trim()) && (
        <div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded shadow-md w-64 max-h-60 overflow-auto">
          {filteredTags.map((tag) => (
            <div
              key={tag._id}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(tag)}
            >
              {tag.path}
            </div>
          ))}
          {/* Option to create a new tag if no exact match */}
          {inputValue.trim() && (
            <div
              className="px-3 py-2 bg-blue-50 hover:bg-blue-100 cursor-pointer text-blue-600"
              onClick={handleCreate}
            >
              Create new tag: <strong>{inputValue.trim()}</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
