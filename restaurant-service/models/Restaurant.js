const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true,
   },
   description: {
      type: String,
   },
   price: {
      type: Number,
      required: true,
   },
   available: {
      type: Boolean,
      default: true,
   },
});

const RestaurantSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true,
   },
   address: {
      type: String,
      required: true,
   },
   menu: [MenuItemSchema],
   openingHours: {
      type: String, // e.g., "9:00 AM - 10:00 PM"
      required: true,
   },
   isOpen: {
      type: Boolean,
      default: false, // Track if the restaurant is currently open for orders
   },
   createdAt: {
      type: Date,
      default: Date.now,
   },
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);
