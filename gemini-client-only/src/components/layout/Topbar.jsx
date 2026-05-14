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

        <div>
          <div className="topbar-title">
            {chat ? chat.title : "Gemini Chat"}
          </div>
          <div className="topbar-subtitle">
            {chat ? chat.subtitle || "Gemini 2.5 Flash" : "Workspace"}
          </div>
        </div>
      </div>

      <div className="topbar-actions">
        <button className="ghost-pill">
          <Sparkles size={15} />
          <span>Chats</span>
        </button>
        <button className="primary-pill" onClick={() => navigate("/")}>
          + New
        </button>
      </div>
    </header>
  );
}