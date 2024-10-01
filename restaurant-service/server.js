require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const restaurantRoutes = require('./routes/restaurantRoutes');
const { connectRabbitMQ } = require('./utils/rabbitmq');


const app = express();

// Connect to MongoDB
connectDB();

connectRabbitMQ();

// Middleware
app.use(express.json());

// Routes
app.use('/restaurants', restaurantRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Restaurant Service running on port ${PORT}`));
