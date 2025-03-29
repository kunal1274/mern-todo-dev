// routes/testRoutes.js
const express = require("express");
const router = express.Router();
const Test = require("../models/Test");

/* -------------------------------------------
   1) Create a new Test (top-level)
-------------------------------------------- */
router.post("/", async (req, res) => {
  const { name, status } = req.body;
  if (!name) {
    return res.status(400).json({ msg: "Please enter a name" });
  }
  try {
    const newTest = new Test({ name, status });
    const savedTest = await newTest.save();
    res.json(savedTest);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/* -------------------------------------------
   2) Get all Test entries with optional search
   Populates subTasks to multiple levels
-------------------------------------------- */
router.get("/", async (req, res) => {
  const { name, startDate, endDate, status } = req.query;
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
    // Populate subTasks to multiple levels (here up to 5 levels for demo).
    // Increase or decrease as needed, or use a plugin/recursive approach.
    const tests = await Test.find(query)
      .sort({ createdAt: -1 })
      .populate({
        path: "subTasks",
        populate: {
          path: "subTasks",
          populate: {
            path: "subTasks",
            populate: {
              path: "subTasks",
              populate: {
                path: "subTasks",
              },
            },
          },
        },
      });

    res.json(tests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/* -------------------------------------------
   3) Update a Test entry
-------------------------------------------- */
router.put("/:id", async (req, res) => {
  const { name, status } = req.body;
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

/* -------------------------------------------
   4) Delete a Test entry (simple approach)
   NOTE: If you want to recursively delete sub-tasks,
         you can implement a helper function to do so.
-------------------------------------------- */
router.delete("/:id", async (req, res) => {
  try {
    let test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ msg: "Test not found" });

    // If you want to recursively remove sub-tasks:
    // await deleteTestRecursively(req.params.id);

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
  5) Create a sub-task for a given parent test ID.
  POST to /:id/subtask with { name, status } in the body.
  1) Ensure parent exists
  2) Create new sub-task (which is itself a Test doc)
  3) Push new sub-task _id into parent's subTasks array
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

/* 6) GET all tests in a fully nested "tree" structure,
   supporting unlimited depth (no populate limit).
   We'll also allow the same optional query filters for searching.
*/
router.get("/tree", async (req, res) => {
  const { name, startDate, endDate, status } = req.query;
  let query = {};

  // same search logic
  if (name) {
    query.name = { $regex: name, $options: "i" };
  }
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  if (status) query.status = status;

  try {
    const allTests = await Test.find(query).lean();

    // 1) Create a map of _id -> doc
    const map = {};
    allTests.forEach((doc) => {
      map[doc._id.toString()] = { ...doc, _id: doc._id.toString() };
    });

    // 2) Track all subTask IDs to identify top-level docs
    const subTaskIds = new Set();
    allTests.forEach((doc) => {
      doc.subTasks.forEach((stId) => {
        subTaskIds.add(stId.toString());
      });
    });

    // 3) Identify top-level docs
    const topLevelDocs = allTests.filter(
      (doc) => !subTaskIds.has(doc._id.toString())
    );

    // 4) Recursively build the tree
    const buildTree = (doc) => {
      const subDocs = doc.subTasks
        .map((childId) => map[childId.toString()])
        .filter(Boolean);
      // Recursively build children
      doc.subTasks = subDocs.map((childDoc) => buildTree(childDoc));
      return doc;
    };

    // 5) Build the final array of nested docs
    const tree = topLevelDocs.map((doc) => {
      const mappedDoc = map[doc._id.toString()];
      return buildTree(mappedDoc);
    });

    res.json(tree);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error building tree" });
  }
});

module.exports = router;

/* -------------------------------------------
   (Optional) If you want a recursive delete:
-------------------------------------------- */
// async function deleteTestRecursively(testId) {
//   const parentTest = await Test.findById(testId);
//   if (!parentTest) return;

//   // For each child, recursively delete
//   for (const subId of parentTest.subTasks) {
//     await deleteTestRecursively(subId);
//   }
//   // Finally delete the parent itself
//   await Test.findByIdAndDelete(testId);
// }
