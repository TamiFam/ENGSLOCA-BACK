// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import { createServer } from 'http';

import authRoutes from "./routes/auth.js";
import wordRoutes from "./routes/words.js";
import userRoutes from "./routes/userRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import deepseekRouter from "./routes/deepseek.js"
import User from "./models/User.js";
import ChatServer from "./websocket/chatServer.js";

dotenv.config();
const app = express();
const server = createServer(app);

console.log('🚀 Starting server initialization...');

app.use(cors({
  origin: [
    "http://localhost:5173",
    'https://wordweek.onrender.com',
    'http://localhost:5000/api',
    'https://engsloca-back.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie']
}));
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.url} from origin: ${req.headers.origin}`);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/words", wordRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/deepseek", deepseekRouter);

// Инициализируем WebSocket сервер
let chatServer;
const initWebSocket = () => {
  try {
    console.log('🔄 Attempting to initialize WebSocket server...');
    chatServer = new ChatServer(server);
    console.log('✅ WebSocket chat server initialized successfully');
  } catch (error) {
    console.error('❌ WebSocket server initialization failed:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
  }
};

// Явная обработка подключения к MongoDB
const connectDB = async () => {
  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    console.log('Connection string:', process.env.MONGO_URI ? 'exists' : 'missing');
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected successfully');
    await User.syncIndexes();
    console.log('✅ Database indexes synced');

    // Инициализируем WebSocket после подключения к БД
    initWebSocket();
    
    // 🔥 ВАЖНО: Используем server.listen, а не app.listen!
    server.listen(process.env.PORT, () => {
      console.log(`🚀 HTTP Server running on port ${process.env.PORT}`);
      console.log(`🔌 WebSocket should be available on ws://localhost:${process.env.PORT}/ws`);
    });
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

connectDB();