const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema(
  {
    source: String,
    description: String,
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["pending", "approved", "received"],
      default: "pending",
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Income", incomeSchema);
