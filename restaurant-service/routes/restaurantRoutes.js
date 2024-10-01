// routes/restaurantRoutes.js
const express = require('express');
const router = express.Router();
const {
  addRestaurant,
  getAllRestaurants,
  updateRestaurant,
  toggleOpenStatus,
} = require('../controllers/restaurantController');

// Add a new restaurant
router.post('/', addRestaurant);

// Get all restaurants
router.get('/', getAllRestaurants);

// Update a restaurant
router.put('/:id', updateRestaurant);

// Toggle open status
router.put('/:id/open', toggleOpenStatus);

module.exports = router;
