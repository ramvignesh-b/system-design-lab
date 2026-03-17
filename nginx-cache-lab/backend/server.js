const express = require("express");
const app = express();
const PORT = 3000;
const RESPONSE_DELAY_MS = 3000;

app.get("/api/data", (req, res) => {
  const startedAt = Date.now();
  console.log(`[BACKEND] Request received. Simulating ${RESPONSE_DELAY_MS}ms work.`);

  setTimeout(() => {
    res.json({
      message: "Hello from the slow backend API!",
      timestamp: new Date().toISOString(),
      simulatedDelayMs: RESPONSE_DELAY_MS,
    });
    console.log(`[BACKEND] Response sent in ${Date.now() - startedAt}ms.`);
  }, RESPONSE_DELAY_MS);
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
