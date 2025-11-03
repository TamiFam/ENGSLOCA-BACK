import express from "express";
import { addTestResult } from "../controllers/testController.js";

const router = express.Router();

router.post("/", addTestResult);


export default router;
