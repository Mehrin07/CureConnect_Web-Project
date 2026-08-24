const express = require("express");
const crypto = require("crypto");
const Complaint = require("../models/Complaint");

const router = express.Router();

// @route  POST /api/complaints
// @desc   Submit a complaint, anonymous by default (no auth required)
router.post("/", async (req, res) => {
  try {
    const { category, department, description, anonymous, submittedBy } = req.body;
    const refNumber = "CMP-" + crypto.randomBytes(4).toString("hex").toUpperCase();

    const complaint = await Complaint.create({
      category,
      department,
      description,
      anonymous: anonymous !== false,
      submittedBy: anonymous === false ? submittedBy : null,
      refNumber,
    });

    res.status(201).json({ message: "Complaint submitted", refNumber: complaint.refNumber });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
