const Redis = require('ioredis');
const fs = require('fs');

const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
});
const CHANNEL_NAME = "system-stats";
const LOG_FILE = "system_metrics.log";

console.log("[LOGGER] System metrics logger started.");

redis.subscribe(CHANNEL_NAME, (err, count) => {
  if (err) {
    console.error("[LOGGER] Failed to subscribe:", err.message);
    return;
  }
  console.log(`[LOGGER] Subscribed to ${count} channel(s). Waiting for metrics...`);
});

redis.on('message', (channel, message) => {
  if (channel === CHANNEL_NAME) {
    const data = JSON.parse(message);
    const logLine = `[${data.timestamp}] CPU: ${data.cpu} | MEM: ${data.memory}%\n`;

    // appendFileSync is fine for this tiny demo. For high-throughput pipelines,
    // use async/batched writes to avoid blocking the event loop.
    fs.appendFileSync(LOG_FILE, logLine);
    process.stdout.write(`[LOGGER] ${logLine}`);
  }
});
