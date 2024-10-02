const amqp = require('amqplib');
const Restaurant = require('../models/Restaurant');

let channel;

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect('amqp://localhost');
    channel = await connection.createChannel();
    await channel.assertExchange('order_exchange', 'fanout', {
      durable: false,
    });

    const q = await channel.assertQueue('', { exclusive: true });
    console.log(`Waiting for messages in queue: ${q.queue}`);
    channel.bindQueue(q.queue, 'order_exchange', '');

    channel.consume(
      q.queue,
      async (msg) => {
        if (msg.content) {
          const order = JSON.parse(msg.content.toString());
          console.log(`Received order message: ${order.orderId}`);
          await processOrder(order);
        }
      },
      { noAck: true }
    );
  } catch (err) {
    console.error('Error connecting to RabbitMQ:', err);
  }
};

const processOrder = async (order) => {
  try {
    const restaurant = await Restaurant.findById(order.restaurantId);

    if (!restaurant) {
      console.log(`Restaurant ${order.restaurantId} not found.`);
      return;
    }

    if (!restaurant.isOpen) {
      console.log(`Restaurant ${order.restaurantId} is closed.`);
      return;
    }

    const unavailableItems = order.items.filter((item) => {
      const menuItem = restaurant.menu.find(
        (menuItem) => menuItem.name === item.foodItem && menuItem.available
      );
      return !menuItem;
    });

    if (unavailableItems.length > 0) {
      console.log(`Some items are unavailable: ${unavailableItems}`);
      return; // Optionally, publish an event or log this
    }

    // If everything is valid, mark the order as validated
    console.log(`Order ${order.orderId} is valid and can be processed.`);
    await publishOrderValidated(order.orderId); // Publish validation event
  } catch (err) {
    console.error(`Error processing order ${order.orderId}:`, err.message);
  }
};

const publishOrderValidated = (orderId) => {
  if (!channel) {
    console.error('No RabbitMQ channel available');
    return;
  }

  const validationMessage = JSON.stringify({
    orderId,
    status: 'validated',
  });

  channel.publish(
    'order_response_exchange',
    '',
    Buffer.from(validationMessage)
  );
  console.log(`Order validation message sent: ${validationMessage}`);
};

module.exports = { connectRabbitMQ };
