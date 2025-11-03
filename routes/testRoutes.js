import express from "express";
import { addTestResult, getUserTests } from "../controllers/testController.js";

const router = express.Router();

router.post("/", addTestResult);
router.get("/:userId",getUserTests);


export default router;
