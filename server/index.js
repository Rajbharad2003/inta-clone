import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fileUpload from "express-fileupload";
import { Server } from "socket.io";
import { databaseconnection } from "./config/database.js";
import chatRoutes from "./routers/chatRoutes.js";
import messageRoutes from "./routers/messageRoutes.js";
import user from "./routers/user.js";
import cloudinaryConnect from "./utils/cloudinary.js";
import cron from 'node-cron';
import Story from "./model/story.model.js";

dotenv.config();

databaseconnection();
const app = express();

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "https://friends-flock.vercel.app",
  "http://localhost:5173",
  "http://localhost:8080",
  "https://preview--insta-flare-ui.lovable.app",
  "http://localhost:8081",
  "https://lovable.dev/projects/7e835962-dc1a-4b22-ab8e-42cb77263876"
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);
cloudinaryConnect();

app.use("/user", user);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

cron.schedule('*/3 * * * *', async () => {
  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    await Story.deleteMany({ createdAt: { $lt: twentyFourHoursAgo } });
    console.log('Expired stories (24hr) removed.');
  } catch (err) {
    console.error('Error removing expired stories:', err.message);
  }
}, {
  timezone: 'Asia/Kolkata',
});


const port = process.env.PORT || 5555;
const server = app.listen(port, () => {
  console.log(`app is listening on port ${port}`);
});

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  // console.log("Socket headers:", socket.handshake.headers);
  // console.log("Socket auth:", socket.handshake.auth);

  socket.on("setup", (userData) => {
    socket.join(userData._id); // Connect using user ID
    socket.emit("connected");
  });

  socket.on("joinChat", ({ chatId, userId }) => {
    socket.join(chatId);
    socket.join(userId); // ✅ Ensures user joins their personal room
    console.log(`User ${userId} joined chat: ${chatId}`);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stopTyping", (room) => socket.in(room).emit("stopTyping"));

  // socket.on("newMessage", (newMessageRecieved) => {
  //   var chat = newMessageRecieved.chat;

  //   if (!chat.users) return console.log("chat.users not defined");

  //   chat.users.forEach((user) => {
  //     if (user._id === newMessageRecieved.sender._id) return;

  //     socket.in(user._id).emit("messageReceived", newMessageRecieved); // Send to user ID
  //     socket.in(chat._id).emit("messageReceived", newMessageRecieved); // Send to chat ID
  //   });
  // });

  socket.on("newMessage", (newMessageRecieved) => {
    // console.log("in newMessage------------------------");
    const chat = newMessageRecieved.chat;
    if (!chat || !newMessageRecieved.selectedChat || !newMessageRecieved.selectedChat.users) return console.log("chat.users not defined");
    
    const selectedChat = newMessageRecieved.selectedChat;
    // console.log("selectedChat : ", selectedChat);
    // console.log("newMessageRecieved : ", newMessageRecieved);

    selectedChat.users.forEach((user) => {
      if (user._id === newMessageRecieved.sender._id) return;
      socket.to(user._id).emit("messageReceived", newMessageRecieved);
    });
  });
  

  socket.on("disconnect", () => {
    console.log("USER DISCONNECTED");
  });

  // socket.off("setup", (userData) => {
  //   console.log("USER DISCONNECTED");
  //   socket.leave(userData._id);
  // });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});
