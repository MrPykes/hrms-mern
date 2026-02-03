const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  periodStart: Date,
  periodEnd: Date,
  basic: Number,
  overtime: Number,
  deductions: Object,
  contributions: Object,
  grossPay: Number,
  netPay: Number,
  payslipPath: String,
  status: { type: String, enum: ['draft','finalized','paid'], default: 'draft' }
}, { timestamps: true });

module.exports = mongoose.model('Payroll', payrollSchema);
