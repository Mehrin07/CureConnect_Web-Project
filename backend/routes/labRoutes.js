const express = require("express");
const LabReport = require("../models/LabReport");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Create a new lab report
// Only doctors and admins can create reports
router.post(
  "/",
  protect,
  authorize("doctor", "admin"),
  async (req, res) => {
    try {
      const { patientId, testName } = req.body;

      if (!patientId || !testName) {
        return res.status(400).json({
          message: "Patient ID and test name are required.",
        });
      }

      const report = await LabReport.create({
        patient: patientId,
        testName,
        status: "Awaiting Review",
      });

      res.status(201).json(report);
    } catch (error) {
      res.status(500).json({
        message: "Server error.",
        error: error.message,
      });
    }
  }
);
// Get all lab reports for doctors/admins
router.get(
  "/",
  protect,
  authorize("doctor", "admin"),
  async (req, res) => {
    try {
      const reports = await LabReport.find()
        .populate("patient", "name email")
        .populate("verifier1", "name email")
        .populate("verifier2", "name email")
        .sort({ createdAt: -1 });

      res.json(reports);
    } catch (error) {
      res.status(500).json({
        message: "Server error.",
        error: error.message,
      });
    }
  }
);


// Get finalized reports for the logged-in patient
router.get(
  "/mine",
  protect,
  authorize("patient"),
  async (req, res) => {
    try {
      const reports = await LabReport.find({
        patient: req.user.id,
        status: "Finalized",
      })
        .populate("verifier1", "name")
        .populate("verifier2", "name")
        .sort({ createdAt: -1 });

      res.json(reports);
    } catch (error) {
      res.status(500).json({
        message: "Server error.",
        error: error.message,
      });
    }
  }
);

// Verify a lab report
// Two different doctors/admins must verify the report
router.patch(
  "/:id/verify",
  protect,
  authorize("doctor", "admin"),
  async (req, res) => {
    try {
      const report = await LabReport.findById(req.params.id);

      if (!report) {
        return res.status(404).json({
          message: "Report not found.",
        });
      }

      // First verification
      if (!report.verifier1) {
        report.verifier1 = req.user.id;
        report.status = "In Review";
      }

      // Second verification
      else if (
        !report.verifier2 &&
        String(report.verifier1) !== String(req.user.id)
      ) {
        report.verifier2 = req.user.id;
        report.status = "Finalized";
      }

      // Prevent the same user from verifying twice
      else {
        return res.status(400).json({
          message:
            "You have already verified this report, or the report is already finalized.",
        });
      }

      await report.save();

      const updatedReport = await LabReport.findById(report._id)
        .populate("patient", "name email")
        .populate("verifier1", "name email")
        .populate("verifier2", "name email");

      res.json(updatedReport);
    } catch (error) {
      res.status(500).json({
        message: "Server error.",
        error: error.message,
      });
    }
  }
);

module.exports = router;