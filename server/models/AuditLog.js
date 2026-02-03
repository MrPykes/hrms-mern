const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: String,
  targetType: String,
  targetId: mongoose.Schema.Types.ObjectId,
  meta: Object
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditSchema);
