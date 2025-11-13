import express from "express";
import { register, login, getMe,logout } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { updateLastSeenMiddleware } from "../middleware/updateLastSeenMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.get("/me", authMiddleware,updateLastSeenMiddleware, getMe);

export default router;
