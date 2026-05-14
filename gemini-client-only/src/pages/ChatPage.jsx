import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getChatById,
  saveChat,
  updateChatTitleFromFirstMessage,
  createNewChat,
} from "../utils/chatStore";
import { sendToGemini } from "../../src/geminiClient";

export default function ChatPage() {
  const { id } = useParams();
  const bottomRef = useRef(null);

  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let existing = getChatById(id);

    if (!existing) {
      existing = createNewChat();
    }

    setChat(existing);
    setMessages(existing.messages || []);
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();

    const text = input.trim();
    if (!text || loading) return;

    const userMsg = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    const updatedChat = {
      ...(chat || {}),
      id,
      title: chat?.title || "New chat",
      messages: nextMessages,
      updatedAt: new Date().toISOString(),
    };

    updateChatTitleFromFirstMessage(updatedChat, text);
    saveChat(updatedChat);

    try {
      const replyText = await sendToGemini({
        history: nextMessages,
        userText: text,
      });

      const assistantMsg = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: replyText,
        createdAt: new Date().toISOString(),
      };

      const finalMessages = [...nextMessages, assistantMsg];
      setMessages(finalMessages);

      saveChat({
        ...updatedChat,
        messages: finalMessages,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      const assistantMsg = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Error: ${error?.message || "failed to get response."}`,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-panel">
        <div className="chat-header-block">
          <div className="chat-avatar">G</div>
          <div>
            <div className="chat-title">{chat?.title || "New chat"}</div>
            <div className="chat-subtitle">Gemini 2.5 Flash</div>
          </div>
        </div>

        <div className="chat-stream">
          {messages.length === 0 ? (
            <div className="chat-empty-state">
              <div className="chat-empty-icon">AI</div>
              <div className="chat-empty-card">
                <h3>Ready when you are.</h3>
                <p>Ask anything. The layout is tuned to feel like Gemini.</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`message-row ${msg.role === "user" ? "user" : "assistant"}`}
              >
                <div className="message-avatar">
                  {msg.role === "user" ? "👤" : "🤖"}
                </div>

                <div className={`message-bubble ${msg.role}`}>
                  {msg.content}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="message-row assistant">
              <div className="message-avatar">🤖</div>
              <div className="message-bubble assistant typing">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <form className="composer-shell" onSubmit={handleSend}>
          <div className="composer-inner">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Gemini anything..."
              className="composer-input"
              rows={1}
            />
            <button type="submit" className="composer-send" disabled={loading}>
              Send
            </button>
          </div>

          <div className="composer-note">
            Gemini-style workspace. Fast responses. Clean, focused UI.
          </div>
        </form>
      </div>
    </div>
  );
}