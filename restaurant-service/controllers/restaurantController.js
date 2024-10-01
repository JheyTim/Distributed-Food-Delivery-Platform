const Restaurant = require('../models/Restaurant');

// Add a new restaurant
exports.addRestaurant = async (req, res) => {
  const { name, address, menu, openingHours } = req.body;

  try {
    const restaurant = new Restaurant({ name, address, menu, openingHours });
    await restaurant.save();
    res.status(201).json(restaurant);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get all restaurants
exports.getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update a restaurant
exports.updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!restaurant)
      return res.status(404).json({ message: 'Restaurant not found' });
    res.json(restaurant);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Toggle the open status of a restaurant
exports.toggleOpenStatus = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant)
      return res.status(404).json({ message: 'Restaurant not found' });

    restaurant.isOpen = !restaurant.isOpen;
    await restaurant.save();
    res.json({
      message: `Restaurant is now ${restaurant.isOpen ? 'open' : 'closed'}`,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
