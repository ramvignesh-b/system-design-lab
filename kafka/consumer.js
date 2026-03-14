const { Kafka } = require("kafkajs");

const groupName = process.argv[2] || "billing-service";
const BROKER_LIST = (process.env.KAFKA_BROKERS || "localhost:9092").split(",");
const TOPIC = process.env.KAFKA_TOPIC || "driver-loc";

const kafka = new Kafka({
  clientId: "uber-app",
  brokers: BROKER_LIST,
});

const consumer = kafka.consumer({ groupId: groupName });

async function listenForGPS() {
  await consumer.connect();
  console.log(`[CONSUMER] Connected as group: ${groupName}`);

  // Gotcha: group ID controls offset ownership. A new group starts with its own
  // position and can replay depending on subscription policy.
  await consumer.subscribe({ topic: TOPIC, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ partition, message }) => {
      console.log(
        `[CONSUMER] ${TOPIC} partition=${partition} offset=${message.offset} value=${message.value.toString()}`,
      );
    },
  });
}

listenForGPS().catch((error) => {
  console.error("[CONSUMER] Failed to consume GPS events:", error.message);
});
