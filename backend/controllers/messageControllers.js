const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const redisClient = require("../config/redis");

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const cacheKey = `messages:${chatId}`;

  try {
    let cachedMessages;
    try {
      cachedMessages = await redisClient.get(cacheKey);
    } catch (redisError) {
      console.error("Redis GET messages failed, falling back to MongoDB:", redisError);
    }

    if (cachedMessages) {
      return res.json(JSON.parse(cachedMessages));
    }

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name pic email")
      .populate("chat");

    res.json(messages);

    try {
      await redisClient.set(cacheKey, JSON.stringify(messages), {
        EX: 1800, // Cache for 30 minutes
      });
    } catch (redisError) {
      console.error("Redis SET messages failed:", redisError);
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  const chatIdString = typeof chatId === "object" ? chatId._id : chatId;

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    // Invalidate message history cache for this chat room
    try {
      await redisClient.del(`messages:${chatIdString}`);
    } catch (redisError) {
      console.error("Redis DEL messages failed:", redisError);
    }

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { allMessages, sendMessage };