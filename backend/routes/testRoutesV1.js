// routes/testRoutes.js
const express = require("express");
const router = express.Router();
const Test = require("../models/Test");

// Create a new Test entry
router.post("/", async (req, res) => {
  const { name, status } = req.body;
  console.log(req.body);
  if (!name) {
    return res.status(400).json({ msg: "Please enter a name" });
  }
  try {
    const newTest = new Test({ name,status });
    const savedTest = await newTest.save();
    res.json(savedTest);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Get all Test entries with optional search
router.get("/", async (req, res) => {
  const { name, startDate, endDate,status } = req.query;
  let query = {};

  // Search by name (case-insensitive, partial match)
  if (name) {
    query.name = { $regex: name, $options: "i" };
  }

  // Search by creation date range
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      query.createdAt.$lte = new Date(endDate);
    }
  }

  // Filter by status
  if (status) query.status = status;

  try {
    // *** NEW: populate("subTasks") so we get sub-task data directly
    const tests = await Test.find(query)
      .sort({ createdAt: -1 })
      .populate("subTasks"); 
    res.json(tests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Update a Test entry
router.put("/:id", async (req, res) => {
  const { name , status} = req.body;
  try {
    let test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ msg: "Test not found" });

    test.name = name || test.name;
    test.status = status || test.status;
    const updatedTest = await test.save();
    res.json(updatedTest);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Test not found" });
    }
    res.status(500).send("Server Error");
  }
});

// Delete a Test entry
router.delete("/:id", async (req, res) => {
  try {
    let test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ msg: "Test not found" });

    await Test.findByIdAndDelete(req.params.id);
    res.json({ msg: "Test removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Test not found" });
    }
    res.status(500).send("Server Error");
  }
});

/* 
  *** NEW: Route to create a sub-task for a given parent test ID.
  We POST to /:id/subtask with { name, status } in the body.
  This creates a new Test document, then pushes its _id onto
  the parent's subTasks array.
*/
router.post("/:id/subtask", async (req, res) => {
  const parentId = req.params.id;
  const { name, status } = req.body;

  try {
    // 1) Make sure parent task exists
    let parentTest = await Test.findById(parentId);
    if (!parentTest) {
      return res.status(404).json({ msg: "Parent Test not found" });
    }

    // 2) Create the sub-task as a separate Test doc
    const subTask = new Test({ name, status });
    const savedSubTask = await subTask.save();

    // 3) Update parent’s subTasks array
    parentTest.subTasks.push(savedSubTask._id);
    await parentTest.save();

    // 4) Return the newly created sub-task
    res.json(savedSubTask);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error creating sub-task");
  }
});
/* END NEW */

module.exports = router;
