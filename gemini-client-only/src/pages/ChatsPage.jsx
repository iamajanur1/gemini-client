import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createChat, loadChats, saveChats } from "../storage.js";

import "../App.css";

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleString();
}

export default function ChatsPage() {
  const [chats, setChats] = useState(() => loadChats());
  const navigate = useNavigate();

  const sorted = useMemo(
    () => [...chats].sort((a, b) => b.updatedAt - a.updatedAt),
    [chats]
  );

  const handleNewChat = () => {
    const c = createChat();
    const next = [c, ...chats];
    setChats(next);
    saveChats(next);
    navigate(`/chat/${c.id}`);
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this chat?")) return;
    const next = chats.filter((c) => c.id !== id);
    setChats(next);
    saveChats(next);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <span className="logo">✨</span>
          <span className="title">Chats</span>
        </div>
        <div className="actions">
          <button className="btn primary" onClick={handleNewChat}>New chat</button>
        </div>
      </header>

      <main className="chat-window">
        {sorted.length === 0 ? (
          <p style={{ color: "#a9b1c4" }}>No chats yet. Click “New chat”.</p>
        ) : (
          <ul className="chats-list">
            {sorted.map((c) => (
              <li key={c.id} className="chats-item">
                <Link className="chat-link" to={`/chat/${c.id}`}>
                  <div className="chat-title">{c.title || "New chat"}</div>
                  <div className="chat-meta">Updated: {formatTime(c.updatedAt)}</div>
                </Link>
                <button className="btn" onClick={() => handleDelete(c.id)}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
