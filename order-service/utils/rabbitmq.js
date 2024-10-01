const amqp = require('amqplib');

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

  const orderMessage = JSON.stringify(order);
  channel.publish('order_exchange', '', Buffer.from(orderMessage));
  console.log(`Order placed message sent: ${orderMessage}`);
};

module.exports = { connectRabbitMQ, publishOrderPlaced };
