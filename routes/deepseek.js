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
    const response = await axios.post(
      "https://api.deepseek.com/v1/chat/completions",
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `Проверь английское предложение на:
          1. Грамматику
          2. Естественность звучания
          3. Правильное использование слова
          
          Верни JSON: {correct, correctedSentence, correctedTranslation, feedback}
          Не меняй исходное слово, но исправляй предложение чтобы оно звучало естественно.`
          },
          {
            role: "user", 
            content: `Слово: ${word}. Предложение: ${sentence}.`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 110,
        temperature: 0,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        timeout: 8000,
      }
    );

    const result = JSON.parse(response.data.choices[0].message.content);
    
    // Дополнительная проверка всех полей
    if (!result.correctedSentence || result.correctedSentence.trim() === '') {
      result.correctedSentence = sentence;
    }
    if (!result.correctedTranslation || result.correctedTranslation.trim() === '') {
      result.correctedTranslation = "[Перевод не предоставлен]";
    }
    
    res.json(result);
  } catch (err) {
    console.error("DeepSeek error:", err.message);
    const corrected = fixCommonErrors(sentence, word);
    res.json({ 
      correct: false, 
      correctedSentence: corrected, 
      correctedTranslation: "[Перевод недоступен]",
      feedback: "Проверка не сработала. Попробуйте добавить артикль 'a' перед словом." 
    });
  }
});

// Простая функция для исправления частых ошибок
function fixCommonErrors(sentence, word) {
  if (sentence.includes(` ${word}`) && !sentence.includes(`a ${word}`) && !sentence.includes(`the ${word}`)) {
    return sentence.replace(` ${word}`, ` a ${word}`);
  }
  return sentence;
}

export default router;