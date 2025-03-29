// src/components/ConfirmDeleteButton.jsx
// ADDED: A small button that prompts "Are you sure?" and calls the delete API if confirmed

import React from "react";
import axios from "axios";

const API_BASE_URL = "https://fms-qkmw.onrender.com/fms/api/v0";

function ConfirmDeleteButton({ itemId, onDeleted }) {
  const handleClick = async () => {
    if (window.confirm("Are you sure you want to delete this group?")) {
      try {
        await axios.delete(`${API_BASE_URL}/userGroups/${itemId}`);
        if (onDeleted) {
          onDeleted();
        }
      } catch (error) {
        console.error("Error deleting group:", error);
      }
    }
  };

  return (
    // <button
    //   className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
    //   onClick={handleClick}
    // >
    //   Delete
    // </button>
    <button
      className="text-red-600 hover:text-red-800"
      //onClick={() => deleteGroup(group._id)}
      onClick={handleClick}
    >
      <span className="underline">Delete</span>
    </button>
  );
}

export default ConfirmDeleteButton;
