
import jwt from 'jsonwebtoken';
import User from "../models/User.js";

// Общая функция для всех типов аутентификации
export const authenticateToken = async (cookies) => {
  const token = cookies?.token;
  if (!token) throw new Error('No token');

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select('-passwordHash');
  if (!user) throw new Error('User not found');

  return {
    id: user._id.toString(),
    username: user.username,
    role: user.role
  };
};

export const parseCookies = (cookieHeader) => {
  const cookies = {};
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      cookies[name] = value;
    });
  }
  return cookies;
};