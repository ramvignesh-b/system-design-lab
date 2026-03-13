const express = require('express');
const axios = require('axios');
const DistributedCircuitBreaker = require('./DistributedCircuitBreaker');

const app = express();
const PORT = 3001;
const POSTS_API_URL = process.env.POSTS_API_URL || "http://localhost:4001/api/posts";

// Breaker state is shared via Redis so behavior stays consistent if this
// service is scaled to multiple instances.
const postServiceBreaker = new DistributedCircuitBreaker('post-db-api', {
    failureThreshold: 3,
    resetTimeout: 10000
});

app.get('/api/feed', async (req, res) => {
    try {
        const requestFunction = async () => {
            const response = await axios.get(POSTS_API_URL, { timeout: 2000 });
            return response.data;
        };

        const result = await postServiceBreaker.fire(requestFunction);

        return res.json({
            message: "User Feed Loaded Successfully!",
            posts: result.data
        });

    } catch (error) {
        // Gotcha: returning a fast fallback here protects API latency when the
        // downstream is unstable. In production, this is where stale cache or a
        // degraded feed would usually be returned.
        return res.status(503).json({
            message: "Feed is currently unavailable. The system detected downstream instability.",
            fallback: "Please enjoy this cached or offline content for now."
        });
    }
});

app.listen(PORT, () => console.log(`Feed Service (API Gateway) running on port ${PORT}`));
