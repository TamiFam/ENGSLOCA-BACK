import User from "../models/User.js";

export const addTestResult = async (req, res) => {
    console.log("📥 Получен запрос на addTestResult", req.body);
  
    try {
      const { userId, week, score } = req.body;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
  
      console.log("📌 Найден пользователь:", user.username);
      user.testResults.push({ week, score });
      await user.save();
  
      console.log("💾 Результат сохранён:", user.testResults);
      res.json({ message: "Результат добавлен", testResults: user.testResults });
    } catch (err) {
      console.error("Ошибка при добавлении теста:", err);
      res.status(500).json({ message: "Ошибка добавления результата" });
    }
  };

  export const getUserTests = async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json({ testResults: user.testResults || [] });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  

