// routes/userGroupRoutes.js
const express = require("express");
const router = express.Router();
const UserGroup = require("../models/UserGroup");

/* 1) CREATE a new UserGroup */
router.post("/", async (req, res) => {
  const { name, owner, secondOwner, thirdOwner, members } = req.body;
  if (!name) {
    return res.status(400).json({ msg: "Group name is required" });
  }
  try {
    const newGroup = new UserGroup({
      name,
      owner: owner || null,
      secondOwner: secondOwner || null,
      thirdOwner: thirdOwner || null,
      members: Array.isArray(members) ? members : [],
    });
    const savedGroup = await newGroup.save();
    res.json(savedGroup);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ msg: "Server error creating user group", error: err.message });
  }
});

/* 2) GET all groups (optionally search by name) */
router.get("/", async (req, res) => {
  const { name } = req.query;
  let query = {};
  if (name) {
    query.name = { $regex: name, $options: "i" };
  }
  try {
    const groups = await UserGroup.find(query)
      .populate("owner")
      .populate("secondOwner")
      .populate("thirdOwner")
      .populate("members");
    res.json(groups);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ msg: "Server error fetching user groups", error: err.message });
  }
});

/* 3) GET single group by ID */
router.get("/:id", async (req, res) => {
  try {
    const group = await UserGroup.findById(req.params.id)
      .populate("owner")
      .populate("secondOwner")
      .populate("thirdOwner")
      .populate("members");
    if (!group) return res.status(404).json({ msg: "UserGroup not found" });
    res.json(group);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ msg: "Server error fetching user group", error: err.message });
  }
});

/* 4) UPDATE group */
router.put("/:id", async (req, res) => {
  const { name, owner, secondOwner, thirdOwner, members } = req.body;
  try {
    let group = await UserGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ msg: "UserGroup not found" });

    if (name !== undefined) group.name = name;
    if (owner !== undefined) group.owner = owner;
    if (secondOwner !== undefined) group.secondOwner = secondOwner;
    if (thirdOwner !== undefined) group.thirdOwner = thirdOwner;
    if (members !== undefined) group.members = members;

    const updatedGroup = await group.save();
    res.json(updatedGroup);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ msg: "Server error updating user group", error: err.message });
  }
});

/* 5) DELETE group */
router.delete("/:id", async (req, res) => {
  try {
    const group = await UserGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ msg: "UserGroup not found" });

    await UserGroup.findByIdAndDelete(req.params.id);
    res.json({ msg: "UserGroup removed" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ msg: "Server error deleting user group", error: err.message });
  }
});

module.exports = router;
