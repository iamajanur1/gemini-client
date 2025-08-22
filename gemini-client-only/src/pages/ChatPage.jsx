import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import MessageInput from "../components/MessageInput.jsx";
import { sendToGemini } from "../geminiClient.js";
import { deriveTitle, loadChats, saveChats, createChat } from "../storage.js";
import "../App.css";
export default function ChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [allChats, setAllChats] = useState(() => loadChats());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Ensure a chat exists for this id; if not, create and redirect.
  useEffect(() => {
    const exists = allChats.find((c) => c.id === id);
    if (!exists && id) {
      const c = createChat();
      c.id = id; // adopt requested id
      const next = [c, ...allChats];
      setAllChats(next);
      saveChats(next);
    }
  }, [id]); // eslint-disable-line

  const chat = useMemo(() => allChats.find((c) => c.id === id), [allChats, id]);

  const updateChat = (updater) => {
    setAllChats((prev) => {
      const next = prev.map((c) => (c.id === id ? updater(c) : c));
      saveChats(next);
      return next;
    });
  };

  const handleSend = async (text) => {
    if (!chat || loading) return;
    const prompt = text.trim();
    if (!prompt) return;

    setLoading(true);
    setError("");

    const userMsg = { id: crypto.randomUUID(), role: "user", content: prompt };
    const assistantMsg = { id: crypto.randomUUID(), role: "assistant", content: "", typing: true };

    updateChat((c) => ({
      ...c,
      messages: [...c.messages, userMsg, assistantMsg],
      updatedAt: Date.now(),
      title: c.title === "New chat" ? deriveTitle([...c.messages, userMsg]) : c.title,
    }));

    try {
      const history = chat.messages; // take current snapshot
      const answer = await sendToGemini({ history, userText: prompt });

      updateChat((c) => ({
        ...c,
        messages: c.messages.map((m) =>
          m.id === assistantMsg.id ? { ...m, content: answer || "(no content)", typing: false } : m
        ),
        updatedAt: Date.now(),
      }));
    } catch (e) {
      console.error(e);
      setError("Request failed. Check API key and network.");
      updateChat((c) => ({
        ...c,
        messages: c.messages.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: "Error: failed to get response.", typing: false }
            : m
        ),
        updatedAt: Date.now(),
      }));
      setTimeout(() => setError(""), 3500);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    const c = createChat();
    const next = [c, ...allChats];
    setAllChats(next);
    saveChats(next);
    navigate(`/chat/${c.id}`);
  };

  if (!chat) {
    return (
      <div className="app">
        <header className="header">
          <div className="brand">
            <span className="logo">✨</span>
            <span className="title">Loading chat…</span>
          </div>
          <div className="actions">
            <Link className="btn" to="/">Chats</Link>
          </div>
        </header>
        <main className="chat-window" />
      </div>
    );
  }

  return (
    <div className="app">
      <Header
        loading={loading}
        onNewChat={handleNewChat}
        onBackToChats={() => navigate("/")}
      />
      {error ? <div className="toast error">{error}</div> : null}
      <ChatWindow messages={chat.messages} />
      <MessageInput onSend={handleSend} disabled={loading} />
    </div>
  );
}
