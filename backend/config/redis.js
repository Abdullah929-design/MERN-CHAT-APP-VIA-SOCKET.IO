const redis = require("redis");

// Create a Redis client instance
const redisClient = redis.createClient({
  // Use REDIS_URL from .env or default to localhost
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  // Force RESP2 protocol for compatibility with Redis 5.x
  RESP: 2,
});

// Event listeners to handle client-level status
redisClient.on("error", (err) => console.error("Redis Client Error:", err));
redisClient.on("connect", () => console.log("Connected to Redis successfully."));

// Connect asynchronously when this file is first imported
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
  }
})();

module.exports = redisClient;
