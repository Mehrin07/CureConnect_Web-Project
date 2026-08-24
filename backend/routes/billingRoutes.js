const express = require("express");
const Bill = require("../models/Bill");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// ============================================================
// CREATE / GENERATE BILL
// POST /api/bills
//
// Only doctor and admin can create a bill.
// ============================================================
router.post(
  "/",
  protect,
  authorize("doctor", "admin"),
  async (req, res) => {
    try {
      const {
        patientId,
        items,
        paymentMethod,
      } = req.body;

      // ======================================================
      // VALIDATE PATIENT
      // ======================================================

      if (!patientId) {
        return res.status(400).json({
          message: "Please select a patient.",
        });
      }

      const patient = await User.findById(patientId);

      if (!patient) {
        return res.status(404).json({
          message: "Patient not found.",
        });
      }

      if (patient.role !== "patient") {
        return res.status(400).json({
          message: "Selected user is not a patient.",
        });
      }

      // ======================================================
      // VALIDATE ITEMS
      // ======================================================

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          message: "Please add at least one bill item.",
        });
      }

      for (const item of items) {
        if (!item.name || item.name.trim() === "") {
          return res.status(400).json({
            message: "Every bill item must have a name.",
          });
        }

        if (
          typeof item.amount !== "number" ||
          Number.isNaN(item.amount) ||
          item.amount < 0
        ) {
          return res.status(400).json({
            message: "Every bill item must have a valid amount.",
          });
        }
      }

      // ======================================================
      // CALCULATE TOTALS
      // ======================================================

      const subtotal = items.reduce(
        (sum, item) => sum + Number(item.amount),
        0
      );

      // 5% tax
      const tax = Math.round(subtotal * 0.05);

      const total = subtotal + tax;

      // ======================================================
      // CREATE BILL
      // ======================================================

      const bill = await Bill.create({
        patient: patientId,
        items,
        subtotal,
        tax,
        total,
        paymentMethod: paymentMethod || "Cash",
      });

      // ======================================================
      // RETURN CREATED BILL
      // ======================================================

      res.status(201).json({
        message: "Bill created successfully.",
        bill,
      });
    } catch (err) {
      console.error("Create bill error:", err);

      res.status(500).json({
        message: "Server error while creating bill.",
        error: err.message,
      });
    }
  }
);

// ============================================================
// GET ALL BILLS OF LOGGED-IN PATIENT
// GET /api/bills/mine
//
// A patient can only see their own bills.
// ============================================================
router.get(
  "/mine",
  protect,
  authorize("patient"),
  async (req, res) => {
    try {
      const bills = await Bill.find({
        patient: req.user.id,
      }).sort({
        createdAt: -1,
      });

      res.json(bills);
    } catch (err) {
      console.error("Get patient bills error:", err);

      res.status(500).json({
        message: "Server error while loading bills.",
        error: err.message,
      });
    }
  }
);

module.exports = router;