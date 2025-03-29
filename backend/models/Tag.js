// models/Tag.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * "Tag" model, allowing hierarchical tags:
 * - parent can be null for top-level tags
 * - subTags references child tags
 */
const TagSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Tag",
      default: null,
    },
    subTags: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Tag", TagSchema);
