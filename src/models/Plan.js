const mongoose = require('mongoose');


const planSchema = new mongoose.Schema({
name: String,
price: Number,
features: [String]
});


module.exports = mongoose.model('Plan', planSchema);