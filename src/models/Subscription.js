const mongoose = require('mongoose');


const subSchema = new mongoose.Schema({
tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
status: { type: String, default: 'ACTIVE' }
});


module.exports = mongoose.model('Subscription', subSchema);