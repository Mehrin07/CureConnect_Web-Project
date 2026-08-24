const mongoose = require("mongoose");

const labReportSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    testName: { type: String, required: true },
    verifier1: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    verifier2: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    status: {
      type: String,
      enum: ["Awaiting Review", "In Review", "Finalized"],
      default: "Awaiting Review",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LabReport", labReportSchema);
