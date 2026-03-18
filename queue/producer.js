const amqp = require('amqplib');

const AMQP_URL = process.env.AMQP_URL || "amqp://localhost";
const QUEUE_NAME = "video_compression_tasks";

async function sendMessages() {
  let connection;
  try {
    connection = await amqp.connect(AMQP_URL);
    const channel = await connection.createChannel();

    // Durable queue keeps queue metadata across broker restarts.
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    console.log(`[PRODUCER] Sending 10 tasks to '${QUEUE_NAME}'...`);

    for (let i = 1; i <= 10; i++) {
      const message = `Please compress video #${i}.mp4`;
      channel.sendToQueue(QUEUE_NAME, Buffer.from(message));
      console.log(`[PRODUCER] Sent: '${message}'`);
    }

    // Small delay gives client library time to flush buffered frames before
    // teardown in short-lived scripts.
    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
  } catch (error) {
    console.error("[PRODUCER] Failed to publish tasks:", error.message);
  }
}

sendMessages();
