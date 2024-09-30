const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference a User model
    required: true,
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant', // Reference to Restaurant model
    required: true,
  },
  items: [
    {
      foodItem: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: [
      'Pending',
      'Confirmed',
      'Preparing',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
    ],
    default: 'Pending',
  },
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Paid'],
    default: 'Unpaid',
  },
  placedAt: {
    type: Date,
    default: Date.now,
  },
  deliveryAddress: {
    type: String,
    required: true,
  },
  estimatedDeliveryTime: {
    type: Date,
  },
});

module.exports = mongoose.model('Order', OrderSchema);
