import { useEffect, useMemo, useRef, useState } from "react";
import { SendHorizonal, Mic, Paperclip } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createNewChat,
  getChatById,
  saveChat,
  updateChatTitleFromFirstMessage,
} from "../utils/chatStore";
import { geminiMockReply } from "../utils/geminiMock";

export default function ChatPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  const currentChat = useMemo(() => getChatById(chatId), [chatId]);

  useEffect(() => {
    if (!currentChat) {
      const newChat = createNewChat();
      navigate(`/chat/${newChat.id}`, { replace: true });
    }
  }, [currentChat, navigate]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState(currentChat?.messages || []);

  useEffect(() => {
    setMessages(currentChat?.messages || []);
  }, [chatId, currentChat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (!currentChat) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setLoading(true);

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);

    const updatedChat = {
      ...currentChat,
      messages: nextMessages,
      updatedAt: new Date().toISOString(),
    };

    updateChatTitleFromFirstMessage(updatedChat, text);
    saveChat(updatedChat);

    try {
      const replyText = await geminiMockReply(text, nextMessages);

      const assistantMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: replyText,
        createdAt: new Date().toISOString(),
      };

      const finalMessages = [...nextMessages, assistantMessage];
      setMessages(finalMessages);

      saveChat({
        ...updatedChat,
        messages: finalMessages,
        updatedAt: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty-state">
            <div className="chat-empty-badge">AI</div>
            <div className="chat-empty-box">
              <div className="chat-empty-title">Ready when you are.</div>
              <div className="chat-empty-text">
                Ask anything. This layout is built to feel closer to Gemini.
              </div>
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

        {loading ? (
          <div className="message-row assistant">
            <div className="message-avatar">🤖</div>
            <div className="message-bubble assistant typing">
              Thinking...
            </div>
          </div>
        ) : null}

        <div ref={bottomRef} />
      </div>

      <form className="chat-composer" onSubmit={handleSend}>
        <button type="button" className="composer-icon-btn" title="Attach">
          <Paperclip size={18} />
        </button>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Gemini anything..."
          className="composer-input"
        />

        <button type="button" className="composer-icon-btn" title="Voice">
          <Mic size={18} />
        </button>

        <button type="submit" className="composer-send-btn" disabled={loading}>
          <SendHorizonal size={16} />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}