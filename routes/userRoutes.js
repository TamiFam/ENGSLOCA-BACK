import express from "express";
import { getUsersStatus } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { updateLastSeenMiddleware } from "../middleware/updateLastSeenMiddleware.js";

const router = express.Router();

router.get("/status", authMiddleware,updateLastSeenMiddleware, getUsersStatus);

export default router;
