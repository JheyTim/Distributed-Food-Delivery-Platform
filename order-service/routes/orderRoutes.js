const router = require('express').Router();

const {
  placeOrder,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} = require('../controllers/orderController');
const { processPayment } = require('../services/paymentService');
const authMiddleware = require('../middlewares/authMiddleware');

// Place a new order
router.post('/place', authMiddleware, placeOrder);

// Get order by ID
router.get('/:id', getOrderById);

// Update order status
router.put('/:id/status', updateOrderStatus);

// Cancel an order
router.put('/:id/cancel', cancelOrder);

// Process payment for an order
router.post('/payment', authMiddleware, processPayment);

module.exports = router;
