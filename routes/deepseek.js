import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/check-sentence", async (req, res) => {
  const { word, sentence } = req.body;

  if (!sentence.trim() || sentence.length < 3) {
    return res.json({ 
      correct: false, 
      correctedSentence: "", 
      correctedTranslation: "",
      feedback: "Предложение слишком короткое" 
    });
  }

  try {
    console.log(`🔍 Checking: "${word}" in "${sentence}"`);
    
    const response = await axios.post(
      "https://api.deepseek.com/v1/chat/completions",
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `Проверь английское предложение. 
          ЖЁСТКИЕ ПРАВИЛА:
          1. correctedSentence ДОЛЖНО содержать слово "${word}" без изменений!
          2. Если слово используется неправильно - измени контекст вокруг него
          3. НИКОГДА не заменяй слово "${word}" синонимами!
          4. feedback на русском языке
          5. correctedTranslation - перевод на русский
          
          Верни JSON: {correct: boolean, correctedSentence: string, correctedTranslation: string, feedback: string}`
          },
          {
            role: "user", 
            content: `Слово: "${word}". Предложение: "${sentence}".
          Исправь грамматику и контекст, но слово "${word}" должно остаться неизменным в предложении.`,
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 150,
        temperature: 0,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        timeout: 12000,
      }
    );

    console.log("✅ AI Response received");
    console.log("Finish reason:", response.data.choices[0].finish_reason);
    
    const messageContent = response.data.choices[0].message.content;
    console.log("Raw message:", messageContent);

    // Пробуем починить обрезанный JSON
    let result;
    try {
      result = JSON.parse(messageContent);
    } catch (parseError) {
      console.error("❌ JSON parse error, trying to fix...");
      
      // Пытаемся починить обрезанный JSON
      const fixedJson = fixTruncatedJson(messageContent);
      try {
        result = JSON.parse(fixedJson);
        console.log("✅ Fixed JSON successfully");
      } catch (secondError) {
        console.error("❌ Could not fix JSON, using fallback");
        result = { 
          correct: false, 
          correctedSentence: sentence, 
          correctedTranslation: "[Ошибка парсинга]",
          feedback: "Ошибка при проверке" 
        };
      }
    }

    // Проверяем, что слово осталось в исправленном предложении
    if (result.correctedSentence && !result.correctedSentence.includes(word)) {
      console.warn(`⚠️ AI удалил слово "${word}"!`);
      result.correctedSentence = sentence; // Возвращаем исходное
      result.feedback = "Ошибка: слово было удалено при исправлении";
    }

    res.json({
      correct: result.correct || false,
      correctedSentence: result.correctedSentence || sentence,
      correctedTranslation: result.correctedTranslation || "[Перевод не предоставлен]",
      feedback: result.feedback || "Проверка завершена"
    });
    
  } catch (err) {
    console.error("❌ DeepSeek API error:", err.message);
    
    res.json({ 
      correct: false, 
      correctedSentence: sentence,
      correctedTranslation: "[Перевод недоступен]",
      feedback: "Сервис проверки временно недоступен" 
    });
  }
});

// Функция для починки обрезанного JSON
function fixTruncatedJson(jsonString) {
  try {
    let fixed = jsonString.trim();
    
    if (!fixed.endsWith('}')) {
      fixed += '"}';
    }
    
    JSON.parse(fixed);
    return fixed;
  } catch {
    return '{"correct": false, "correctedSentence": "", "correctedTranslation": "[Ошибка]", "feedback": "Ошибка проверки"}';
  }
}

export default router;