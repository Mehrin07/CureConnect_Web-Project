const express = require("express");
const crypto = require("crypto");
const Complaint = require("../models/Complaint");
const {
  protect,
  authorize,
} = require("../middleware/auth");

const router = express.Router();


// ======================================================
// POST /api/complaints
// Submit a complaint / feedback
// ======================================================
router.post("/", async (req, res) => {
  try {
    const {
      category,
      department,
      description,
      anonymous,
      submittedBy,
    } = req.body;

    const refNumber =
      "CMP-" +
      crypto
        .randomBytes(4)
        .toString("hex")
        .toUpperCase();

    const complaint = await Complaint.create({
      category,
      department,
      description,
      anonymous: anonymous !== false,
      submittedBy:
        anonymous === false
          ? submittedBy
          : null,
      refNumber,
    });

    res.status(201).json({
      message: "Complaint submitted",
      refNumber: complaint.refNumber,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});


// ======================================================
// GET /api/complaints
// Admin views all feedback / complaints
// ======================================================
router.get(
  "/",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const complaints = await Complaint.find()
        .populate("submittedBy", "name email")
        .sort({ createdAt: -1 });

      res.json(complaints);
    } catch (err) {
      res.status(500).json({
        message: "Server error",
        error: err.message,
      });
    }
  }
);


module.exports = router;