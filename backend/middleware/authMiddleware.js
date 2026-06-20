const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");
const asyncHandler = require("express-async-handler");
const redisClient = require("../config/redis");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      //decodes token id
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const cacheKey = `user:${decoded.id}`;
      let cachedUser;

      try {
        // 1. Try to fetch the user profile from Redis
        cachedUser = await redisClient.get(cacheKey);
      } catch (redisError) {
        console.error("Redis GET failed, falling back to MongoDB:", redisError);
      }

      if (cachedUser) {
        // 2. Cache Hit: parse user data and assign it to req.user
        req.user = JSON.parse(cachedUser);
      } else {
        // 3. Cache Miss: fetch the user profile from MongoDB
        req.user = await User.findById(decoded.id).select("-password");

        if (req.user) {
          try {
            // 4. Cache the user object in Redis for 1 hour (3600 seconds)
            await redisClient.set(cacheKey, JSON.stringify(req.user), {
              EX: 3600,
            });
          } catch (redisError) {
            console.error("Redis SET failed:", redisError);
          }
        }
      }

      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

module.exports = { protect };