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
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: "Неверный пароль" });

    const token = createToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24,
    });

    res.json({ 
     
      user: { 
        id: user._id, 
        username: user.username, 
        role: user.role 
      } 
    });
  } catch {
    res.status(500).json({ message: "Ошибка входа" });
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