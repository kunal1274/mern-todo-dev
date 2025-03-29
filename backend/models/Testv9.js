// models/Test.js
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
        "Approved"
      ],
      default: "Not Started", // Default status
    },
    subTasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Test",
      }
    ]
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("Test", TestSchema);
