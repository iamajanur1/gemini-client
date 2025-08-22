import React from "react";

function render(text) {
  if (!text) return null;
  return text.split("\n").map((line, i) => <p key={i}>{line}</p>);
}

export default function MessageBubble({ role, content, typing }) {
  const isUser = role === "user";
  return (
    <div className={`bubble ${isUser ? "user" : "assistant"}`}>
      <div className="avatar">{isUser ? "🧑" : "🤖"}</div>
      <div className="content">
        {typing ? <span className="typing"><i/><i/><i/></span> : render(content)}
      </div>
    </div>
  );
}
