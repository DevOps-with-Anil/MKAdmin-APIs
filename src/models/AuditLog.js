const mongoose = require('mongoose');


const auditSchema = new mongoose.Schema({
user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
action: String,
module: String,
timestamp: { type: Date, default: Date.now }
});


module.exports = mongoose.model('AuditLog', auditSchema);