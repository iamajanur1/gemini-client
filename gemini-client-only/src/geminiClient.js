import { GoogleGenerativeAI } from "@google/generative-ai";

// CAUTION: key is visible in the browser. Use only for local experiments.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
if (!API_KEY) {
  console.warn("VITE_GEMINI_API_KEY is missing. Set it in .env");
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Fast model for quick responses
// Options: "gemini-1.5-flash" or "gemini-1.5-flash-8b" (even cheaper/faster)
const MODEL_NAME = "gemini-2.0-flash";

export async function sendToGemini({ history, userText }) {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const contents = [
    ...history.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    { role: "user", parts: [{ text: userText }] },
  ];

  const result = await model.generateContent({
    contents,
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 512,
      topP: 0.9,
    },
  });

  return result.response?.text() || "";
}
