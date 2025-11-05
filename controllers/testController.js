import User from "../models/User.js";

export const addTestResult = async (req, res) => {
    console.log("📥 Получен запрос на addTestResult", req.body);
  
    try {
      const { userId, week, score } = req.body;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      console.log("📌 Найден пользователь:", user.username);
      
      // ✅ Ищем существующий тест для этой недели
      const existingTestIndex = user.testResults.findIndex(
        test => Number(test.week) === Number(week)
      );

      if (existingTestIndex !== -1) {
        // ✅ ОБНОВЛЯЕМ существующий тест
        console.log(`🔄 Обновляем тест для недели ${week}, был: ${user.testResults[existingTestIndex].score}, новый: ${score}`);
        user.testResults[existingTestIndex].score = score;
      } else {
        // ✅ ДОБАВЛЯЕМ новый тест
        console.log(`🆕 Добавляем тест для недели ${week} с score: ${score}`);
        user.testResults.push({ week, score });
      }

      await user.save();

      // ✅ Возвращаем только последние результаты для каждой недели
      const latestResults = getLatestTestResults(user.testResults);
      console.log("💾 Фильтрованные результаты:", latestResults);
      
      res.json({ message: "Результат добавлен", testResults: latestResults });
    } catch (err) {
      console.error("Ошибка при добавлении теста:", err);
      res.status(500).json({ message: "Ошибка добавления результата" });
    }
};

// ✅ Функция для получения только последних результатов каждой недели
function getLatestTestResults(testResults) {
  const weekMap = new Map();
  
  testResults.forEach(test => {
    const week = Number(test.week);
    const existing = weekMap.get(week);
    
    if (!existing || new Date(test.date) > new Date(existing.date)) {
      weekMap.set(week, test);
    }
  });
  
  return Array.from(weekMap.values());
}

export const getUserTests = async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      
      // ✅ Возвращаем только последние результаты для каждой недели
      const latestResults = getLatestTestResults(user.testResults || []);
      
      res.json({ testResults: latestResults });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
};