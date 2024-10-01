const amqp = require('amqplib');

const connectRabbitMQ = async () => {
   try {
      const connection = await amqp.connect('amqp://localhost');
      const channel = await connection.createChannel();
      await channel.assertExchange('order_exchange', 'fanout', { durable: false });

      const q = await channel.assertQueue('', { exclusive: true });
      console.log(`Waiting for messages in queue: ${q.queue}`);
      channel.bindQueue(q.queue, 'order_exchange', '');

      channel.consume(q.queue, async (msg) => {
         if (msg.content) {
            const order = JSON.parse(msg.content.toString());
            console.log(`Received order message: ${order._id}`);
            await processOrder(order);
         }
      }, { noAck: true });
   } catch (err) {
      console.error('Error connecting to RabbitMQ:', err);
   }
};

const processOrder = async (order) => {
   // Example: Fetch restaurant details and validate the order
   // (This function can be extended to verify restaurant availability and more)
   console.log(`Processing order for restaurant ${order.restaurant}`);
};

module.exports = { connectRabbitMQ };
