import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";

dotenv.config();

const app = express();

// ✅ Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || "*", // Allow your frontend
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// ✅ Example route
app.get("/", (req, res) => {
  res.send("✅ Backend is running successfully!");
});

// ✅ Connect to MongoDB
// const MONGO_URI = process.env.MONGO_URI || "your_local_mongo_url";
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Server setup
const PORT = process.env.PORT || 5000;
const server = createServer(app);

// ✅ Socket.io setup
const io = new SocketServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("⚡ A user connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("❌ A user disconnected:", socket.id);
  });
});

// ✅ Start server (only if not running in Vercel function)
if (process.env.NODE_ENV !== "production") {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

// ✅ Export app for Vercel (important)
export default app;
