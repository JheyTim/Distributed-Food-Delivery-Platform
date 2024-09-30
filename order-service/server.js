require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const orderRoutes = require('./routes/orderRoutes');
const http = require('http');
const socketio = require('socket.io');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use('/orders', orderRoutes);

// Create HTTP server and WebSocket server
const server = http.createServer(app);
const io = socketio(server);

// Listen for WebSocket connections
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  socket.join(userId); // Each user has their own room

  socket.on('disconnect', () => {
    console.log(`User ${userId} disconnected`);
  });
});

// Emit updates when order status changes
app.set('io', io);

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Order Service running on port ${PORT}`));
