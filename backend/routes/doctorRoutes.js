const express = require("express");
const Doctor = require("../models/Doctor");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// ======================================================
// GET ALL DOCTORS
// Optional filters:
//   ?department=Cardiology
//   ?availableOnly=true
// ======================================================
router.get("/", async (req, res) => {
  try {
    const { department, availableOnly } = req.query;

    const filter = {};

    if (department) {
      filter.department = department;
    }

    if (availableOnly === "true") {
      filter.status = "Available";
    }

    const doctors = await Doctor.find(filter).populate(
      "userId",
      "name email"
    );

  

    // ==================================================
    // FORMAT RESPONSE FOR FRONTEND
    // ==================================================
    const result = doctors.map((doctor) => ({
      _id: doctor.userId?._id,
       doctorRecordId: doctor._id,
      
      name: doctor.userId?.name || "Unknown Doctor",

      email: doctor.userId?.email || "",

      department: doctor.department,

      specialty: doctor.specialization,

      phone: doctor.phone,

      experience: doctor.experience,

      roomNumber: doctor.roomNumber,

      availableDays: doctor.availableDays,

      isAvailable: doctor.status === "Available",
    }));

    res.json(result);
  } catch (error) {
    console.error("Error fetching doctors:", error);

    res.status(500).json({
      message: "Server error.",
      error: error.message,
    });
  }
});

// ======================================================
// UPDATE A DOCTOR'S CURRENT AVAILABILITY
// Only doctors and admins can change availability
// ======================================================
router.patch(
  "/:id/availability",
  protect,
  authorize("doctor", "admin"),
  async (req, res) => {
    try {
      const { isAvailable } = req.body;

      if (typeof isAvailable !== "boolean") {
        return res.status(400).json({
          message: "isAvailable must be true or false.",
        });
      }

      const doctor = await Doctor.findByIdAndUpdate(
        req.params.id,
        {
          status: isAvailable ? "Available" : "Unavailable",
        },
        { new: true }
      ).populate("userId", "name email");

      if (!doctor) {
        return res.status(404).json({
          message: "Doctor not found.",
        });
      }

      res.json({
        _id: doctor._id,

        // User model uses "name"
        name: doctor.userId?.name || "Unknown Doctor",

        email: doctor.userId?.email || "",

        department: doctor.department,

        specialty: doctor.specialization,

        phone: doctor.phone,

        experience: doctor.experience,

        roomNumber: doctor.roomNumber,

        availableDays: doctor.availableDays,

        isAvailable: doctor.status === "Available",
      });
    } catch (error) {
      console.error("Error updating doctor availability:", error);

      res.status(500).json({
        message: "Server error.",
        error: error.message,
      });
    }
  }
);

module.exports = router;