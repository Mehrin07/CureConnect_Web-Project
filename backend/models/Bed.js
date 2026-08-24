const mongoose = require("mongoose");

const bedSchema = new mongoose.Schema({
  department: { type: String, required: true, unique: true }, // e.g. General Ward, ICU, Emergency
  totalBeds: { type: Number, required: true },
  occupiedBeds: { type: Number, required: true, default: 0 },
});

module.exports = mongoose.model("Bed", bedSchema);
