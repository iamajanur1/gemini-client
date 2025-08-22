import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Header({ loading, onNewChat, onBackToChats }) {
  const [showTip, setShowTip] = useState(false);

  return (
    <header className="header">
      <div className="brand">
        <span className="logo">✨</span>
        <span className="title">Gemini Chat — Flash</span>
      </div>
      <div className="actions">
        <Link to="/" className="btn">Chats</Link>

        <div
          className="icon-btn-wrapper"
          onMouseEnter={() => setShowTip(true)}
          onMouseLeave={() => setShowTip(false)}
        >
          <button
            className="icon-btn"
            aria-label="New chat"
            onClick={onNewChat}
            onFocus={() => setShowTip(true)}
            onBlur={() => setShowTip(false)}
            disabled={loading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          {showTip && <div className="tooltip">New chat</div>}
        </div>
      </div>
    </header>
  );
}
