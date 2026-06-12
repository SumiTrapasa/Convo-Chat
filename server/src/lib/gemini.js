import { GoogleGenAI } from "@google/genai";
import { ENV } from "./env.js";

const SYSTEM_INSTRUCTION =
  "You are Convo AI, a friendly and helpful assistant inside a chat app. " +
  "Keep replies concise, natural, and conversational. Use emojis to add personality.";

let aiClient;

const getClient = () => {
  if (!ENV.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY });
  }

  return aiClient;
};

export const generateChatReply = async (history, message, maxRetries = 2) => {
  const ai = getClient();

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const chat = ai.chats.create({
        model: ENV.GEMINI_MODEL,
        config: { systemInstruction: SYSTEM_INSTRUCTION },
        history: history.map(({ role, text }) => ({
          role,
          parts: [{ text }],
        })),
      });

      const response = await chat.sendMessage({ message });
      const reply = response.text?.trim();

      if (!reply) {
        throw new Error("Empty response from Gemini");
      }

      return reply;
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) break;

      const errorMsg = error.message?.toLowerCase() || "";
      const isRetryable =
        errorMsg.includes("429") ||
        errorMsg.includes("503") ||
        errorMsg.includes("overloaded") ||
        errorMsg.includes("quota");

      if (!isRetryable) throw error;

      const waitTime = (attempt + 1) * 2000;
      console.warn(
        `[Gemini] High demand. Retry ${attempt + 1}/${maxRetries} in ${waitTime}ms...`,
      );
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
};
