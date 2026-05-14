import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { getChatById } from "../../utils/chatStore";

export default function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const chatId = location.pathname.startsWith("/chat/")
    ? location.pathname.split("/chat/")[1]
    : null;

  const chat = chatId ? getChatById(chatId) : null;

  return (
    <header className="topbar">
      <div className="topbar-left">
        {chatId ? (
          <button className="back-btn" onClick={() => navigate("/")}>
            <ArrowLeft size={18} />
          </button>
        ) : null}

        <div className="topbar-title-wrap">
          <div className="topbar-title">
            {chat ? chat.title : "Gemini"}
          </div>
          <div className="topbar-subtitle">
            {chat ? "Gemini 2.5 Flash" : "Where should we start?"}
          </div>
        </div>
      </div>

      <div className="topbar-actions">
        <button className="pill-btn ghost">
          <Sparkles size={15} />
          <span>Chats</span>
        </button>
        <button className="pill-btn solid" onClick={() => navigate("/")}>
          + New
        </button>
      </div>
    </header>
  );
}