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
            content: `Ты строгий преподаватель английского. Проверяй предложения на:
1. Грамматику (артикли, предлоги, времена)
2. Правильное использование слова в контексте
3. Естественность звучания

ВОЗВРАЩАЙ ТОЛЬКО JSON: {correct: boolean, correctedSentence: string, feedback: string}
feedback на русском, объясни ошибки если есть.`,
          },
          {
            role: "user", 
            content: `Слово: "${word}". Предложение: "${sentence}". 
Проверь особенно:
- Артикли (a/an/the)
- Предлоги 
- Формы глаголов
- Естественно ли используется слово "${word}"`,
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 120,
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
    res.json(result);
  } catch (err) {
    console.error("DeepSeek error:", err.message);
    // Более консервативный fallback
    res.json({ 
      correct: false, 
      correctedSentence: sentence, 
      feedback: "Проверка не сработала. Перефразируйте предложение." 
    });
  }
});
export default router;
