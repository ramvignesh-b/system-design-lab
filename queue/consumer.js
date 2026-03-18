const amqp = require("amqplib");

const AMQP_URL = process.env.AMQP_URL || "amqp://localhost";
const QUEUE_NAME = "video_compression_tasks";
const SHOULD_ACK = process.env.AUTO_ACK !== "false";

async function listenForMessages() {
  try {
    const connection = await amqp.connect(AMQP_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true });

    // Gotcha: prefetch(1) is useful for fairness in demos with variable task
    // durations; otherwise one worker may receive a large burst.
    channel.prefetch(1);

    console.log(`[CONSUMER] Waiting for tasks in '${QUEUE_NAME}'.`);
    console.log(`[CONSUMER] AUTO_ACK=${SHOULD_ACK}`);

    channel.consume(QUEUE_NAME, (msg) => {
      if (msg !== null) {
        const task = msg.content.toString();
        console.log(`[CONSUMER] Received: '${task}'`);

        setTimeout(() => {
          console.log(`[CONSUMER] Finished: '${task}'`);

          // If AUTO_ACK is disabled, messages stay unacked and can be
          // redelivered; this is useful for observing queue behavior.
          if (SHOULD_ACK) {
            channel.ack(msg);
          }
        }, Math.random() * 10000);
      }
    });
  } catch (error) {
    console.error("[CONSUMER] Failed to consume tasks:", error.message);
  }
}

listenForMessages();
