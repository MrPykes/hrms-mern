const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  type: { type: String, enum: ['Vacation','Sick','Unpaid','Custom'], required: true },
  startDate: Date,
  endDate: Date,
  days: Number,
  reason: String,
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  approver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Leave', leaveSchema);
