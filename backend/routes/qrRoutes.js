const express = require("express");
const QRCode = require("qrcode");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");
const crypto = require("crypto");

const router = express.Router();

// ==========================================================
// SCAN PATIENT QR CODE
// GET /api/qr/scan/:qrId
//
// Only doctors and admins can access this route.
//
// The QR code contains only the patient's qrId.
// The backend uses that qrId to find the patient.
// ==========================================================

router.get(
  "/scan/:qrId",
  protect,
  authorize("doctor", "admin"),
  async (req, res) => {
    try {
      const { qrId } = req.params;

      // Make sure qrId exists
      if (!qrId) {
        return res.status(400).json({
          message: "QR ID is required.",
        });
      }

      // Find only a patient.
      //
      // We do NOT return the password.
      // We also return only fields that actually exist
      // in your current User.js schema.
      const patient = await User.findOne({
        qrId: qrId,
        role: "patient",
      }).select(
        "_id name email phone nationalId bloodGroup allergies emergencyContact qrId"
      );

      // Patient not found
      if (!patient) {
        return res.status(404).json({
          message: "Patient not found for this QR code.",
        });
      }

      // Send patient information to doctor/admin
      res.status(200).json({
        message: "Patient found successfully.",

        patient: {
          id: patient._id,
          name: patient.name,
          email: patient.email,
          phone: patient.phone,
          nationalId: patient.nationalId,
          bloodGroup: patient.bloodGroup,
          allergies: patient.allergies,
          emergencyContact: patient.emergencyContact,
          qrId: patient.qrId,
        },
      });
    } catch (err) {
      console.error("QR scan error:", err);

      res.status(500).json({
        message: "Server error while scanning QR code.",
        error: err.message,
      });
    }
  }
);

// ==========================================================
// GENERATE PATIENT QR CODE
// GET /api/qr/:patientId
//
// This route is used by MyProfile.jsx.
//
// The QR image contains ONLY patient.qrId.
// ==========================================================

router.get(
  "/:patientId",
  protect,
  async (req, res) => {
    try {
      const patient = await User.findById(
        req.params.patientId
      ).select("-password");

      // Check patient exists
      if (
        !patient ||
        patient.role !== "patient"
      ) {
        return res.status(404).json({
          message: "Patient not found",
        });
      }

      // ======================================================
      // SECURITY:
      // A patient can only retrieve their own QR.
      //
      // Doctors and admins can retrieve a patient's QR.
      // ======================================================

      if (
        req.user.role === "patient" &&
        req.user.id !== req.params.patientId
      ) {
        return res.status(403).json({
          message:
            "You can only access your own QR code.",
        });
      }

      if (
        req.user.role !== "patient" &&
        req.user.role !== "doctor" &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          message:
            "You are not authorized to access this QR code.",
        });
      }

      // ======================================================
      // CREATE qrId IF AN OLD PATIENT DOES NOT HAVE ONE
      // ======================================================

      if (!patient.qrId) {
        patient.qrId =
          crypto.randomBytes(6).toString("hex");

        await patient.save();
      }

      // ======================================================
      // CREATE QR IMAGE
      // ======================================================

      const qrDataUrl = await QRCode.toDataURL(
        patient.qrId
      );

      // Return patient + QR image
      res.status(200).json({
        patient,
        qrCode: qrDataUrl,
      });
    } catch (err) {
      console.error(
        "QR generation error:",
        err
      );

      res.status(500).json({
        message: "Server error",
        error: err.message,
      });
    }
  }
);

module.exports = router;