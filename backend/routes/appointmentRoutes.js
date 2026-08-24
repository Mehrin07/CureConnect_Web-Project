const express = require("express");
const Appointment = require("../models/Appointment");
const { protect } = require("../middleware/auth");

const router = express.Router();

// @route  POST /api/appointments
// @desc   Book an appointment with a doctor (Smart Appointment System)
//         Automatically assigns the next token number and queue position for that doctor today.
router.post("/", protect, async (req, res) => {
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

    // Waiting tracker: assume ~10 minutes per patient ahead in queue
    const patientsAhead = todaysCount;
    const estimatedWaitMinutes = patientsAhead * 10;

    res.status(201).json({
      appointment,
      patientsAhead,
      estimatedWaitMinutes,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route  GET /api/appointments/mine
// @desc   Patient views their own appointment history
router.get("/mine", protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user.id })
      .populate("doctor", "name specialty department")
      .sort({ createdAt: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
