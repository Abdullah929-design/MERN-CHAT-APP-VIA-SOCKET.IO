const express=require('express');
const { chats } = require('./data/data');
const connectDB=require("./config/db");
const {notFound,errorHandler}=require("./middleware/errorMiddleware")
const userRoutes=require("./routes/userRoutes")
const chatRoutes=require("./routes/chatRoutes")
const messageRoutes=require("./routes/messageRoutes")
const cors = require("cors");
const dotenv=require('dotenv');
const app=express();
const path = require("path");
const redisClient = require("./config/redis");
const { createAdapter } = require("@socket.io/redis-adapter");


dotenv.config({ path: __dirname + "/.env" });
app.use(cors()); 
app.use(express.json());
connectDB();
console.log("URI:", process.env.MONGO_URI);




app.use('/api/user',userRoutes)
app.use('/api/chat',chatRoutes);
app.use('/api/message',messageRoutes);

//static file for deployment where both server and client are in the same folder

const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));
  app.get("*splat", (req, res) =>
  res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
);
} else {
  app.get("/", (req, res) => {
    res.send("API is running successfully");
  });
}


app.use(notFound)
app.use(errorHandler)

//now this will be used to start the server and also to set up socket.io for real-time communication between the client and the server.
const PORT=process.env.PORT || 5000
const server=app.listen(PORT,console.log(`Backend Server started on port ${PORT}`));

const io=require("socket.io")(server,{
    pingTimeout:60000, // automatic shutdown after 60 seconds of inactivity to save the bandwidth and resources.
    cors:{
        origin:"http://localhost:3000",
    },
});

// Setup Redis Adapter for multi-instance socket synchronization
const pubClient = redisClient;
const subClient = redisClient.duplicate();

subClient.on("error", (err) => console.error("Redis Sub Client Error:", err));
subClient.on("connect", () => console.log("Redis Sub Client connected successfully."));

(async () => {
    try {
        await subClient.connect();
        io.adapter(createAdapter(pubClient, subClient));
        console.log("Socket.io Redis Adapter integrated successfully.");
    } catch (err) {
        console.error("Failed to connect Redis subClient for Socket.io adapter:", err);
    }
})();

//connection
io.on("connection",(socket)=>{
    console.log("Connected to socket.io");

    socket.on("setup", async (userData) => {
        socket.join(userData._id);
        socket.userId = userData._id;
        try {
            await redisClient.sAdd("online_users", userData._id);
            console.log(`User online: ${userData._id}`);
            //just broadcasting to all other users that this user is online, so that they can update their UI accordingly
            socket.broadcast.emit("user_online", userData._id);
        } catch (err) {
            console.error("Redis sAdd error:", err);
        }
        socket.emit("connected");
    });

    socket.on("disconnect", async () => {
        console.log("User Disconnected from Socket");
        if (socket.userId) {
            try {
                await redisClient.sRem("online_users", socket.userId);
                console.log(`User offline: ${socket.userId}`);
                //just broadcasting to all other users that this user is offline, so that they can update their UI accordingly
                socket.broadcast.emit("user_offline", socket.userId);
            } catch (err) {
                console.error("Redis sRem error:", err);
            }
        }
    });


    socket.on("join chat",(room)=>{
    socket.join(room);
    console.log("User Joined Room: "+room);
});

socket.on("new message",(newMessageRecieved)=>{
    var chat=newMessageRecieved.chat;
    if(!chat.users) return console.log("chat.users not defined");

    chat.users.forEach(user=>{
        if(user._id==newMessageRecieved.sender._id) return;
        socket.in(user._id).emit("message recieved",newMessageRecieved);
    });

});

socket.on("typing",(room)=>{
    socket.in(room).emit("typing"); 
});

socket.on("stop typing",(room)=>{
    socket.in(room).emit("stop typing");    
});


});
