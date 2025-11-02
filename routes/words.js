import express from "express";
import {
  createWord,
  getWords,
  updateWord,
  deleteWord,
  getAvailableWeeks,
  getWordsByWeek 
} from "../controllers/wordController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { updateLastSeenMiddleware } from "../middleware/updateLastSeenMiddleware.js";

const router = express.Router();

// 📖 GET запросы - доступны без авторизации
router.get("/" ,updateLastSeenMiddleware, getWords);
router.get("/weeks",updateLastSeenMiddleware, getAvailableWeeks); // 👈 Новый маршрут для получения недель
router.get("/week/:week", updateLastSeenMiddleware, getWordsByWeek);

// ✏️ POST, PUT, DELETE запросы - требуют авторизации
router.post("/",authMiddleware,updateLastSeenMiddleware, createWord);   //authMiddleware
router.put("/:id",authMiddleware,updateLastSeenMiddleware, updateWord);   //authMiddleware
router.delete("/:id",authMiddleware,updateLastSeenMiddleware, deleteWord);   //authMiddleware

export default router;