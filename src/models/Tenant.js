const mongoose = require('mongoose');


const tenantSchema = new mongoose.Schema({
name: { type: String, required: true },
status: { type: String, default: 'ACTIVE' }
}, { timestamps: true });


module.exports = mongoose.model('Tenant', tenantSchema);