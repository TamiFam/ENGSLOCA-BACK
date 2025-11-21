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
            content: "You evaluate English sentences created by students.",
          },
          {
            role: "user",
            content: `Word: "${word}"\nSentence: "${sentence}"\nCheck if the word is used correctly and if the sentence is grammatically correct. Reply in JSON: {correct, correctedSentence, feedback}`,
          },
        ],
        response_format: { type: "json_object" }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(JSON.parse(response.data.choices[0].message.content));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DeepSeek error" });
  }
});

export default router;
