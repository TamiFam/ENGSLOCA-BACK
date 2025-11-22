import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/check-sentence", async (req, res) => {
  const { word, sentence } = req.body; // ← ДОБАВЬТЕ ЭТУ СТРОЧКУ!

  // Быстрая проверка на клиенте перед отправкой к AI
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
            content: "Проверь английское предложение. JSON: {correct: boolean, correctedSentence: string, feedback: string}. Русский.",
          },
          {
            role: "user", 
            content: `Слово: "${word}". Предложение: "${sentence}". Проверить грамматику.`,
          },
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

    res.json(JSON.parse(response.data.choices[0].message.content));
  } catch (err) {
    console.error("DeepSeek error:", err.message);
    res.json({ 
      correct: true, 
      correctedSentence: sentence, 
      feedback: "Проверка не удалась. Предположительно правильно." 
    });
  }
});
export default router;
