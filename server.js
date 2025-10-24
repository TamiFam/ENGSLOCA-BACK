import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import wordRoutes from "./routes/words.js";
import userRoutes from "./routes/userRoutes.js";
import User from "./models/User.js";
dotenv.config();
const app = express();

app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.url} from origin: ${req.headers.origin}`);
  next();
});

app.use(cors({
  origin: [
    "http://localhost:5173",
    'https://wordweek.onrender.com',
    'https://engsloca-back.onrender.com',
  ] ,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/words", wordRoutes);
app.use("/api/users", userRoutes);

// Явная обработка подключения к MongoDB
const connectDB = async () => {
  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    console.log('Connection string:', process.env.MONGO_URI ? 'exists' : 'missing');
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected successfully');
    await User.syncIndexes(); // 👈 ЭТА СТРОКА ПЕРЕСОЗДАЕТ ИНДЕКСЫ
  console.log('✅ Database indexes synced');
    
    app.listen(process.env.PORT, () =>
      console.log(`🚀 Server running on port ${process.env.PORT}`)
    );
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

connectDB();