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
    // multi-level populate (up to ~5 levels)
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
  CHANGED: Also set child's parent field => parent: parentId
*/
router.post("/:id/subtask", async (req, res) => {
  const parentId = req.params.id;
  const { name, status } = req.body;

  try {
    // ensure parent exists
    let parentTest = await Test.findById(parentId);
    if (!parentTest) {
      return res.status(404).json({ msg: "Parent Test not found" });
    }

    // create the child with a 'parent' reference
    const subTask = new Test({ name, status, parent: parentId });
    const savedSubTask = await subTask.save();

    // push child id into parent's subTasks
    parentTest.subTasks.push(savedSubTask._id);
    await parentTest.save();

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
    // get all docs in a single query
    const allTests = await Test.find(query).lean();

    // build a map for quick lookups
    const map = {};
    allTests.forEach((doc) => {
      map[doc._id.toString()] = { ...doc, _id: doc._id.toString() };
    });

    // track sub-task IDs to identify top-level
    const subTaskIds = new Set();
    allTests.forEach((doc) => {
      doc.subTasks.forEach((stId) => subTaskIds.add(stId.toString()));
    });

    // find top-level docs
    const topLevelDocs = allTests.filter(
      (doc) => !subTaskIds.has(doc._id.toString())
    );

    // recursively build
    const buildTree = (doc) => {
      const subDocs = doc.subTasks
        .map((childId) => map[childId.toString()])
        .filter(Boolean);
      doc.subTasks = subDocs.map((childDoc) => buildTree(childDoc));
      return doc;
    };

    const tree = topLevelDocs.map((doc) => buildTree(map[doc._id.toString()]));
    res.json(tree);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error building tree" });
  }
});

/* 
  NEW: 7) Toggle child's completion => auto-complete parents if all sub-tasks done
  Endpoint: PUT /tests/:id/toggle-complete
  See the "updateParentIfAllChildrenDone" function below for recursion
*/
router.put("/:id/toggle-complete", async (req, res) => {
  const { newStatus } = req.body; // e.g. "Completed" or "Not Started"
  try {
    // 1) find child
    const child = await Test.findById(req.params.id);
    if (!child) return res.status(404).json({ msg: "Task not found" });

    // 2) update child's status
    child.status = newStatus;
    await child.save();

    // 3) auto-complete parent(s) if all children are done
    await updateParentIfAllChildrenDone(child.parent);

    res.json({ msg: "Toggled complete and updated parents." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error toggling complete" });
  }
});

// helper function to walk up the chain
async function updateParentIfAllChildrenDone(parentId) {
  if (!parentId) return; // no parent => done
  const parent = await Test.findById(parentId).populate("subTasks");
  if (!parent) return;

  // check if all sub-tasks are completed
  const allDone =
    parent.subTasks.length > 0 &&
    parent.subTasks.every((child) => child.status === "Completed");

  if (allDone) {
    parent.status = "Completed";
  } else {
    parent.status = "Not Started"; // or your default
  }
  await parent.save();

  // move up one level
  if (parent.parent) {
    await updateParentIfAllChildrenDone(parent.parent);
  }
}

module.exports = router;

/* -------------------------------------------
   (Optional) If you want a recursive delete:
-------------------------------------------- */
// async function deleteTestRecursively(testId) {
//   const parentTest = await Test.findById(testId);
//   if (!parentTest) return;

//   for (const subId of parentTest.subTasks) {
//     await deleteTestRecursively(subId);
//   }
//   await Test.findByIdAndDelete(testId);
// }
