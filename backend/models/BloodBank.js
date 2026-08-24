const mongoose = require("mongoose");

const bloodBankSchema = new mongoose.Schema({
  bloodGroup: { type: String, required: true, unique: true },
  unitsAvailable: { type: Number, required: true, default: 0 },
});

module.exports = mongoose.model("BloodBank", bloodBankSchema);
