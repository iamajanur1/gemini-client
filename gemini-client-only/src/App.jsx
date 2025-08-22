// src/App.jsx
import React, { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import ChatWindow from "./components/ChatWindow.jsx";
import MessageInput from "./components/MessageInput.jsx";
import { sendToGemini } from "./geminiClient.js";

const LS_KEY = "gemini_client_chat_history_v2";

export default function App() {
  const [messages, setMessages] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw
        ? JSON.parse(raw)
        : [
            {
              id: "sys1",
              role: "assistant",
              content:
                "Hi! I’m your fast Gemini chat. Ask anything—responses use the flash model.",
            },
          ];
    } catch {
      return [
        {
          id: "sys1",
          role: "assistant",
          content:
            "Hi! I’m your fast Gemini chat. Ask anything—responses use the flash model.",
        },
      ];
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(messages));
  }, [messages]);

  const handleSend = async (text) => {
    const prompt = text?.trim();
    if (!prompt || loading) return;

    setError("");
    setLoading(true);

    const userMsg = { id: crypto.randomUUID(), role: "user", content: prompt };
    const assistantMsg = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      typing: true, // show loader bubble
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);

    try {
      const answer = await sendToGemini({ history: messages, userText: prompt });
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: answer || "(no content)", typing: false }
            : m
        )
      );
    } catch (e) {
      console.error(e);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? {
                ...m,
                content:
                  "Error: failed to get response. Check API key and network.",
                typing: false,
              }
            : m
        )
      );
      setError("Request failed. Verify VITE_GEMINI_API_KEY and internet.");
      setTimeout(() => setError(""), 3500);
    } finally {
      setLoading(false);
    }
  };

  const newWelcome = {
    id: "sys1",
    role: "assistant",
    content: "New chat started. Ask anything!",
  };

  const handleNewChat = () => {
    setMessages([newWelcome]);
  };

  const handleClear = () => {
    if (!confirm("Clear chat history?")) return;
    setMessages([newWelcome]);
  };

  return (
    <div className="app">
      <Header loading={loading} onClear={handleClear} onNewChat={handleNewChat} />
      {error ? <div className="toast error">{error}</div> : null}
      <ChatWindow messages={messages} />
      <MessageInput onSend={handleSend} disabled={loading} />
    </div>
  );
}
