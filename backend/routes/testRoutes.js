// routes/testRoutes.js
const express = require("express");
const router = express.Router();
const Test = require("../models/Test");

// 1) CREATE a new Test
router.post("/", async (req, res) => {
  const {
    title,
    description,
    priority,
    dueDate,
    dueTime,
    assignedTo,
    assignedToGroup,
    dependentOn,
    dependentOnGroup,
    reminder,
    status,
    statusLetter,
    statusColor,
    tags,
  } = req.body;

  if (!title) {
    return res.status(400).json({ msg: "Title is required" });
  }
  try {
    const newTest = new Test({
      title,
      description,
      priority,
      dueDate,
      dueTime,
      assignedTo,
      assignedToGroup,
      dependentOn,
      dependentOnGroup,
      reminder,
      status,
      statusLetter,
      statusColor,
      tags,
    });
    const savedTest = await newTest.save();
    res.json(savedTest);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error creating Test");
  }
});

// 2) GET all Tests (optionally filter by title, date range, status)
router.get("/", async (req, res) => {
  const { title, startDate, endDate, status } = req.query;
  let query = {};

  if (title) {
    query.title = { $regex: title, $options: "i" };
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  if (status) query.status = status;

  try {
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
      })
      .populate("tags", "name")
      .populate("assignedTo assignedToGroup dependentOn dependentOnGroup");

    res.json(tests);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error fetching Tests");
  }
});

// 3) UPDATE a Test
router.put("/:id", async (req, res) => {
  try {
    let test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ msg: "Test not found" });

    const {
      title,
      description,
      priority,
      dueDate,
      dueTime,
      assignedTo,
      assignedToGroup,
      dependentOn,
      dependentOnGroup,
      reminder,
      status,
      statusLetter,
      statusColor,
      parent, // if you allow re-parenting
      tags,
    } = req.body;

    if (title !== undefined) test.title = title;
    if (description !== undefined) test.description = description;
    if (priority !== undefined) test.priority = priority;
    if (dueDate !== undefined) test.dueDate = dueDate;
    if (dueTime !== undefined) test.dueTime = dueTime;
    if (assignedTo !== undefined) test.assignedTo = assignedTo;
    if (assignedToGroup !== undefined) test.assignedToGroup = assignedToGroup;
    if (dependentOn !== undefined) test.dependentOn = dependentOn;
    if (dependentOnGroup !== undefined)
      test.dependentOnGroup = dependentOnGroup;
    if (reminder !== undefined) test.reminder = reminder;
    if (status !== undefined) test.status = status;
    if (statusLetter !== undefined) test.statusLetter = statusLetter;
    if (statusColor !== undefined) test.statusColor = statusColor;
    if (parent !== undefined) test.parent = parent;
    if (tags !== undefined) test.tags = tags;

    const updatedTest = await test.save();
    res.json(updatedTest);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error updating Test");
  }
});

// 4) DELETE a Test
router.delete("/:id", async (req, res) => {
  try {
    let test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ msg: "Test not found" });

    await Test.findByIdAndDelete(req.params.id);
    res.json({ msg: "Test removed" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error deleting Test");
  }
});

// 5) Create a sub-task for a given parent
router.post("/:id/subtask", async (req, res) => {
  const parentId = req.params.id;
  try {
    let parentTest = await Test.findById(parentId);
    if (!parentTest) {
      return res.status(404).json({ msg: "Parent Test not found" });
    }

    const {
      title,
      description,
      priority,
      dueDate,
      dueTime,
      assignedTo,
      assignedToGroup,
      dependentOn,
      dependentOnGroup,
      reminder,
      status,
      statusLetter,
      statusColor,
      tags,
    } = req.body;

    if (!title) {
      return res.status(400).json({ msg: "Sub-task title is required" });
    }

    const child = new Test({
      title,
      description,
      priority,
      dueDate,
      dueTime,
      assignedTo,
      assignedToGroup,
      dependentOn,
      dependentOnGroup,
      reminder,
      status,
      statusLetter,
      statusColor,
      parent: parentId,
      tags,
    });
    const savedChild = await child.save();

    parentTest.subTasks.push(savedChild._id);
    await parentTest.save();

    res.json(savedChild);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error creating sub-task");
  }
});

// 6) GET all tests in a tree form
router.get("/tree", async (req, res) => {
  const { title, startDate, endDate, status } = req.query;
  let query = {};

  if (title) {
    query.title = { $regex: title, $options: "i" };
  }
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  if (status) query.status = status;

  try {
    const allTests = await Test.find(query).populate("tags", "name").lean();
    const map = {};
    allTests.forEach((doc) => {
      map[doc._id.toString()] = { ...doc, _id: doc._id.toString() };
    });

    const subTaskIds = new Set();
    allTests.forEach((doc) => {
      doc.subTasks.forEach((stId) => subTaskIds.add(stId.toString()));
    });

    const topLevelDocs = allTests.filter(
      (doc) => !subTaskIds.has(doc._id.toString())
    );

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
  7) Toggle child's completion => auto-complete parents if all sub-tasks done
     With new logic:
     - If a parent is set to "Completed" but children are not all done,
       we warn or refuse unless "forceComplete" is true.
     - If "forceComplete", we mark all children completed too.
*/
router.put("/:id/toggle-complete", async (req, res) => {
  const { newStatus, forceComplete } = req.body;
  // e.g. { newStatus: "Completed", forceComplete: false }

  try {
    const child = await Test.findById(req.params.id).populate("subTasks");
    if (!child) return res.status(404).json({ msg: "Task not found" });

    // if newStatus isn't "Completed" or if there are no subTasks, we just set
    if (newStatus !== "Completed" || child.subTasks.length === 0) {
      child.status = newStatus;
      await child.save();
      await updateParentIfAllChildrenDone(child.parent);
      return res.json({ msg: `Toggled status to ${newStatus}.` });
    }

    // If newStatus = Completed but child has sub-tasks
    // Check if sub-tasks are all done or if forceComplete is requested
    const notCompletedSub = child.subTasks.filter(
      (c) => c.status !== "Completed"
    );
    if (notCompletedSub.length > 0 && !forceComplete) {
      // some children aren't done
      return res.status(400).json({
        msg: "Cannot set parent to Completed. Some sub-tasks are not completed. Use forceComplete if needed.",
        warning: true,
      });
    }

    // If forceComplete: set child + all children to completed
    if (forceComplete) {
      await completeTaskAndChildren(child._id);
      // after that, check the parent
      await updateParentIfAllChildrenDone(child.parent);
      return res.json({ msg: "Parent and all children forcibly completed." });
    } else {
      // If no incomplete children or sub-tasks are all done
      child.status = "Completed";
      await child.save();
      await updateParentIfAllChildrenDone(child.parent);
      return res.json({
        msg: "Task set to Completed, no sub-tasks incomplete.",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error toggling complete" });
  }
});

/*
  Recursively mark all tasks + sub-tasks as Completed
*/
async function completeTaskAndChildren(taskId) {
  const parentTask = await Test.findById(taskId).populate("subTasks");
  if (!parentTask) return;

  parentTask.status = "Completed";
  await parentTask.save();

  if (parentTask.subTasks.length > 0) {
    for (const st of parentTask.subTasks) {
      await completeTaskAndChildren(st._id);
    }
  }
}

/*
  Update parent if all children done
*/
async function updateParentIfAllChildrenDone(parentId) {
  if (!parentId) return;
  const parent = await Test.findById(parentId).populate("subTasks");
  if (!parent) return;

  const allDone =
    parent.subTasks.length > 0 &&
    parent.subTasks.every((child) => child.status === "Completed");

  parent.status = allDone ? "Completed" : "Not Started";
  await parent.save();

  if (parent.parent) {
    await updateParentIfAllChildrenDone(parent.parent);
  }
}

module.exports = router;
