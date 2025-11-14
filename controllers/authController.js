import bcrypt from 'bcrypt';
import User from "../models/User.js";
import { createToken } from "../utils/createToken.js";

export const register = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: "Пользователь с таким именем уже существует" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      username, 
      passwordHash,
      role: "viewer"
    });

    const token = createToken(user);
       // Ставим HttpOnly cookie
       res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24, // 1 день
      });
    
    res.json({ 
      
      user: { 
        id: user._id, 
        username: user.username, 
        role: user.role 
      } 
    });
    
  } catch (e) {
    res.status(500).json({ message: "Ошибка регистрации" });
  }
};

export const login = async (req, res) => {
  try {
    console.log("=== LOGIN DEBUG ===");
    console.log("req.body:", req.body);
    
    // 👇 ЗАЩИТА ОТ ПУСТОГО BODY
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log("🛑 Empty body detected, skipping...");
      return res.status(400).json({ message: "Пустой запрос" });
    }
    
    const { username, password } = req.body;
    console.log("Username:", username);
    
    if (!username || !password) {
      return res.status(400).json({ message: "Все поля обязательны" });
    }

    const user = await User.findOne({ username });
    console.log("User found:", user ? "YES" : "NO");
    
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    console.log("User ID:", user._id);
    
    const valid = await bcrypt.compare(password, user.passwordHash);
    console.log("Password valid:", valid);
    
    if (!valid) {
      return res.status(401).json({ message: "Неверный пароль" });
    }

    console.log("Creating token...");
    const token = createToken(user);
    console.log("Token created successfully");

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24,
    });

    console.log("Sending response...");
    res.json({ 
      user: { 
        id: user._id, 
        username: user.username, 
        role: user.role 
      } 
    });
    
  } catch (error) {
    console.error("💥 LOGIN ERROR:", error.message);
    res.status(500).json({ message: "Ошибка входа: " + error.message });
  }
};
export const logout = (req, res) => {
  res.clearCookie("token", {
    secure: true,
    sameSite: "none",
    httpOnly: true,
  });
  res.json({ message: "Вы вышли из системы" });
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    res.json(user);
  } catch {
    res.status(500).json({ message: "Ошибка получения данных" });
  }
};