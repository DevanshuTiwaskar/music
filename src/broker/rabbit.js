
import amqp from "amqplib";
import config from "../config/config.js";

let channel, connection;

export const connect = async () => {
  connection = await amqp.connect(config.RABBITMQ_URI);
  channel = await connection.createChannel();
  console.log("🐰 Music Service Connected to RabbitMQ");
};

export const subscribrQueue = async (queueName, callback) => {
  if (!channel) {
    await connect();
  }

  await channel.assertQueue(queueName, { durable: true });

  channel.consume(queueName, async (data) => {
    const message = JSON.parse(data.content.toString());
    await callback(message);
    channel.ack(data);
  });
};
