import React, { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble.jsx";

export default function ChatWindow({ messages }) {
  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <main className="chat-window">
      {messages.map((m) => (
        <MessageBubble key={m.id} role={m.role} content={m.content} typing={m.typing} />
      ))}
      <div ref={endRef} />
    </main>
  );
}
