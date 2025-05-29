const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    address: { type: String, unique: true, required: true },
    balance: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Wallet', walletSchema);
