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
            content: `Ты — преподаватель английского. Работаешь со словом/идиомой: "${word}"
          
ВАЖНЕЙШИЕ ПРАВИЛА:
✅ СЛОВО "${word}" — можно ИЗМЕНЯТЬ ФОРМУ ЧАСТИ РЕЧИ (существительное→прилагательное, глагол→существительное и т.д.)
✅ Можно добавлять артикли, предлоги, изменять окончания
✅ НЕЛЬЗЯ заменять слово синонимами или полностью убирать из предложения
✅ Цель: сделать предложение ГРАММАТИЧЕСКИ ПРАВИЛЬНЫМ и естественным

ФОРМАТ — только JSON:
{
  "correct": true/false,
  "correctedSentence": "исправленное предложение",
  "correctedTranslation": "перевод на русский",
  "feedback": "объяснение что изменено в слове",
  "wordChanges": "конкретные изменения формы слова"
}` // ДОБАВИЛ correctedTranslation в формат
          },
          {
            role: "user", 
            content: `Проверь предложение: "${sentence}"
            
Учти правила использования слова "${word}":
- Можно менять часть речи и форму слова
- Нельзя заменять синонимами
- Сохрани исходный смысл, где это возможно
- Дай перевод исправленного предложения на русский`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 350, // Увеличил для перевода
        temperature: 0,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        timeout: 15000,
      }
    );

    console.log("✅ AI Response received");
    
    const messageContent = response.data.choices[0].message.content;
    console.log("Raw message:", messageContent);

    // Пробуем починить обрезанный JSON
    let result;
    try {
      result = JSON.parse(messageContent);
    } catch (parseError) {
      console.error("❌ JSON parse error, trying to fix...");
      
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
          feedback: "Ошибка при проверке",
          wordChanges: "Не удалось проверить"
        };
      }
    }

    // ОБНОВЛЕННАЯ проверка - ищем корневую основу слова
    if (result.correctedSentence) {
      const wordRoot = getWordRoot(word.toLowerCase());
      const sentenceLower = result.correctedSentence.toLowerCase();
      
      // Ищем корневую основу в предложении
      const hasWordRoot = wordRoot && sentenceLower.includes(wordRoot);
      
      if (!hasWordRoot) {
        console.warn(`⚠️ AI удалил выражение "${word}"!`);
        result.correctedSentence = sentence;
        result.correctedTranslation = "[Выражение было изменено]";
        result.feedback = "Ошибка: выражение было изменено при исправлении";
        result.correct = false;
      }
    }

    // ОБНОВЛЕННЫЙ ответ - вернул correctedTranslation
    res.json({
      correct: result.correct || false,
      correctedSentence: result.correctedSentence || sentence,
      correctedTranslation: result.correctedTranslation || "[Перевод не предоставлен]",
      feedback: result.feedback || "Проверка завершена",
      wordChanges: result.wordChanges || "Форма не изменена"
    });
    
  } catch (err) {
    console.error("❌ DeepSeek API error:", err.message);
    res.json({ 
      correct: false, 
      correctedSentence: sentence,
      correctedTranslation: "[Перевод недоступен]",
      feedback: "Сервис проверки временно недоступен",
      wordChanges: "Не удалось проверить"
    });
  }
});

// Новая функция для поиска корневой основы слова
function getWordRoot(word) {
  // Простая логика - убираем распространенные окончания
  return word
    .replace(/(ity|ness|ous|ly|ing|ed|s)$/, '') // Убираем суффиксы
    .slice(0, 5); // Берем первые 5 символов как основу
}

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
    return '{"correct": false, "correctedSentence": "", "correctedTranslation": "[Ошибка]", "feedback": "Ошибка проверки", "wordChanges": "Не удалось проверить"}';
  }
}

export default router;