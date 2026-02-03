const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
  name: String,
  date: Date,
  type: { type: String, enum: ['regular','special','local'], default: 'regular' },
  manualOverride: { type: Boolean, default: false }
});

module.exports = mongoose.model('Holiday', holidaySchema);
