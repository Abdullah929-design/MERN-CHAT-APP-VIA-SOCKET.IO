const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const redisClient = require("../config/redis");

// 1. Strict rate limiter for Login and Register
const authLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to 15 login/registration requests per 15 mins
  message: {
    message: "Too many login or registration attempts. Please try again after 15 minutes."
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the legacy `X-RateLimit-*` headers
});

// 2. Message limiter to prevent spamming chat rooms
const messageLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 messages/fetches per minute
  message: {
    message: "Too many messages/requests. Please slow down and try again in a minute."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, messageLimiter };
