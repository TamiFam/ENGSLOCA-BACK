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
            content: `ВЕРНИ предложение с выражением "${word}" без изменений.
Исправь только остальные части предложения.

JSON: {correct, correctedSentence, correctedTranslation, feedback}`
          },
          {
            role: "user", 
            content: `Выражение: "${word}". Предложение: "${sentence}".
Проверь, правильно ли использовано выражение в контексте.`,
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 250,
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

    // НОВАЯ проверка (ищет части фразы):
    if (result.correctedSentence) {
      const wordParts = word.toLowerCase().split(' ');
      const sentenceLower = result.correctedSentence.toLowerCase();
      const foundParts = wordParts.filter(part => sentenceLower.includes(part));
      
      // Считаем что выражение сохранено если найдено >50% слов
      if (foundParts.length < wordParts.length * 0.7) {
        console.warn(`⚠️ AI удалил выражение "${word}"! Сохранено только ${foundParts.length}/${wordParts.length} слов`);
        result.correctedSentence = sentence;
        result.feedback = "Ошибка: выражение было изменено при исправлении";
      }
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