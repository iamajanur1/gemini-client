import React from "react";
import { Link } from "react-router-dom";

export default function Header({
  loading = false,
  onNewChat,
  onBackToChats,
  title = "Gemini Chat",
  subtitle = "Gemini 2.5 Flash",
}) {
  return (
    <header className="app-header">
      <button className="brand-mark" type="button" onClick={onBackToChats} aria-label="Open chats">
        <span className="brand-icon" aria-hidden="true">G</span>
        <span>
          <span className="brand-title">{title}</span>
          <span className="brand-subtitle">{subtitle}</span>
        </span>
      </button>

      <nav className="header-actions" aria-label="Chat actions">
        <Link to="/" className="btn secondary">Chats</Link>
        {onNewChat ? (
          <button className="btn primary" type="button" onClick={onNewChat} disabled={loading}>
            <span aria-hidden="true">+</span>
            <span>New</span>
          </button>
        ) : null}
      </nav>
    </header>
  );
}
