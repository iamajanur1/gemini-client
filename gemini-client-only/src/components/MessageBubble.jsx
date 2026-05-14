import React from "react";

function renderText(text) {
  if (!text) return null;

  return text.split("\n").map((line, index) => (
    <p key={`${line}-${index}`}>{line || "\u00a0"}</p>
  ));
}

export default function MessageBubble({ role, content, typing }) {
  const isUser = role === "user";

  return (
    <article className={`message ${isUser ? "message-user" : "message-assistant"}`}>
      <div className="message-avatar" aria-hidden="true">
        {isUser ? "U" : "AI"}
      </div>
      <div className="message-body">
        <div className="message-label">{isUser ? "You" : "Gemini"}</div>
        <div className="message-content">
          {typing ? (
            <span className="typing" aria-label="Gemini is responding">
              <i />
              <i />
              <i />
            </span>
          ) : (
            renderText(content)
          )}
        </div>
      </div>
    </article>
  );
}
