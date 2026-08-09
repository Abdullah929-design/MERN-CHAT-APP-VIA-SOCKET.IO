const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  registerUser,
  authUser,
  allUsers,
  getOnlineUsers,
  getOverview,
} = require("../controllers/userControllers");
const { authLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.route("/").get(protect, allUsers).post(authLimiter, registerUser);
router.route("/online").get(protect, getOnlineUsers);
router.route("/overview").get(protect, getOverview);
router.post("/login", authLimiter, authUser);

module.exports = router;