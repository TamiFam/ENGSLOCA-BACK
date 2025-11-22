import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/check-sentence", async (req, res) => {
  const { word, sentence } = req.body;

  if (!sentence.trim() || sentence.length < 3) {
    return res.json({ 
      correct: false, 
      correctedSentence: "", 
      feedback: "Предложение слишком короткое" 
    });
  }

  try {
    const response = await axios.post(
      "https://api.deepseek.com/v1/chat/completions",
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "Проверь предложение. JSON: {correct, correctedSentence, correctedTranslation, feedback}" // короче
          },
          {
            role: "user", 
            content: `Слово: "${word}". Предложение: "${sentence}". Исправь, сохраняя слово.` // короче
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 80,
        temperature: 0,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        timeout: 5000,
      }
    );

    const result = JSON.parse(response.data.choices[0].message.content);
    
    // Дополнительная проверка - если correctedSentence пустой, используем исходное
    if (!result.correctedSentence || result.correctedSentence.trim() === '') {
      result.correctedSentence = sentence;
    }
    
    res.json(result);
  } catch (err) {
    console.error("DeepSeek error:", err.message);
    // Умный fallback - пытаемся исправить очевидные ошибки
    const corrected = fixCommonErrors(sentence, word);
    res.json({ 
      correct: false, 
      correctedSentence: corrected, 
      feedback: "Проверка не сработала. Попробуйте добавить артикль 'a' перед словом." 
    });
  }
});

// Простая функция для исправления частых ошибок
function fixCommonErrors(sentence, word) {
  // Если слово без артикля в начале предложения - добавляем "a"
  if (sentence.includes(` ${word}`) && !sentence.includes(`a ${word}`) && !sentence.includes(`the ${word}`)) {
    return sentence.replace(` ${word}`, ` a ${word}`);
  }
  return sentence;
}
export default router;
