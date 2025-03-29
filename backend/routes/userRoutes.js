// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

/* 1) CREATE a new User */
router.post("/", async (req, res) => {
  const { email, name } = req.body;
  if (!email) {
    return res.status(400).json({ msg: "Email is required" });
  }
  try {
    const newUser = new User({ email, name });
    const savedUser = await newUser.save();
    res.json(savedUser);
  } catch (err) {
    console.error(err);
    // might be duplicate key if email is unique
    res
      .status(500)
      .json({ msg: "Server error creating user", error: err.message });
  }
});

/* 2) GET all Users (optional search by email) */
router.get("/", async (req, res) => {
  const { email } = req.query;
  let query = {};
  if (email) {
    query.email = { $regex: email, $options: "i" };
  }
  try {
    const users = await User.find(query).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ msg: "Server error fetching users", error: err.message });
  }
});

/* 3) GET single user by ID */
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error fetching user" });
  }
});

/* 4) UPDATE user */
router.put("/:id", async (req, res) => {
  const { email, name } = req.body;
  try {
    let user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (email !== undefined) user.email = email;
    if (name !== undefined) user.name = name;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ msg: "Server error updating user", error: err.message });
  }
});

/* 5) DELETE user */
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: "User removed" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ msg: "Server error deleting user", error: err.message });
  }
});

module.exports = router;
