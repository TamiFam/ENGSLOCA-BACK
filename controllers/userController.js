import User from "../models/User.js";

export const getUsersStatus = async (req, res) => {
  try {
    console.log(`📊 Getting users status for: ${req.user.username}`); // 👈 ДОБАВЬ ЛОГ
    
    const users = await User.find({}, "username lastSeen role").lean();

    const now = new Date();
    const FIVE_MINUTES = 5 * 60 * 1000;

    const participants = users.map(u => ({
      id: u._id,
      role: u.role,
      username: u.username,
      lastSeen: u.lastSeen,
      isOnline: u.lastSeen && (now - new Date(u.lastSeen)) <= FIVE_MINUTES,
    }));

    console.log(`👥 Found ${participants.length} users, online: ${participants.filter(p => p.isOnline).length}`); // 👈 ДОБАВЬ ЛОГ
    
    res.json({ participants });
  } catch (err) {
    console.error("Ошибка при получении пользователей:", err);
    res.status(500).json({ message: "Ошибка получения пользователей" });
  }
};