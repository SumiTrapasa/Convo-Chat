import AIMessage from "../models/AIMessage.js";
import { generateChatReply } from "../lib/gemini.js";

const AI_USER_ID = "ai-convo-bot-id";
const MAX_HISTORY_MESSAGES = 50;

const toClientMessage = (message, userId) => ({
  _id: message._id.toString(),
  senderId: message.role === "user" ? userId.toString() : AI_USER_ID,
  receiverId: message.role === "user" ? AI_USER_ID : userId.toString(),
  text: message.text,
  createdAt: message.createdAt.toISOString(),
});

const buildGeminiHistory = (messages) =>
  messages.map(({ role, text }) => ({
    role: role === "user" ? "user" : "model",
    text,
  }));

export const getAIMessages = async (req, res) => {
  try {
    const userId = req.user._id;

    const messages = await AIMessage.find({ userId })
      .sort({ createdAt: 1 })
      .limit(MAX_HISTORY_MESSAGES);

    res.status(200).json(messages.map((msg) => toClientMessage(msg, userId)));
  } catch (error) {
    console.log("Error in getAIMessages:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const sendAIMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user._id;

    if (!text?.trim()) {
      return res.status(400).json({ message: "Text is required." });
    }

    const trimmedText = text.trim();

    const previousMessages = await AIMessage.find({ userId })
      .sort({ createdAt: 1 })
      .limit(MAX_HISTORY_MESSAGES);

    const userMessage = await AIMessage.create({
      userId,
      role: "user",
      text: trimmedText,
    });

    const history = buildGeminiHistory(previousMessages);
    const aiReply = await generateChatReply(history, trimmedText);

    const assistantMessage = await AIMessage.create({
      userId,
      role: "assistant",
      text: aiReply,
    });

    res.status(201).json({
      userMessage: toClientMessage(userMessage, userId),
      aiMessage: toClientMessage(assistantMessage, userId),
    });
  } catch (error) {
    console.log("Error in sendAIMessage:", error.message);

    if (error.message === "GEMINI_API_KEY is not configured") {
      return res.status(503).json({ message: "AI chat is not configured" });
    }

    res.status(500).json({ message: "Failed to generate AI response" });
  }
};

export const clearAIMessages = async (req, res) => {
  try {
    await AIMessage.deleteMany({ userId: req.user._id });
    res.status(200).json({ message: "AI chat history cleared" });
  } catch (error) {
    console.log("Error in clearAIMessages:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
