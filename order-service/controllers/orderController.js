const Order = require('../models/Order');
const { processPayment } = require('../services/paymentService');
const { publishOrderPlaced } = require('../utils/rabbitmq');

// Place a new order
exports.placeOrder = async (req, res) => {
  const { customer, restaurant, items, deliveryAddress, paymentMethodId } =
    req.body;

  try {
    // Calculate total amount
    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const newOrder = new Order({
      customer,
      restaurant,
      items,
      totalAmount,
      deliveryAddress,
    });

    await newOrder.save();

    // // Process payment
    // const paymentResponse = await processPayment({
    //   amount: totalAmount * 100, // Stripe requires the amount in cents
    //   paymentMethodId,
    // });

    // if (paymentResponse.error) {
    //   return res
    //     .status(500)
    //     .json({ message: 'Payment failed', error: paymentResponse.error });
    // }

    // Update order payment status if payment is successful
    newOrder.paymentStatus = 'Paid';
    await newOrder.save();

    // Publish the order event to RabbitMQ
    await publishOrderPlaced(newOrder);

    res.status(201).json(newOrder);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get an order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer')
      .populate('restaurant');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const order = await Order.findById(req.params.id).populate('customer');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    await order.save();

    const customerId = order.customer._id;

    // Emit real-time update to the client
    const io = req.app.get('io');
    io.to(customerId.toString()).emit('orderStatusUpdate', {
      orderId: order._id,
      status: order.status,
    });

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Cancel an order
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.status === 'Pending' || order.status === 'Confirmed') {
      order.status = 'Cancelled';
      await order.save();
      res.json(order);
    } else {
      res
        .status(400)
        .json({ message: 'Order cannot be cancelled at this stage' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};
