const express = require("express");
const Bed = require("../models/Bed");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// @route  GET /api/beds
router.get("/", async (req, res) => {
  try {
    const beds = await Bed.find();
    res.json(beds);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route  PATCH /api/beds/:department
router.patch("/:department", protect, authorize("admin"), async (req, res) => {
  try {
    const { totalBeds, occupiedBeds } = req.body;
    const bed = await Bed.findOneAndUpdate(
      { department: req.params.department },
      { totalBeds, occupiedBeds },
      { new: true, upsert: true }
    );
    res.json(bed);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
