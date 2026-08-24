const express = require("express");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// ============================================================
// GET ALL PATIENTS
// GET /api/patients
//
// Doctors and admins can use this list when creating bills.
// ============================================================
router.get(
  "/",
  protect,
  authorize("doctor", "admin"),
  async (req, res) => {
    try {
      const patients = await User.find({
        role: "patient",
      })
        .select("_id name email phone")
        .sort({ name: 1 });

      res.json(patients);
    } catch (err) {
      console.error("Get patients error:", err);

      res.status(500).json({
        message: "Server error while loading patients.",
        error: err.message,
      });
    }
  }
);

// ============================================================
// UPDATE PATIENT PROFILE
// PUT /api/patients/:patientId
//
// Patient can update only their own profile.
// ============================================================
router.put(
  "/:patientId",
  protect,
  authorize("patient"),
  async (req, res) => {
    try {
      // Patient can update only their own profile
      if (req.user.id !== req.params.patientId) {
        return res.status(403).json({
          message: "You can only update your own profile.",
        });
      }

      const patient = await User.findById(req.params.patientId);

      if (!patient) {
        return res.status(404).json({
          message: "Patient not found.",
        });
      }

      if (patient.role !== "patient") {
        return res.status(403).json({
          message: "Only patient profiles can be updated here.",
        });
      }

      const {
        name,
        phone,
        dateOfBirth,
        gender,
        address,
        bloodGroup,
        allergies,
        emergencyContact,
        emergencyContactName,
      } = req.body;

      // ==========================================
      // VALIDATION
      // ==========================================

      const namePattern = /^[A-Za-z.\s]+$/;
      const phonePattern = /^01[3-9]\d{8}$/;

      if (!name || !namePattern.test(name.trim())) {
        return res.status(400).json({
          message:
            "Name can contain letters, spaces and periods only.",
        });
      }

      if (!phone || !phonePattern.test(phone.trim())) {
        return res.status(400).json({
          message:
            "Please enter a valid Bangladesh phone number.",
        });
      }

      if (
        emergencyContactName &&
        !namePattern.test(emergencyContactName.trim())
      ) {
        return res.status(400).json({
          message:
            "Emergency Contact Name can contain letters, spaces and periods only.",
        });
      }

      if (
        emergencyContact &&
        !phonePattern.test(emergencyContact.trim())
      ) {
        return res.status(400).json({
          message:
            "Please enter a valid emergency contact number.",
        });
      }

      // ==========================================
      // UPDATE PATIENT
      // ==========================================

      patient.name = name.trim();
      patient.phone = phone.trim();
      patient.dateOfBirth = dateOfBirth || null;
      patient.gender = gender || "";
      patient.address = address || "";
      patient.bloodGroup = bloodGroup || "";
      patient.allergies = allergies || "";
      patient.emergencyContact =
        emergencyContact || "";
      patient.emergencyContactName =
        emergencyContactName || "";

      await patient.save();

      // ==========================================
      // RESPONSE
      // ==========================================

      res.json({
        message: "Profile updated successfully.",

        patient: {
          id: patient._id,
          name: patient.name,
          email: patient.email,
          phone: patient.phone,
          dateOfBirth: patient.dateOfBirth,
          gender: patient.gender,
          address: patient.address,
          bloodGroup: patient.bloodGroup,
          allergies: patient.allergies,
          emergencyContact: patient.emergencyContact,
          emergencyContactName:
            patient.emergencyContactName,
          role: patient.role,
        },
      });
    } catch (err) {
      console.error("Profile update error:", err);

      res.status(500).json({
        message: "Server error while updating profile.",
        error: err.message,
      });
    }
  }
);

module.exports = router;