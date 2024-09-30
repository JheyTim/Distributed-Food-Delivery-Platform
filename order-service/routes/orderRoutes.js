const router = require('express').Router();

const {
  placeOrder,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} = require('../controllers/orderController');

// Place a new order
router.post('/place', placeOrder);

// Get order by ID
router.get('/:id', getOrderById);

// Update order status
router.put('/:id/status', updateOrderStatus);

// Cancel an order
router.put('/:id/cancel', cancelOrder);

module.exports = router;
