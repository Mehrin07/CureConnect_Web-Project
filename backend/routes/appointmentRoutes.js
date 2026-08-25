const express = require("express");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// ======================================================
// POST /api/appointments
// Book an appointment
// ======================================================
router.post("/", protect, authorize("patient"), async (req, res) => {
  try {
    const { doctorId } = req.body;
    const patientId = req.user.id;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todaysCount = await Appointment.countDocuments({
      doctor: doctorId,
      status: "Booked",
      createdAt: { $gte: startOfDay },
    });

    const tokenNumber = todaysCount + 1;

    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      tokenNumber,
    });

    const patientsAhead = todaysCount;
    const estimatedWaitMinutes = patientsAhead * 10;

    res.status(201).json({
      appointment,
      patientsAhead,
      estimatedWaitMinutes,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});


// ======================================================
// GET /api/appointments/mine
// Patient views their own appointment history
// ======================================================
router.get("/mine", protect, authorize("patient"), async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patient: req.user.id,
    })
      .populate("doctor", "name email")
      .sort({ createdAt: -1 });

    const result = await Promise.all(
      appointments.map(async (appointment) => {
        const appointmentData = appointment.toObject();

        if (appointment.doctor) {
          // Find Doctor document using the User ID
          const doctorProfile = await Doctor.findOne({
            userId: appointment.doctor._id,
          });

          appointmentData.doctor = {
            ...appointment.doctor.toObject(),

            specialty:
              doctorProfile?.specialization||
              "Not specified",

            department:
              doctorProfile?.department ||
              "Not specified",
          };
        }

        return appointmentData;
      })
    );

    res.json(result);
  } catch (err) {
    console.error(
      "Error fetching patient appointments:",
      err
    );

    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});


// ======================================================
// DELETE /api/appointments/:id
// Patient cancels their own appointment
// ======================================================
router.delete(
  "/:id",
  protect,
  authorize("patient"),
  async (req, res) => {
    try {
      const appointment = await Appointment.findById(
        req.params.id
      );

      if (!appointment) {
        return res.status(404).json({
          message: "Appointment not found",
        });
      }

      // Make sure the appointment belongs to
      // the logged-in patient
      if (
        appointment.patient.toString() !==
        req.user.id
      ) {
        return res.status(403).json({
          message:
            "You can only cancel your own appointment",
        });
      }

      // Prevent cancelling an already
      // completed/cancelled appointment
      if (appointment.status !== "Booked") {
        return res.status(400).json({
          message:
            `Appointment is already ${appointment.status}`,
        });
      }

      // Keep the record but mark it as cancelled
      appointment.status = "Cancelled";

      await appointment.save();

      res.json({
        message:
          "Appointment cancelled successfully",
        appointment,
      });
    } catch (err) {
      res.status(500).json({
        message: "Server error",
        error: err.message,
      });
    }
  }
);


module.exports = router;