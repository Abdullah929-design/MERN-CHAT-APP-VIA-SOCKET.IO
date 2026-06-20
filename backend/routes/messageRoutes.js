const express = require("express");
const {
  allMessages,
  sendMessage,
} = require("../controllers/messageControllers");
const { protect } = require("../middleware/authMiddleware");
const { messageLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.route("/:chatId").get(protect, messageLimiter, allMessages);
router.route("/").post(protect, messageLimiter, sendMessage);

module.exports = router;