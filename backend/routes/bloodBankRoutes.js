const express = require("express");
const BloodBank = require("../models/BloodBank");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// @route  GET /api/blood-bank
router.get("/", async (req, res) => {
  try {
    const stock = await BloodBank.find().sort({ bloodGroup: 1 });
    res.json(stock);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route  PATCH /api/blood-bank/:bloodGroup
// @desc   Admin updates unit count for a blood group (creates it if missing)
router.patch("/:bloodGroup", protect, authorize("admin"), async (req, res) => {
  try {
    const { unitsAvailable } = req.body;
    const record = await BloodBank.findOneAndUpdate(
      { bloodGroup: req.params.bloodGroup },
      { unitsAvailable },
      { new: true, upsert: true }
    );
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
