import React, { useState } from "react";
import TagChips from "./TagChips";
import HierarchicalTagAutocomplete from "./HierarchicalTagAutocomplete";
import axios from "axios";

const TAGS_API_URL = "http://localhost:3001/api/v1/tags";
const TASKS_API_URL = "http://localhost:3001/api/v1/tests";

function TaskTagSection({ task }) {
  const [tags, setTags] = useState(task.tags || []); // e.g. populated array of { _id, name }

  // When user selects an existing tag from the autocomplete
  const handleSelectTag = async (tagObj) => {
    if (tags.find((t) => t._id === tagObj._id)) return; // already assigned
    // Update Task in DB
    const newTagIds = [...tags.map((t) => t._id), tagObj._id];
    await axios.put(`${TASKS_API_URL}/${task._id}`, { tags: newTagIds });
    setTags((prev) => [...prev, tagObj]);
  };

  // When user wants to create a new tag
  const handleCreateTag = async (tagName) => {
    try {
      const res = await axios.post(TAGS_API_URL, { name: tagName });
      const newTag = res.data; // { _id, name, parent: null, subTags: [] }
      // Now add to the task
      await handleSelectTag(newTag);
    } catch (error) {
      console.error("Error creating new tag:", error);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Tags</h3>
      {/* Show assigned tags as chips */}
      <TagChips
        taskId={task._id}
        initialTags={tags}
        // or a simpler version if you have a direct TagChips component
      />

      {/* Hierarchical Autocomplete for adding new tags */}
      <div className="mt-2">
        <HierarchicalTagAutocomplete
          onSelectTag={handleSelectTag}
          onCreateTag={handleCreateTag}
        />
      </div>
    </div>
  );
}

export default TaskTagSection;
