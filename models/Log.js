const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
    eventType: { type: String, required: true },
    timestamp: { type: Date, required: true },
    sourceApp: { type: String, required: true },
    dataPayload: { type: Object, required: true },
    hash: { type: String, required: true },
    previousHash: { type: String },
});

module.exports = mongoose.model('Log', LogSchema);
