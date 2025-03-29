// routes/tagRoutes.js
const express = require("express");
const router = express.Router();
const Tag = require("../models/Tag");

/* 1) Create a new Tag (optionally with a parent) */
router.post("/", async (req, res) => {
  const { name, parent } = req.body;
  if (!name) {
    return res.status(400).json({ msg: "Tag name is required" });
  }
  try {
    // create the tag
    const newTag = new Tag({ name, parent });
    const savedTag = await newTag.save();

    // if there's a parent, push this into parent.subTags
    if (parent) {
      const parentTag = await Tag.findById(parent);
      if (parentTag) {
        parentTag.subTags.push(savedTag._id);
        await parentTag.save();
      }
    }

    res.json(savedTag);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error creating tag", error: err.message });
  }
});

/* 2) GET all Tags (optionally: search by name or build a tree) */
router.get("/", async (req, res) => {
  const { name } = req.query;
  let query = {};
  if (name) {
    query.name = { $regex: name, $options: "i" };
  }
  try {
    // populate subTags up to 1 level, or do multi-level if you prefer
    const tags = await Tag.find(query)
      .populate("parent", "name") // "name" means only fetch the 'name' field from the parent
      .populate("subTags", "name")
      .sort({ createdAt: -1 });
    res.json(tags);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching tags", error: err.message });
  }
});

/* 3) GET single Tag by ID (with children) */
router.get("/:id", async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id).populate("subTags");
    if (!tag) return res.status(404).json({ msg: "Tag not found" });
    res.json(tag);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching tag", error: err.message });
  }
});

/* 4) UPDATE Tag (change name or re-parent) */
router.put("/:id", async (req, res) => {
  const { name, parent } = req.body;
  try {
    let tag = await Tag.findById(req.params.id);
    if (!tag) return res.status(404).json({ msg: "Tag not found" });

    // if re-parenting, we remove from old parent's subTags and push into new parent's subTags
    const oldParent = tag.parent ? tag.parent.toString() : null;
    if (parent && parent !== oldParent) {
      // remove from old parent's subTags
      if (oldParent) {
        const oldParentTag = await Tag.findById(oldParent);
        if (oldParentTag) {
          oldParentTag.subTags = oldParentTag.subTags.filter(
            (tid) => tid.toString() !== tag._id.toString()
          );
          await oldParentTag.save();
        }
      }
      // add to new parent's subTags
      const newParentTag = await Tag.findById(parent);
      if (newParentTag) {
        newParentTag.subTags.push(tag._id);
        await newParentTag.save();
      }
      tag.parent = parent;
    } else if (!parent && oldParent) {
      // remove from old parent's subTags if removing parent
      const oldParentTag = await Tag.findById(oldParent);
      if (oldParentTag) {
        oldParentTag.subTags = oldParentTag.subTags.filter(
          (tid) => tid.toString() !== tag._id.toString()
        );
        await oldParentTag.save();
      }
      tag.parent = null;
    }

    if (name !== undefined) tag.name = name;

    const updatedTag = await tag.save();
    res.json(updatedTag);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error updating tag", error: err.message });
  }
});

/* 5) DELETE Tag */
router.delete("/:id", async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    if (!tag) return res.status(404).json({ msg: "Tag not found" });

    // remove from parent's subTags if needed
    if (tag.parent) {
      const parentTag = await Tag.findById(tag.parent);
      if (parentTag) {
        parentTag.subTags = parentTag.subTags.filter(
          (tid) => tid.toString() !== tag._id.toString()
        );
        await parentTag.save();
      }
    }
    // optionally, you can recursively delete subTags or re-parent them
    // for now, let's just delete
    await Tag.findByIdAndDelete(tag._id);

    res.json({ msg: "Tag removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error deleting tag", error: err.message });
  }
});

router.get("/hierarchy", async (req, res) => {
  try {
    // We do NOT populate subTags here, so subTags is just an array of ObjectIds.
    // We only need each tag's parent and subTags references.
    const allTags = await Tag.find({}).lean();
    res.json(allTags);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching tags hierarchy" });
  }
});

// routes/tagRoutes.js
router.get("/hierarchy-server", async (req, res) => {
  try {
    // Populate subTags multiple levels deep, e.g. up to 3 levels:
    const allTags = await Tag.find({})
      .populate({
        path: "subTags",
        populate: {
          path: "subTags",
          populate: {
            path: "subTags",
          },
        },
      })
      .lean();
    res.json(allTags);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching tags hierarchy" });
  }
});

module.exports = router;
