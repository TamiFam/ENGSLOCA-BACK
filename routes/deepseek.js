import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/check-sentence", async (req, res) => {
  const { word, sentence } = req.body;

  try {
    const response = await axios.post(
      "https://api.deepseek.com/v1/chat/completions",
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `Ты - преподаватель английского языка. Ты проверяешь предложения, составленные студентами. 
            Отвечай строго в формате JSON на русском языке. 
            Формат ответа: {"correct": boolean, "correctedSentence": string, "feedback": string}`,
          },
          {
            role: "user",
            content: `Слово: "${word}"
Предложение: "${sentence}"

Проверь:
1. Правильно ли использовано слово в контексте
2. Грамматическую правильность предложения
3. Естественность звучания

Верни ответ в JSON формате на русском языке.`,
          },
        ],
        response_format: { type: "json_object" }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 секунд таймаут
      }
    );

    res.json(JSON.parse(response.data.choices[0].message.content));
  } catch (err) {
    console.error("DeepSeek API error:", err.response?.data || err.message);
    res.status(500).json({ error: "Ошибка при проверке предложения" });
  }
});

export default router;
