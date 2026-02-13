const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema(
  {
    source: String,
    description: String,
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    clientName: { type: String },
    dateFrom: { type: Date },
    dateTo: { type: Date },
    account: { type: String },
    status: { type: String },
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Income", incomeSchema);
