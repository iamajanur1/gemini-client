const API_ENDPOINT = "/api/chat";
const DIRECT_MODEL = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.5-flash";
const DIRECT_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const REQUEST_TIMEOUT_MS = 60000;

const LOCAL_ASSISTANT_TEXT = new Set([
  "Ready when you are.",
  "New chat started. Ask anything!",
  "Hi! I'm your fast Gemini chat. Ask anything-responses use the flash model.",
]);

export class GeminiRequestError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = "GeminiRequestError";
    this.status = status;
    this.code = code;
  }
}

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function isUsableHistoryMessage(message) {
  if (!message || message.typing) return false;
  if (message.role !== "user" && message.role !== "assistant") return false;

  const text = cleanText(message.content);
  if (!text) return false;
  if (message.role === "assistant" && LOCAL_ASSISTANT_TEXT.has(text)) return false;
  if (message.role === "assistant" && /^Error:/i.test(text)) return false;
  if (message.role === "assistant" && /^I couldn't get a response\./i.test(text)) return false;

  return true;
}

function toGeminiRole(role) {
  return role === "assistant" ? "model" : "user";
}

function normalizeContents(history = [], userText = "") {
  const turns = history
    .filter(isUsableHistoryMessage)
    .map((message) => ({
      role: toGeminiRole(message.role),
      text: cleanText(message.content),
    }));

  turns.push({ role: "user", text: cleanText(userText) });

  while (turns.length && turns[0].role !== "user") {
    turns.shift();
  }

  const merged = [];
  for (const turn of turns) {
    if (!turn.text) continue;
    const previous = merged[merged.length - 1];

    if (previous?.role === turn.role) {
      previous.text = `${previous.text}\n\n${turn.text}`;
    } else {
      merged.push({ ...turn });
    }
  }

  return merged.slice(-24).map((turn) => ({
    role: turn.role,
    parts: [{ text: turn.text }],
  }));
}

async function readApiResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : { error: await response.text() };

  if (!response.ok) {
    throw new GeminiRequestError(
      payload?.error || payload?.message || `Gemini request failed with ${response.status}.`,
      response.status,
      payload?.code
    );
  }

  if (!payload?.text) {
    throw new GeminiRequestError("Gemini returned an empty response.", response.status, "empty_response");
  }

  return payload.text;
}

async function postJson(url, body, headers = {}) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    return await readApiResponse(response);
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new GeminiRequestError("Gemini took too long to respond. Please try again.", 504, "timeout");
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

async function sendViaServer(payload) {
  return postJson(API_ENDPOINT, payload);
}

async function sendViaBrowserFallback(payload) {
  if (!DIRECT_API_KEY) {
    throw new GeminiRequestError(
      "Gemini API key is missing. Add GEMINI_API_KEY in Vercel, then redeploy.",
      500,
      "missing_api_key"
    );
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${DIRECT_MODEL}:generateContent`;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": DIRECT_API_KEY,
      },
      body: JSON.stringify({
        contents: normalizeContents(payload.history, payload.userText),
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
          topP: 0.92,
        },
      }),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new GeminiRequestError(
        data?.error?.message || `Gemini request failed with ${response.status}.`,
        response.status,
        data?.error?.status
      );
    }

    const text = data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();

    if (!text) {
      throw new GeminiRequestError("Gemini returned an empty response.", 502, "empty_response");
    }

    return text;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new GeminiRequestError("Gemini took too long to respond. Please try again.", 504, "timeout");
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function sendToGemini({ history, userText }) {
  const payload = { history, userText };

  try {
    return await sendViaServer(payload);
  } catch (error) {
    if (import.meta.env.DEV && DIRECT_API_KEY) {
      return sendViaBrowserFallback(payload);
    }
    throw error;
  }
}
