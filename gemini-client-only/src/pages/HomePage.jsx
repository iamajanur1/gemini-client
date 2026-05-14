import { useNavigate } from "react-router-dom";
import { createNewChat, getChats } from "../utils/chatStore";

export default function HomePage() {
  const navigate = useNavigate();
  const chats = getChats();

  const handleStart = () => {
    const chat = createNewChat();
    navigate(`/chat/${chat.id}`);
  };

  const quickPrompts = [
    "Help me write code",
    "Explain something simply",
    "Plan a project",
    "Draft a message",
  ];

  return (
    <div className="home-page">
      <section className="hero-card">
        <div className="hero-kicker">WORKSPACE</div>
        <h1>Where should we start?</h1>
        <p>
          A clean, calm workspace for fast answers, focused writing, and
          natural chat flow.
        </p>

        <div className="hero-actions">
          <button className="primary-action" onClick={handleStart}>
            Start chat
          </button>
          <button className="secondary-action" onClick={handleStart}>
            Create first chat
          </button>
        </div>

        <div className="prompt-grid">
          {quickPrompts.map((item) => (
            <button key={item} className="prompt-chip" onClick={handleStart}>
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="home-summary">
        <div className="summary-title">Your conversations</div>
        <div className="summary-count">{chats.length} saved chats</div>
      </section>
    </div>
  );
}