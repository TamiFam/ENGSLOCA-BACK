import User from "../models/User.js";

export const addTestResult = async (req, res) => {
  try {
    const { userId, week, score } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.testResults.push({ week, score });
    await user.save();

    res.json({ message: "Результат добавлен", testResults: user.testResults });
  } catch (err) {
    console.error("Ошибка при добавлении теста:", err);
    res.status(500).json({ message: "Ошибка добавления результата" });
  }
};


