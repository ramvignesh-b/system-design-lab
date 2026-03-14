const { Kafka } = require("kafkajs");

const BROKER_LIST = (process.env.KAFKA_BROKERS || "localhost:9092").split(",");
const TOPIC = process.env.KAFKA_TOPIC || "driver-loc";

const kafka = new Kafka({
  clientId: "uber-app",
  brokers: BROKER_LIST,
});

const producer = kafka.producer();

async function sendGPS() {
  try {
    await producer.connect();
    console.log(`[PRODUCER] Connected to Kafka brokers: ${BROKER_LIST.join(",")}`);

    for (let i = 1; i <= 5; i++) {
      const location = `GPS: 40.712${i}, -74.00${i}`;
      await producer.send({
        topic: TOPIC,
        messages: [{ value: location }],
      });
      console.log(`[PRODUCER] Sent to ${TOPIC}: ${location}`);
    }
  } finally {
    // Gotcha: always disconnect, otherwise script exits can leave sockets open
    // and future runs may look "hung" during local experimentation.
    await producer.disconnect();
  }
}

sendGPS().catch((error) => {
  console.error("[PRODUCER] Failed to send GPS events:", error.message);
});
