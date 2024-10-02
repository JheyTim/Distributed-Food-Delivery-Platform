const amqp = require('amqplib');
const Order = require('../models/Order')

let channel;

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect('amqp://localhost');
    channel = await connection.createChannel();
    await channel.assertExchange('order_exchange', 'fanout', {
      durable: false,
    });
  } catch (err) {
    console.error('Error connecting to RabbitMQ:', err);
  }
};

const publishOrderPlaced = async (order) => {
  if (!channel) {
    console.error('No RabbitMQ channel available');
    return;
  }

  const orderMessage = JSON.stringify({
    orderId: order._id,
    restaurantId: order.restaurant,
    customerId: order.customer,
    items: order.items,
  });

  channel.publish('order_exchange', '', Buffer.from(orderMessage));
  console.log(`Order placed message sent: ${orderMessage}`);
};

const consumeOrderValidated = async () => {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  await channel.assertExchange('order_response_exchange', 'fanout', {
    durable: false,
  });

  const q = await channel.assertQueue('', { exclusive: true });
  console.log(`Waiting for validation messages in queue: ${q.queue}`);
  channel.bindQueue(q.queue, 'order_response_exchange', '');

  channel.consume(
    q.queue,
    async (msg) => {
      if (msg.content) {
        const validationResponse = JSON.parse(msg.content.toString());
        console.log(`Received order validation: ${validationResponse.orderId}`);

        // Update the order status based on validation
        await Order.findByIdAndUpdate(validationResponse.orderId, {
          status: 'Validated',
        });
        console.log(
          `Order ${validationResponse.orderId} status updated to Validated.`
        );
      }
    },
    { noAck: true }
  );
};

module.exports = { connectRabbitMQ, publishOrderPlaced, consumeOrderValidated };
