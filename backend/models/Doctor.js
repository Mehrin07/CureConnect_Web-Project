const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  department: {
    type: String,
    required: true
  },
  specialization: String,
  phone: String,
  experience: Number,
  roomNumber: String,
  availableDays: [String],
  status: String
});

module.exports = mongoose.model("Doctor", doctorSchema, "doctors");