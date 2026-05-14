const DEFAULT_MODEL = "gemini-2.5-flash";
const MODEL_NAME = process.env.GEMINI_MODEL || process.env.VITE_GEMINI_MODEL || DEFAULT_MODEL;
const REQUEST_TIMEOUT_MS = 60000;

const LOCAL_ASSISTANT_TEXT = new Set([
  "Ready when you are.",
  "New chat started. Ask anything!",
  "Hi! I'm your fast Gemini chat. Ask anything-responses use the flash model.",
]);

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
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

function normalizeContents(history = [], userText = "") {
  const turns = history
    .filter(isUsableHistoryMessage)
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
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

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  if (typeof req.body === "string") {
    return JSON.parse(req.body || "{}");
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return JSON.parse(raw || "{}");
}

function extractText(data) {
  return (data?.candidates || [])
    .flatMap((candidate) => candidate?.content?.parts || [])
    .map((part) => part?.text || "")
    .join("")
    .trim();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    sendJson(res, 405, { error: "Only POST requests are supported.", code: "method_not_allowed" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    sendJson(res, 500, {
      error: "Gemini API key is not configured. Add GEMINI_API_KEY in Vercel, then redeploy.",
      code: "missing_api_key",
    });
    return;
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch {
    sendJson(res, 400, { error: "Request body must be valid JSON.", code: "invalid_json" });
    return;
  }

  const prompt = cleanText(body?.userText);
  if (!prompt) {
    sendJson(res, 400, { error: "Message text is required.", code: "missing_prompt" });
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: normalizeContents(body?.history, prompt),
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
            topP: 0.92,
          },
        }),
        signal: controller.signal,
      }
    );

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      sendJson(res, response.status, {
        error: data?.error?.message || `Gemini request failed with ${response.status}.`,
        code: data?.error?.status || "gemini_error",
      });
      return;
    }

    const text = extractText(data);
    if (!text) {
      sendJson(res, 502, {
        error: "Gemini returned no text for this message.",
        code: data?.promptFeedback?.blockReason || data?.candidates?.[0]?.finishReason || "empty_response",
      });
      return;
    }

    sendJson(res, 200, { text, model: data?.modelVersion || MODEL_NAME });
  } catch (error) {
    const timedOut = error?.name === "AbortError";
    sendJson(res, timedOut ? 504 : 500, {
      error: timedOut
        ? "Gemini took too long to respond. Please try again."
        : "Unable to reach Gemini right now.",
      code: timedOut ? "timeout" : "network_error",
    });
  } finally {
    clearTimeout(timeout);
  }
}
