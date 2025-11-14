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
    let updated = false
    if (existingTestIndex !== -1) {
      // ✅ СРАВНИВАЕМ результаты - обновляем только если новый результат ЛУЧШЕ
      const existingScore = user.testResults[existingTestIndex].score;
      console.log(`📊 Сравнение результатов: был ${existingScore}%, новый ${score}%`);
      
      if (score > existingScore) {
        // ✅ Обновляем только если новый результат лучше
        console.log(`🔄 Обновляем тест для недели ${week}, был: ${existingScore}%, новый: ${score}%`);
        user.testResults[existingTestIndex].score = score;
        user.testResults[existingTestIndex].date = new Date().toISOString();
        updated = true
      } else {
        // ❌ Новый результат хуже или равен - не обновляем
     
        return res.json({ 
          message: "Результат не улучшен, данные не обновлены", 
          testResults: user.testResults,
          updated: false 
        });
      }
    } else {
      // ✅ ДОБАВЛЯЕМ новый тест (первый результат для этой недели)
      console.log(`🆕 Добавляем тест для недели ${week} с score: ${score}%`);
      user.testResults.push({ 
        week, 
        score,
        date: new Date().toISOString()
      });
      updated = true
    }

    await user.save();
    
    res.json({ 
      message: "Результат добавлен", 
      testResults: user.testResults ,
      updated 
    });
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