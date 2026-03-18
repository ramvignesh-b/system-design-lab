const amqp = require("amqplib");

async function listenForMessages() {
  try {
    // Connect to the local RabbitMQ container
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    // Ensure the queue exists
    const queue = "video_compression_tasks";
    await channel.assertQueue(queue, { durable: true });

    // Tell RabbitMQ to only give this worker 1 task at a time
    channel.prefetch(1);

    console.log(`📥 Waiting for tasks in '${queue}'. To exit press CTRL+C`);

    channel.consume(queue, (msg) => {
      if (msg !== null) {
        const task = msg.content.toString();
        console.log(`[V] Received: '${task}'`);

        // Instant processing
        setTimeout(() => {
          console.log(`Finished: '${task}'`);
          // Ack the message to RabbitMQ so it can remove it from the queue
          channel.ack(msg);
        }, 100);
      }
    });
  } catch (error) {
    console.error("Failed to connect:", error);
  }
}

listenForMessages();
