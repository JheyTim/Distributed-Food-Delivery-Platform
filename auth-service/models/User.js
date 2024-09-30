const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  activationToken: {
    type: String, //Token for account activation
  },
  isVerified: {
    type: Boolean,
    default: false, // Set to false by default until email is verified
  },
  allowedIPs: [
    {
      type: String, // Store allowed IP addresses
    },
  ],
  allowedDevices: [
    {
      type: String, // Store allowed device/browser information
    },
  ],
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Generate password reset token
UserSchema.methods.generateResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash the token and set it to the resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set token expiration time (1 hour from now)
  this.resetPasswordExpires = Date.now() + 3600000;

  return resetToken;
};

// Generate activation token
UserSchema.methods.generateActivationToken = function () {
  const activationToken = crypto.randomBytes(20).toString('hex');

  this.activationToken = crypto
    .createHash('sha256')
    .update(activationToken)
    .digest('hex');

  return activationToken;
};

module.exports = mongoose.model('User', UserSchema);
