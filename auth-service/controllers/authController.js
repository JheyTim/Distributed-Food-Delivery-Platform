const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Helper function to generate tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } // Access token valid for 15 minutes
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' } // Refresh token valid for 7 days
  );

  return { accessToken, refreshToken };
};

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    user = new User({ name, email, password, role });
    await user.save();

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(201).json({ token });
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
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Password Reset Request',
        text: message,
      };

      await transporter.sendMail(mailOptions);
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
