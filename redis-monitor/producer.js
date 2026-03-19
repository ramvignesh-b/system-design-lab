const Redis = require("ioredis");
const os = require("os");

const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
});
const CHANNEL_NAME = "system-stats";
const PUBLISH_INTERVAL_MS = 2000;

console.log("[PRODUCER] System metrics producer started.");

function getMetrics() {
  const cpus = os.cpus();
  const load = os.loadavg();
  const freeMem = os.freemem();
  const totalMem = os.totalmem();
  const memUsage = ((totalMem - freeMem) / totalMem) * 100;

  return {
    timestamp: new Date().toISOString(),
    cpu: load[0].toFixed(2), // 1-minute load average
    memory: memUsage.toFixed(2),
    uptime: os.uptime(),
  };
}

setInterval(() => {
  const metrics = getMetrics();
  const payload = JSON.stringify(metrics);

  redis
    .publish(CHANNEL_NAME, payload)
    .then((subscribers) => {
      console.log(
        `[PRODUCER] ${metrics.timestamp} published to '${CHANNEL_NAME}'. subscribers=${subscribers}`,
      );
    })
    .catch((err) => {
      console.error("[PRODUCER] Error publishing metrics:", err.message);
    });
}, PUBLISH_INTERVAL_MS);
