const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    personal: {
      birthdate: Date,
      address: String,
      phone: String,
    },
    employment: {
      type: {
        type: String,
        enum: ["regular", "probationary", "contractual", "trainee"],
        default: "regular",
      },
      hireDate: Date,
      endDate: Date,
      manager: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: {
        type: String,
        enum: ["active", "resigned", "terminated"],
        default: "active",
      },
    },
    statutory: {
      sss: String,
      philhealth: String,
      pagibig: String,
      tin: String,
    },
    salary: {
      payType: {
        type: String,
        enum: ["monthly", "daily", "hourly"],
        default: "monthly",
      },
      basic: { type: Number, default: 0 },
      allowances: { type: Number, default: 0 },
    },
    files: [{ filename: String, path: String, uploadedAt: Date }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
