import User from '../models/User.js';

export const updateLastSeenMiddleware = async (req, res, next) => {
  try {
    if (req.user && req.user.id) {
      console.log(`🔄 Updating lastSeen for user: ${req.user.username}`); // 👈 ДОБАВЬ ЛОГ
      await User.findByIdAndUpdate(req.user.id, { lastSeen: new Date() });
    }
  } catch (err) {
    console.error('Ошибка обновления lastSeen:', err);
  }
  next();
};