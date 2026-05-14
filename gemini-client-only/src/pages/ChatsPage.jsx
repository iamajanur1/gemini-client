import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createChat, loadChats, saveChats } from "../storage.js";

function formatTime(ts) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(ts));
}

function getPreview(chat) {
  const message = [...(chat.messages || [])]
    .reverse()
    .find((item) => item.role === "user" || item.role === "assistant");

  return message?.content || "Ready for a new prompt.";
}

export default function ChatsPage() {
  const [chats, setChats] = useState(() => loadChats());
  const navigate = useNavigate();

  const sorted = useMemo(
    () => [...chats].sort((a, b) => b.updatedAt - a.updatedAt),
    [chats]
  );

  const handleNewChat = () => {
    const chat = createChat();
    const nextChats = [chat, ...chats];
    setChats(nextChats);
    saveChats(nextChats);
    navigate(`/chat/${chat.id}`);
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this chat?")) return;

    const nextChats = chats.filter((chat) => chat.id !== id);
    setChats(nextChats);
    saveChats(nextChats);
  };

  return (
    <div className="app chats-app">
      <header className="app-header">
        <div className="brand-mark">
          <span className="brand-icon" aria-hidden="true">G</span>
          <span>
            <span className="brand-title">Gemini Chat</span>
            <span className="brand-subtitle">{sorted.length} saved chats</span>
          </span>
        </div>

        <div className="header-actions">
          <button className="btn primary" type="button" onClick={handleNewChat}>
            <span aria-hidden="true">+</span>
            <span>New</span>
          </button>
        </div>
      </header>

      <main className="chats-view">
        <section className="chats-hero" aria-labelledby="chats-heading">
          <div>
            <p className="section-kicker">Workspace</p>
            <h1 id="chats-heading">Your conversations</h1>
          </div>
          <button className="btn primary hero-action" type="button" onClick={handleNewChat}>
            Start chat
          </button>
        </section>

        {sorted.length === 0 ? (
          <section className="empty-state">
            <p className="section-kicker">No chats yet</p>
            <h2>A clean slate for your next question.</h2>
            <button className="btn primary" type="button" onClick={handleNewChat}>
              Create first chat
            </button>
          </section>
        ) : (
          <ul className="chats-list" aria-label="Saved chats">
            {sorted.map((chat) => (
              <li key={chat.id} className="chats-item">
                <Link className="chat-link" to={`/chat/${chat.id}`}>
                  <span className="chat-title">{chat.title || "New chat"}</span>
                  <span className="chat-preview">{getPreview(chat)}</span>
                  <span className="chat-meta">
                    {formatTime(chat.updatedAt)} - {chat.messages?.length || 0} messages
                  </span>
                </Link>

                <button
                  className="icon-danger"
                  type="button"
                  onClick={() => handleDelete(chat.id)}
                  aria-label={`Delete ${chat.title || "chat"}`}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
