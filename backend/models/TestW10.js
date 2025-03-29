// models/Test.js
// NEW: we add a "parent" field so each sub-task knows who its parent is.
// This is crucial for auto-completing parent tasks when all children are done.

const mongoose = require("mongoose");

const TestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "In Progress",
        "Completed",
        "On Hold",
        "Cancelled",
        "Internal Dependency",
        "External Dependency",
        "Blocked",
        "Under Review",
        "Not Started",
        "Approved",
        "Rejected",
      ],
      default: "Not Started", // Default status
    },
    // NEW: parent reference
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      default: null,
    },
    subTasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Test",
      },
    ],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("Test", TestSchema);
