const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const Redis = require("ioredis");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const CHANNEL_NAME = "system-stats";

const redisSub = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
});

const PORT = process.env.PORT || 3000;

redisSub.subscribe(CHANNEL_NAME, (err, count) => {
  if (err) console.error("Failed to subscribe:", err);
  else console.log(`[SERVER] Subscribed to ${count} channel(s).`);
});

redisSub.on("message", (channel, message) => {
  if (channel === CHANNEL_NAME) {
    // Gotcha: broadcast loops should always check readyState; sending on closed
    // sockets throws and can crash noisy dev sessions.
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
});

app.use(express.static(path.join(__dirname, "public")));

wss.on("connection", (ws) => {
  console.log("[SERVER] Dashboard client connected.");
  ws.send(
    JSON.stringify({ type: "STATUS", message: "Connected to live stream" }),
  );
});

server.listen(PORT, () => {
  console.log(`[SERVER] Listening on http://localhost:${PORT}`);
});
