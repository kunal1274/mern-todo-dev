// models/User.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * Simple User model with email required
 */
const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // optionally store other fields, e.g. name, password hash, etc.
    name: { type: String, default: "" },
    // you can add more if needed
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
