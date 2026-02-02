import amqp from "amqplib";
import config from "../config/config.js";

let channel;

// Connect once when server starts
export const connectRabbit = async (serviceQueue) => {
  const connection = await amqp.connect(config.RABBITMQ_URI);
  channel = await connection.createChannel();

  // Common exchange for all services
  await channel.assertExchange("app.events", "topic", { durable: true });

  // Queue for this service
  const q = await channel.assertQueue(serviceQueue, { durable: true });

  // Bind to all events (you can filter later)
  await channel.bindQueue(q.queue, "app.events", "#");

  console.log(`🐰 Music Rabbit ready: ${serviceQueue}`);
};

// Publish event to exchange
export const publishEvent = (routingKey, message) => {
  channel.publish(
    "app.events",
    routingKey,
    Buffer.from(JSON.stringify(message))
  );
};

// Consume events from this service queue
export const consumeEvents = (queueName, callback) => {
  channel.consume(queueName, (msg) => {
    const data = JSON.parse(msg.content.toString());
    callback(data, msg.fields.routingKey);
    channel.ack(msg);
  });
};
