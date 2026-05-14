import { useState, useEffect, useRef } from "react";
import { sendMessage } from "../api/chat"; // your real API

export default function ChatWindow() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Ready when you are." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await sendMessage(input);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat">
      <div className="messages">
        {messages.length === 1 ? (
          <div className="empty">
            <h3>Ready when you are.</h3>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              {m.content}
            </div>
          ))
        )}

        {loading && <div className="msg assistant">Thinking...</div>}

        <div ref={bottomRef} />
      </div>

      <div className="input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Gemini..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}