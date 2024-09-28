const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['Customer', 'Restaurant Owner', 'Delivery Person'],
    default: 'Customer',
  },
  googleId: {
    type: String,
  },
  refreshToken: {
    type: String,
  },
});

module.exports = mongoose.model('User', UserSchema);
