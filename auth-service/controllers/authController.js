const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Blacklist = require('../models/Blacklist');
const { generateTokens } = require('../utils/generateTokens');
const { sendEmail } = require('../utils/sendEmail');

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // Create new User
    user = new User({ name, email, password, role });

    // Generate activation token
    const activationToken = user.generateActivationToken();
    await user.save();

    // Send activation email
    const activationUrl = `${req.protocol}://${req.get(
      'host'
    )}/auth/activate/${activationToken}`;

    const message = `
    Welcome to our platform! Please activate your account by clicking the following link:
    ${activationUrl}
    `;

    try {
      sendEmail(message, user.email, 'Account Activation');

      res.send({ message: 'Activation email sent.' });
    } catch (error) {
      console.error(error);
      user.activationToken = undefined;
      await user.save();
      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: 'Please verify your email to activate your account' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // Save refresh token in the database
    user.refreshToken = refreshToken;

    await user.save();

    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

exports.logout = async (req, res) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(400).json({ message: 'No token provided' });
  }

  try {
    const tokenStr = token.split(' ')[1];

    // Decode the token to get the expiration time
    const decoded = jwt.decode(tokenStr);

    // Add the token to the blacklist with the expiration time
    const expiresAt = new Date(decoded.exp * 1000); // Convert to milliseconds

    await Blacklist.create({ token: tokenStr, expiresAt });

    res.send({ message: 'Logged out successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Refresh token
exports.refreshToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ message: 'No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ message: 'Invalid refresh token.' });
    }

    // Generate a new access token
    const { accessToken } = generateTokens(user);

    res.json({ accessToken });
  } catch (error) {
    console.error(error);
    res.status(403).json({ message: 'Invalid token' });
  }
};

// Request password reset
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = user.generateResetPasswordToken();
    await user.save();

    // Send email with reset link
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/auth/reset-password/${resetToken}`;

    const message = `
    You requested a password reset. Please make a PUT request to:
    ${resetUrl}
    `;

    try {
      // Send email (using nodemailer or a service like sendgrid)
      sendEmail(message, user.email, 'Password Reset Request');

      res.status(200).json({ message: 'Email sent' });
    } catch (error) {
      console.error(error);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Hash the token and compare it to the one in the database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }, // Check if token is still valid
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been reset' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

exports.activateAccount = async (req, res) => {
  const { token } = req.params;

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      activationToken: hashedToken,
      isVerified: false,
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: 'Invalid or expired activation token' });
    }

    // Activate the user's account
    user.isVerified = true;
    user.activationToken = undefined; // Clear the token after activation
    await user.save();

    res.send({ message: 'Account activated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

exports.resendActivationEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if the user is already verified
    if (user.isVerified) {
      return res.status(400).json({ message: 'Account is already activated' });
    }

    // Generate a new activation token
    const activationToken = user.generateActivationToken();
    await user.save();

    // Send the new activation email
    const activationUrl = `${req.protocol}://${req.get(
      'host'
    )}/auth/activate/${activationToken}`;

    const message = `
        You requested a new account activation. Please activate your account by clicking the following link:
        ${activationUrl}
     `;

    try {
      sendEmail(message, user.email, 'Resend Account Activation');

      res.status(200).json({ message: 'Activation email resent' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Generate and send OTP for MFA
exports.sendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate OTP (6-digit)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP before saving it
    user.otp = crypto.createHash('sha256').update(otp).digest('hex');
    user.otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes

    await user.save();

    // Send OTP via email

    const message = `Your OTP for login is: ${otp}. It is valid for 10 minutes.`;

    sendEmail(message, user.email, 'Your MFA OTP Code');

    res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if OTP is valid and not expired
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
    if (user.otp !== hashedOTP || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // OTP is valid, mark as verified
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Generate JWT token for the session
    const { accessToken, refreshToken } = generateTokens(user);

    res.json({ accessToken, refreshToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
