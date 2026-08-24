const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    department: { type: String },
    description: { type: String, required: true },
    anonymous: { type: Boolean, default: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // null when anonymous
    refNumber: { type: String, required: true, unique: true },
    status: { type: String, enum: ["Pending", "Reviewed", "Resolved"], default: "Pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
