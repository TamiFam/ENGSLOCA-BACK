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
    console.log(`🔍 Checking: "${word}" in "${sentence}"`); // Логируем запрос
    
    const response = await axios.post(
      "https://api.deepseek.com/v1/chat/completions",
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "Проверь английское предложение. Верни JSON: {correct, correctedSentence, correctedTranslation, feedback}. Не меняй исходное слово."
          },
          {
            role: "user", 
            content: `Слово: ${word}. Предложение: ${sentence}.`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 100,
        temperature: 0,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        timeout: 10000, // 10 секунд
      }
    );

    console.log("✅ AI Response:", response.data); // Логируем ответ
    
    const result = JSON.parse(response.data.choices[0].message.content);
    
    const finalResult = {
      correct: result.correct || false,
      correctedSentence: result.correctedSentence || sentence,
      correctedTranslation: result.correctedTranslation || "[Перевод не предоставлен]",
      feedback: result.feedback || "Проверка завершена"
    };
    
    res.json(finalResult);
    
  } catch (err) {
    console.error("❌ DeepSeek error:", err.message);
    console.error("📋 Error details:", err.response?.data);
    
    // ПРОСТОЙ fallback БЕЗ автоисправлений
    res.json({ 
      correct: false, 
      correctedSentence: sentence, // ← оставляем исходное предложение
      correctedTranslation: "[Перевод недоступен]",
      feedback: "Ошибка проверки. Попробуйте другое предложение." 
    });
  }
});

export default router;