import React, { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble.jsx";

export default function ChatWindow({ messages }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <main className="chat-window">
      <div className="message-stack">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            role={message.role}
            content={message.content}
            typing={message.typing}
          />
        ))}
      </div>
      <div ref={endRef} />
    </main>
  );
}
