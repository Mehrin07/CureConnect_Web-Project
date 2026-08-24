const mongoose = require("mongoose");

const billItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const billSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [billItemSchema],
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["Cash", "Card", "Insurance"], default: "Cash" },
    status: { type: String, enum: ["Unpaid", "Paid"], default: "Unpaid" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bill", billSchema);
