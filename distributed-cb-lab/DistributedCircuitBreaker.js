const { createClient } = require("redis");

class DistributedCircuitBreaker {
  constructor(serviceName, options = {}) {
    this.serviceName = serviceName;
    this.failureThreshold = options.failureThreshold || 3;
    this.resetTimeout = options.resetTimeout || 10000;

    // Local in-memory state allows fast checks before touching Redis.
    this.localState = "CLOSED";

    // Primary Redis connection for key/value + publish operations.
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    this.redis = createClient({ url: redisUrl });
    this.redis.connect().catch(console.error);

    // Subscriber connection is separate from command connection. In Redis,
    // subscribe mode blocks normal command flow on that socket.
    try {
      this.subscriber = this.redis.duplicate();
      this.subscriber.connect().then(() => {
        this.subscriber.subscribe(`cb:updates:${this.serviceName}`, (message) => {
          console.log(`[CB][PUBSUB] Received state update: ${message}`);
          this.localState = message;
        });
      });
    } catch (e) {
      console.error("Failed to connect subscriber:", e);
    }

    this.stateKey = `cb:state:${serviceName}`;
    this.failureCountKey = `cb:failures:${serviceName}`;
    this.halfOpenLockKey = `cb:half_open_lock:${serviceName}`;
  }

  async fire(requestFunction) {
    if (this.localState === "OPEN") {
      throw new Error(`[${this.serviceName}] Circuit OPEN. Fast-failing via local state.`);
    }

    if (this.localState === "HALF_OPEN") {
      // Only one instance should probe recovery in HALF_OPEN.
      // Gotcha: if lock handling is broken, all instances can stampede the
      // recovering dependency at once.
      const locked = await this.redis.setNX(this.halfOpenLockKey, "locked");
      if (!locked) {
        throw new Error(
          `[${this.serviceName}] Circuit HALF_OPEN. Another instance is probing.`,
        );
      }
    }

    try {
      const response = await requestFunction();
      await this.onSuccess();
      return response;
    } catch (error) {
      await this.onFailure();
      throw error;
    }
  }

  async onSuccess() {
    const wasHalfOpen = this.localState === "HALF_OPEN";

    this.localState = "CLOSED";

    await this.redis.set(this.stateKey, "CLOSED");
    await this.redis.del(this.failureCountKey);
    await this.redis.del(this.halfOpenLockKey);

    if (wasHalfOpen) {
      console.log("[CB] Recovery probe succeeded. Broadcasting CLOSED.");
      await this.redis.publish(`cb:updates:${this.serviceName}`, "CLOSED");
    }
  }

  async onFailure() {
    const failures = await this.redis.incr(this.failureCountKey);
    console.log(`[CB] ${this.serviceName} failure count: ${failures}`);

    if (failures >= this.failureThreshold) {
      if (this.localState === "CLOSED") {
        console.log("[CB] Threshold crossed. Broadcasting OPEN.");

        this.localState = "OPEN";

        await this.redis.publish(`cb:updates:${this.serviceName}`, "OPEN");
        await this.redis.set(this.stateKey, "OPEN", { PX: this.resetTimeout });

        // After timeout, enter HALF_OPEN explicitly instead of relying only on
        // key expiry. This keeps all app instances in sync about recovery mode.
        setTimeout(async () => {
          console.log("[CB] Reset timeout elapsed. Broadcasting HALF_OPEN.");
          this.localState = "HALF_OPEN";
          await this.redis.publish(`cb:updates:${this.serviceName}`, "HALF_OPEN");
        }, this.resetTimeout);
      }
    }
  }
}

module.exports = DistributedCircuitBreaker;
