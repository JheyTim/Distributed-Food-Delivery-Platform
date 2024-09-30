require('dotenv').config();
// require('./config/passport');

const express = require('express');
const cors = require('cors');
// const passport = require('passport');
// const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();

connectDB();

app.use(express.json());

app.use(
  cors({
    // origin: ['https://your-frontend-domain.com'], // Add allowed domains here
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use('/auth', authRoutes);

// Google OAuth
// app.get(
//   '/auth/google',
//   passport.authenticate('google', { scope: ['profile', 'email'] })
// );

// app.get(
//   '/auth/google/callback',
//   passport.authenticate('google', { session: false }),
//   (req, res) => {
//     // Send JWT token after Google login
//     const payload = { user: { id: req.user.id, role: req.user.role } };
//     const token = jwt.sign(payload, process.env.JWT_SECRET, {
//       expiresIn: '1h',
//     });
//     res.json({ token });
//   }
// );

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
