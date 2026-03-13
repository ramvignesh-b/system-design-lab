const express = require("express");

const app = express();
const PORT = 4001;

// Toggle to simulate a hard downstream outage.
let isCrashed = false;

app.get("/api/posts", (req, res) => {
  if (isCrashed) {
    console.log("[POST-SERVICE] Rejected request: service is manually crashed.");
    return res.status(500).json({ error: "Internal Database Fatal Error." });
  }

  // Gotcha: this random failure path intentionally makes the service flaky even
  // when "healthy", so upstream resilience logic can be exercised.
  if (Math.random() < 0.3) {
    console.log("[POST-SERVICE] Random simulated failure (30% chance).");
    return res.status(500).json({ error: "Random Internal Server Error." });
  }

  console.log("[POST-SERVICE] Successfully returned posts.");
  return res.json({
    data: [
      { id: 1, content: "Hello from the delicate Post Service DB!" },
      { id: 2, content: "System Design is awesome." },
    ],
  });
});

// Admin endpoints to force outage/recovery during experiments.
app.post("/admin/crash", (req, res) => {
  isCrashed = true;
  console.log("[POST-SERVICE] Manual crash enabled.");
  res.send("Post Service Crashed!");
});

app.post("/admin/recover", (req, res) => {
  isCrashed = false;
  console.log("[POST-SERVICE] Manual recovery enabled.");
  res.send("Post Service Recovered!");
});

app.listen(PORT, () =>
  console.log(`Post Service (Downstream DB) running on port ${PORT}`),
);
