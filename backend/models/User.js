const mongoose = require("mongoose");

// One schema handles Patient, Doctor and Admin — the "role" field
// decides which type of user this is.
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
    },

    nationalId: {
      type: String,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: "patient",
    },

    // =========================
    // Patient fields
    // =========================

    bloodGroup: {
      type: String,
    },

    allergies: {
      type: String,
    },

    emergencyContact: {
      type: String,
    },

    // This is the value encoded inside the patient's QR code.
    // It should never contain the patient's medical information itself.
    qrId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    // =========================
    // Doctor fields
    // =========================

    department: {
      type: String,
    },

    specialty: {
      type: String,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);