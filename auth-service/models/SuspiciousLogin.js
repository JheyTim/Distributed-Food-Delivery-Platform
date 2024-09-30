const mongoose = require('mongoose');

const SuspiciousLoginSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  ip: {
    type: String,
    required: true,
  },
  device: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('SuspiciousLogin', SuspiciousLoginSchema);
