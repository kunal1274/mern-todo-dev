// models/Test.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * "Test" (Task) with advanced fields
 */
const TestSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: 500,
    },
    description: {
      type: String,
      default: "",
    },
    priority: {
      type: String,
      enum: ["P1", "P2", "P3", "P4"],
      default: "P3",
    },
    dueDate: {
      type: Date,
      default: null,
    },
    dueTime: {
      type: String,
      default: null,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignedToGroup: {
      type: Schema.Types.ObjectId,
      ref: "UserGroup",
      default: null,
    },
    dependentOn: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    dependentOnGroup: {
      type: Schema.Types.ObjectId,
      ref: "UserGroup",
      default: null,
    },
    reminder: {
      type: String,
      enum: [
        "none",
        "dailyTime",
        "weeklyTime",
        "monthlyTime",
        "fortnightlyTime",
        "every4Hours",
        "every2Hours",
        "every6Hours",
        "every12Hours",
        "every15Hours",
        "every18Hours",
        "custom",
      ],
      default: "none",
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
        "Failed",
      ],
      default: "Not Started",
    },
    statusLetter: {
      type: String,
      default: "",
    },
    statusColor: {
      type: String,
      default: "",
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Test",
      default: null,
    },
    subTasks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Test",
      },
    ],
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Test", TestSchema);
