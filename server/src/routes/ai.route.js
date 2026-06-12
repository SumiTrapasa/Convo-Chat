import express from "express";
import {
  clearAIMessages,
  getAIMessages,
  sendAIMessage,
} from "../controllers/ai.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.get("/messages", getAIMessages);
router.post("/chat", sendAIMessage);
router.delete("/messages", clearAIMessages);

export default router;
