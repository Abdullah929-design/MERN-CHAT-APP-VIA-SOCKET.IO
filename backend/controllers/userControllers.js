const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const generateToken = require("../config/generateToken");
const redisClient = require("../config/redis");


//@description     Get or Search all users
//@route           GET /api/user?search=
//@access          Public
const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});

//@description     Register new user
//@route           POST /api/user/
//@access          Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the Feilds");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

//@description     Auth the user
//@route           POST /api/users/login
//@access          Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});

//@description     Get all online users
//@route           GET /api/user/online
//@access          Protected
const getOnlineUsers = asyncHandler(async (req, res) => {
  try {
    const onlineUsers = await redisClient.sMembers("online_users");
    res.json(onlineUsers);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Get contacts and chats for the current user
//@route           GET /api/user/overview
//@access          Protected
const getOverview = asyncHandler(async (req, res) => {
  try {
    const contacts = await User.find({ _id: { $ne: req.user._id } })
      .select("-password")
      .sort({ updatedAt: -1 });

    const chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    const populatedChats = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    res.json({ contacts, chats: populatedChats });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { allUsers, registerUser, authUser, getOnlineUsers, getOverview };